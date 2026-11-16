import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getReservation, purchaseCar } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { carName, formatDate, money, DEPOSIT, DELIVERY_FEE } from '../lib/format';
import { availableSlots, fmtDateTime, purchaseQuote, statusOf, FINANCE_APR, FINANCE_TERMS } from '../lib/reservation';
import CarImage from '../components/car/CarImage';
import SlotPicker from '../components/car/SlotPicker';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Icon from '../components/ui/Icon';
import Plate from '../components/ui/Plate';
import Skeleton from '../components/ui/Skeleton';
import StateMessage from '../components/ui/StateMessage';
import '../components/car/OrderSummary.css';
import './Checkout.css';
import './Purchase.css';

const STEPS = ['Payment', 'Handover', 'Review'];
const EMPLOYMENT = ['Employed full-time', 'Employed part-time', 'Self-employed', 'Retired', 'Other'];

export default function Purchase() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const req = useAsync(() => getReservation(id, user.id), [id, user.id]);
  useDocumentTitle('Buy your car');

  if (req.status === 'error') {
    return (
      <div className="container page">
        <StateMessage tone={req.error.status === 404 ? 'empty' : 'error'} title="This reservation didn’t load" onRetry={req.error.status === 404 ? undefined : req.reload}
          action={<Button variant="secondary" to="/account">Go to your reservations</Button>}>
          {req.error.message}
        </StateMessage>
      </div>
    );
  }
  if (!req.data) return <PurchaseSkeleton />;

  const order = req.data;
  const car = order.cars.find((c) => c.id === params.get('car')) ?? (order.cars.length === 1 ? order.cars[0] : null);
  const status = statusOf(order);

  if (status !== 'active') {
    return (
      <div className="container page">
        <StateMessage
          title={status === 'purchased' ? 'You’ve already bought a car from this reservation' : 'This reservation can’t be bought'}
          action={<Button to={`/reservations/${order.id}`}>View reservation</Button>}
        >
          {status === 'purchased' ? 'Your purchase details are on the reservation page.' : status === 'expired' ? 'The hold has ended and the car is back on sale. You can reserve it again if it’s still available.' : 'This reservation was cancelled.'}
        </StateMessage>
      </div>
    );
  }
  if (!car) {
    return (
      <div className="container page">
        <StateMessage title="Choose which car to buy" action={<Button to={`/reservations/${order.id}`}>Back to reservation</Button>}>
          That car isn’t on this reservation. Pick one from your reservation page.
        </StateMessage>
      </div>
    );
  }
  return <PurchaseFlow order={order} car={car} />;
}

