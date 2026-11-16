import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { createReservation, getCarsByIds } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatDate, money, DEPOSIT, DELIVERY_FEE, HOLD_HOURS } from '../lib/format';
import { availableSlots, DECISION_HOURS, LATEST_TEST_DRIVE_HOURS } from '../lib/reservation';
import SlotPicker from '../components/car/SlotPicker';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Icon from '../components/ui/Icon';
import StateMessage from '../components/ui/StateMessage';
import OrderSummary from '../components/car/OrderSummary';
import './Checkout.css';

const STEPS = ['Your details', 'Test drive', 'Deposit'];
const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function validate(step, f) {
  const e = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter an email like name@example.com.';
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10-digit phone number so we can confirm your test drive.';
  }
  if (step === 1) {
    if (!f.date) e.date = 'Choose a day.';
    if (!f.time) e.time = 'Choose a time.';
    if (f.method === 'delivery') {
      if (!f.address.trim()) e.address = 'Enter the street address for delivery.';
      if (!/^\d{5}$/.test(f.zip)) e.zip = 'Enter a 5-digit ZIP code.';
    }
  }
  if (step === 2) {
    if (!f.cardName.trim()) e.cardName = 'Enter the name shown on the card.';
    if (f.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Enter the 16-digit card number.';
    const [mm, yy] = f.expiry.split('/').map(Number);
    const now = new Date();
    const expired = !mm || !yy || mm > 12 || new Date(2000 + yy, mm) <= now;
    if (expired) e.expiry = 'Enter a future expiry date as MM/YY.';
    if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = 'Enter the 3 or 4 digits on the back.';
  }
  return e;
}

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { user } = useAuth();
  const cart = useCart();
  const notify = useToast();
  const navigate = useNavigate();
  const formRef = useRef();
  const slots = useMemo(() => availableSlots({ until: Date.now() + LATEST_TEST_DRIVE_HOURS * 3600 * 1000 }), []);
  const key = cart.ids.join(',');
  const carsReq = useAsync(() => getCarsByIds(cart.ids), [key]);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [f, setF] = useState({
    name: user.name, email: user.email, phone: user.phone || '',
    method: 'pickup', address: '', zip: '', date: '', time: '',
    cardName: user.name, cardNumber: '', expiry: '', cvc: '',
  });

  if (cart.count === 0 && !submitting) return <Navigate to="/cart" replace />;

  const set = (k, transform = (v) => v) => (e) => {
    setF((s) => ({ ...s, [k]: transform(e.target.value) }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };
  const pick = (k, v) => { setF((s) => ({ ...s, [k]: v })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const focusFirstError = () => requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"], .is-invalid input')?.focus());

  const next = async (e) => {
    e.preventDefault();
    const errs = validate(step, f);
    setErrors(errs);
    if (Object.keys(errs).length) { focusFirstError(); return; }
    if (step < 2) { setStep(step + 1); window.scrollTo({ top: 0 }); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createReservation({
        userId: user.id,
        carIds: cart.ids,
        contact: { name: f.name, email: f.email, phone: f.phone },
        handover: { method: f.method, address: f.address, zip: f.zip, date: f.date, time: f.time },
        card: { number: f.cardNumber },
      });
      cart.clear();
      notify('Reservation confirmed');
      navigate(`/reservations/${order.id}`, { replace: true, state: { justReserved: true } });
    } catch (err) {
      setSubmitting(false);
      if (err.field === 'number') { setErrors({ cardNumber: err.message }); focusFirstError(); }
      else setSubmitError(err.message);
    }
  };

  const cars = carsReq.data;
  const deposit = cart.count * DEPOSIT;

  return (
    <div className="container page">
      <header className="page-head">
        <h1 className="display">Reserve {cart.count === 1 ? 'your car' : `${cart.count} cars`}</h1>
      </header>

      <ol className="steps" aria-label="Checkout progress">
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
              <Icon name="alert" /><p>{submitError}</p>
            </div>
          )}

          {step === 0 && (
            <fieldset className="checkout__step">
              <legend className="checkout__legend title">Your details</legend>
              <p className="checkout__help">We send the inspection report and test drive confirmation here.</p>
              <Field label="Full name" autoComplete="name" value={f.name} onChange={set('name')} error={errors.name} />
              <div className="checkout__row">
                <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
                <Field label="Phone" type="tel" autoComplete="tel" placeholder="(555) 555-0123" value={f.phone} onChange={set('phone')} error={errors.phone} />
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="checkout__step">
              <legend className="checkout__legend title">Test drive</legend>
              <p className="checkout__help">Choose any time in the next 5 days. The car stays held for at least {HOLD_HOURS} hours, and always until {DECISION_HOURS} hours after your test drive. You can reschedule later.</p>

              <div className="options" role="radiogroup" aria-label="Where">
                {[
                  ['pickup', 'At our lot', '1180 Harbor Road. Free.'],
                  ['delivery', 'At your home', `We bring the car to you. ${money(DELIVERY_FEE)}, paid at handover.`],
                ].map(([v, t, d]) => (
                  <label key={v} className={`option${f.method === v ? ' is-active' : ''}`}>
                    <input type="radio" name="method" value={v} checked={f.method === v} onChange={() => pick('method', v)} />
                    <span className="option__title">{t}</span>
                    <span className="option__desc">{d}</span>
                  </label>
                ))}
              </div>

              {f.method === 'delivery' && (
                <div className="checkout__row checkout__row--address">
                  <Field label="Street address" autoComplete="street-address" value={f.address} onChange={set('address')} error={errors.address} />
                  <Field label="ZIP code" inputMode="numeric" autoComplete="postal-code" value={f.zip} onChange={set('zip', (v) => v.replace(/\D/g, '').slice(0, 5))} error={errors.zip} />
                </div>
              )}

              <SlotPicker
                name="checkout"
                slots={slots}
                value={{ date: f.date, time: f.time }}
                onChange={(v) => { setF((s) => ({ ...s, ...v })); setErrors((x) => ({ ...x, date: undefined, time: undefined })); }}
                errors={errors}
              />
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="checkout__step">
              <legend className="checkout__legend title">Pay the deposit</legend>
              <p className="checkout__help">
                {money(deposit)} now. Refunded in full if you cancel before the hold ends. Use any card number; one ending in 0002 shows a declined payment.
              </p>
              <Field label="Name on card" autoComplete="cc-name" value={f.cardName} onChange={set('cardName')} error={errors.cardName} />
              <Field label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={f.cardNumber} onChange={set('cardNumber', formatCard)} error={errors.cardNumber} />
              <div className="checkout__row">
                <Field label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={f.expiry} onChange={set('expiry', formatExpiry)} error={errors.expiry} />
                <Field label="Security code" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={f.cvc} onChange={set('cvc', (v) => v.replace(/\D/g, '').slice(0, 4))} error={errors.cvc} />
              </div>
              <div className="checkout__recap">
                <p><strong>Test drive:</strong> {formatDate(f.date)} at {f.time}, {f.method === 'pickup' ? 'at our lot' : `at ${f.address}`}</p>
                <p><strong>Contact:</strong> {f.email}, {f.phone}</p>
              </div>
            </fieldset>
          )}

          <div className="checkout__nav">
            {step > 0 && <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} disabled={submitting}><Icon name="back" size={18} /> Back</Button>}
            <Button type="submit" size="lg" loading={submitting} className="checkout__next">
              {step < 2 ? 'Continue' : submitting ? 'Paying deposit…' : `Pay ${money(deposit)} deposit`}
            </Button>
          </div>
        </form>

        {carsReq.status === 'error' ? (
          <StateMessage compact tone="error" title="Summary didn’t load" onRetry={carsReq.reload}>{carsReq.error.message}</StateMessage>
        ) : (
          <OrderSummary cars={cars} loading={!cars} delivery={f.method === 'delivery'} showItems />
        )}
      </div>
    </div>
  );
}