function PurchaseFlow({ order, car }) {
  const { user } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const formRef = useRef();
  const slots = useMemo(() => availableSlots({ maxDays: 7 }), []);
  const others = order.cars.filter((c) => c.id !== car.id);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    method: 'full',
    holder: order.contact.name, routing: '', number: '',
    term: 60, extraDown: 0, income: '', employment: '',
    handover: order.handover.method, address: order.handover.address || '', zip: order.handover.zip || '',
    date: '', time: '',
    agree: false,
  });

  const quote = purchaseQuote({
    price: car.price, deposit: DEPOSIT, delivery: f.handover === 'delivery', deliveryFee: DELIVERY_FEE,
    method: f.method, extraDown: Number(f.extraDown) || 0, term: Number(f.term),
  });

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  const set = (k, transform = (v) => v) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : transform(e.target.value);
    setF((s) => ({ ...s, [k]: v }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };
  const choose = (k, v) => { setF((s) => ({ ...s, [k]: v })); setErrors({}); setSubmitError(null); };
  const focusFirstError = () => requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"], .is-invalid input')?.focus());

  function validate() {
    const e = {};
    if (step === 0 && f.method === 'full') {
      if (!f.holder.trim()) e.holder = 'Enter the name on the account.';
      if (!/^\d{9}$/.test(f.routing)) e.routing = 'Enter the 9-digit routing number.';
      if (!/^\d{4,17}$/.test(f.number)) e.number = 'Enter an account number of 4 to 17 digits.';
    }
    if (step === 0 && f.method === 'finance') {
      if (!(Number(f.income) > 0)) e.income = 'Enter your yearly income before tax.';
      if (!f.employment) e.employment = 'Choose your employment status.';
    }
    if (step === 1) {
      if (!f.date) e.date = 'Choose a day.';
      if (!f.time) e.time = 'Choose a time.';
      if (f.handover === 'delivery') {
        if (!f.address.trim()) e.address = 'Enter the street address for delivery.';
        if (!/^\d{5}$/.test(f.zip)) e.zip = 'Enter a 5-digit ZIP code.';
      }
    }
    if (step === 2 && !f.agree) e.agree = 'Confirm you’ve read the purchase agreement to continue.';
    return e;
  }

  const next = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) { focusFirstError(); return; }
    if (step < 2) { setStep(step + 1); return; }

    setBusy(true);
    setSubmitError(null);
    try {
      await purchaseCar(order.id, user.id, {
        carId: car.id,
        payment: f.method === 'full'
          ? { method: 'full', account: { holder: f.holder, routing: f.routing, number: f.number } }
          : { method: 'finance', term: f.term, extraDown: f.extraDown, income: f.income, employment: f.employment },
        handover: { method: f.handover, address: f.address, zip: f.zip, date: f.date, time: f.time },
      });
      notify(`You bought the ${carName(car)}`);
      navigate(`/reservations/${order.id}`, { replace: true });
    } catch (err) {
      setBusy(false);
      if (err.field === 'number') { setStep(0); setErrors({ number: err.message }); focusFirstError(); }
      else setSubmitError(err);
    }
  };

  const payLabel = f.method === 'full' ? `Buy for ${money(quote.balance)}` : quote.dueAtPurchase > 0 ? `Buy with finance, pay ${money(quote.dueAtPurchase)} now` : 'Buy with finance';

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to={`/reservations/${order.id}`}><Icon name="back" size={16} /> Reservation {order.id}</Link>
      </nav>
      <header className="page-head">
        <h1 className="display">Buy the {car.make} {car.model}</h1>
        <p>Your hold lasts until {fmtDateTime(order.holdEndsAt)}. Your {money(DEPOSIT)} deposit counts toward the price.</p>
      </header>

      <ol className="steps" aria-label="Purchase progress">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            {i < step ? (
              <button type="button" onClick={() => setStep(i)}><span className="steps__n"><Icon name="check" size={14} /></span>{s}</button>
            ) : (
              <span><span className="steps__n">{i + 1}</span>{s}</span>
            )}
          </li>
        ))}
      </ol>

      <div className="checkout">
        <form ref={formRef} className="checkout__form" onSubmit={next} noValidate>
          {submitError && (
            <div className="checkout__alert" role="alert">
              <Icon name="alert" />
              <div className="purchase__alert-body">
                <p>{submitError.message}</p>
                {submitError.field === 'finance' && (
                  <button type="button" className="purchase__alert-link" onClick={() => { setStep(0); setSubmitError(null); }}>Change payment</button>
                )}
              </div>
            </div>
          )}

          {step === 0 && (
            <fieldset className="checkout__step">
              <legend className="checkout__legend title">How do you want to pay?</legend>
              <div className="options" role="radiogroup" aria-label="Payment method">
                {[
                  ['full', 'Pay in full', `Bank transfer of ${money(purchaseQuote({ price: car.price, deposit: DEPOSIT, delivery: f.handover === 'delivery', deliveryFee: DELIVERY_FEE, method: 'full' }).balance)}.`],
                  ['finance', 'Finance', `From about ${money(Math.round(purchaseQuote({ price: car.price, deposit: DEPOSIT, delivery: f.handover === 'delivery', deliveryFee: DELIVERY_FEE, method: 'finance', term: 72 }).monthly))}/mo at ${FINANCE_APR}% APR.`],
                ].map(([v, t, d]) => (
                  <label key={v} className={`option${f.method === v ? ' is-active' : ''}`}>
                    <input type="radio" name="method" value={v} checked={f.method === v} onChange={() => choose('method', v)} />
                    <span className="option__title">{t}</span>
                    <span className="option__desc">{d}</span>
                  </label>
                ))}
              </div>

              {f.method === 'full' ? (
                <>
                  <p className="checkout__help">We pull the transfer when you confirm. Use any numbers; an account ending in 0002 shows a declined transfer.</p>
                  <Field label="Account holder" autoComplete="name" value={f.holder} onChange={set('holder')} error={errors.holder} />
                  <div className="checkout__row">
                    <Field label="Routing number" inputMode="numeric" value={f.routing} onChange={set('routing', (v) => v.replace(/\D/g, '').slice(0, 9))} error={errors.routing} />
                    <Field label="Account number" inputMode="numeric" value={f.number} onChange={set('number', (v) => v.replace(/\D/g, '').slice(0, 17))} error={errors.number} />
                  </div>
                </>
              ) : (
                <>
                  <fieldset className="purchase__terms">
                    <legend>Term</legend>
                    {FINANCE_TERMS.map((t) => (
                      <label key={t} className={`chip${Number(f.term) === t ? ' is-active' : ''}`}>
                        <input type="radio" name="term" value={t} checked={Number(f.term) === t} onChange={() => choose('term', t)} />
                        {t} months
                      </label>
                    ))}
                  </fieldset>
                  <Field
                    label="Extra down payment" type="number" inputMode="numeric" min={0} step={500}
                    hint={`On top of your ${money(DEPOSIT)} deposit. Paid by bank transfer when you confirm.`}
                    value={f.extraDown} onChange={set('extraDown', (v) => (v === '' ? '' : Math.max(0, Math.min(Number(v), quote.balance))))}
                  />
                  <div className="checkout__row">
                    <Field label="Yearly income before tax" type="number" inputMode="numeric" min={0} placeholder="65000" value={f.income} onChange={set('income')} error={errors.income} />
                    <Field label="Employment" as="select" value={f.employment} onChange={set('employment')} error={errors.employment}>
                      <option value="">Choose one</option>
                      {EMPLOYMENT.map((x) => <option key={x}>{x}</option>)}
                    </Field>
                  </div>
                  <div className="purchase__monthly">
                    <span className="purchase__monthly-amount num">{money(Math.round(quote.monthly))}</span>
                    <span className="muted">per month for {f.term} months at {FINANCE_APR}% APR, financing {money(Math.round(quote.financed))}</span>
                  </div>
                  <p className="checkout__help">We decide when you confirm, and it doesn’t affect your credit score. Payments over 15% of your monthly income are declined.</p>
                </>
              )}
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="checkout__step">
              <legend className="checkout__legend title">Handover</legend>
              <p className="checkout__help">Choose when to take the car home. Bring your driver’s license and proof of insurance.</p>
              <div className="options" role="radiogroup" aria-label="Where">
                {[
                  ['pickup', 'Collect from our lot', '1180 Harbor Road. Free.'],
                  ['delivery', 'Deliver to my home', `${money(DELIVERY_FEE)}, added to the balance.`],
                ].map(([v, t, d]) => (
                  <label key={v} className={`option${f.handover === v ? ' is-active' : ''}`}>
                    <input type="radio" name="handover" value={v} checked={f.handover === v} onChange={() => choose('handover', v)} />
                    <span className="option__title">{t}</span>
                    <span className="option__desc">{d}</span>
                  </label>
                ))}
              </div>
              {f.handover === 'delivery' && (
                <div className="checkout__row checkout__row--address">
                  <Field label="Street address" autoComplete="street-address" value={f.address} onChange={set('address')} error={errors.address} />
                  <Field label="ZIP code" inputMode="numeric" autoComplete="postal-code" value={f.zip} onChange={set('zip', (v) => v.replace(/\D/g, '').slice(0, 5))} error={errors.zip} />
                </div>
              )}
              <SlotPicker name="handover" slots={slots} value={{ date: f.date, time: f.time }} onChange={(v) => { setF((s) => ({ ...s, ...v })); setErrors({}); }} errors={errors} />
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="checkout__step">
              <legend className="checkout__legend title">Review and buy</legend>
              <dl className="purchase__review">
                <div><dt>Car</dt><dd>{carName(car)} ({car.stock})</dd></div>
                <div>
                  <dt>Payment</dt>
                  <dd>
                    {f.method === 'full'
                      ? `${money(quote.balance)} by bank transfer from the account ending ${f.number.slice(-4)}`
                      : `${money(Math.round(quote.monthly))}/mo for ${f.term} months at ${FINANCE_APR}% APR${quote.dueAtPurchase ? `, plus ${money(quote.dueAtPurchase)} down today` : ''}`}
                    <button type="button" className="purchase__edit" onClick={() => setStep(0)}>Change</button>
                  </dd>
                </div>
                <div>
                  <dt>Handover</dt>
                  <dd>
                    {formatDate(f.date, { weekday: 'long', month: 'long', day: 'numeric' })} at {f.time}, {f.handover === 'pickup' ? 'collect from our lot' : `delivered to ${f.address}, ${f.zip}`}
                    <button type="button" className="purchase__edit" onClick={() => setStep(1)}>Change</button>
                  </dd>
                </div>
                {others.length > 0 && (
                  <div>
                    <dt>Other cars</dt>
                    <dd>{others.map(carName).join(', ')} will be released and {money(others.length * DEPOSIT)} refunded to the card ending {order.cardLast4}.</dd>
                  </div>
                )}
              </dl>
              <label className={`purchase__agree${errors.agree ? ' is-invalid' : ''}`}>
                <input type="checkbox" checked={f.agree} onChange={set('agree')} aria-invalid={!!errors.agree || undefined} />
                <span>I’ve read the purchase agreement. I understand I can return the car within 7 days of handover for a full refund, minus fees.</span>
              </label>
              {errors.agree && <p className="field__error">{errors.agree}</p>}
            </fieldset>
          )}

          <div className="checkout__nav">
            {step > 0 && <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} disabled={busy}><Icon name="back" size={18} /> Back</Button>}
            <Button type="submit" size="lg" loading={busy} className="checkout__next">
              {step < 2 ? 'Continue' : busy ? 'Completing purchase…' : payLabel}
            </Button>
          </div>
        </form>

        <aside className="summary purchase__summary" aria-label="Price breakdown">
          <CarImage car={car} width={520} />
          <div className="purchase__car">
            <Plate size="sm">{car.stock}</Plate>
            <p className="title">{carName(car)}</p>
          </div>
          <dl className="summary__rows">
            <div><dt>Price</dt><dd className="num">{money(car.price)}</dd></div>
            <div><dt>Deposit paid</dt><dd className="num">−{money(DEPOSIT)}</dd></div>
            <div><dt>Title and registration</dt><dd className="num">{money(quote.docFee)}</dd></div>
            {quote.deliveryFee > 0 && <div><dt>Home delivery</dt><dd className="num">{money(quote.deliveryFee)}</dd></div>}
            {f.method === 'finance' ? (
              <>
                <div><dt>Down today</dt><dd className="num">{money(quote.dueAtPurchase)}</dd></div>
                <div><dt>Financed</dt><dd className="num">{money(Math.round(quote.financed))}</dd></div>
                <div className="summary__due"><dt>Monthly</dt><dd className="num">{money(Math.round(quote.monthly))}</dd></div>
              </>
            ) : (
              <div className="summary__due"><dt>Balance due</dt><dd className="num">{money(quote.balance)}</dd></div>
            )}
          </dl>
          <p className="summary__note">Prices exclude sales tax, which the DMV calculates at registration.</p>
        </aside>
      </div>
    </div>
  );
}

function PurchaseSkeleton() {
  return (
    <div className="container page" aria-busy="true" aria-label="Loading purchase">
      <Skeleton width={160} height={16} />
      <div style={{ marginTop: 24 }}><Skeleton width="min(560px, 90%)" height={72} /></div>
      <div className="checkout" style={{ marginTop: 40 }}>
        <div style={{ display: 'grid', gap: 16 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={56} />)}</div>
        <Skeleton height={320} radius="var(--r-panel)" />
      </div>
    </div>
  );
}
