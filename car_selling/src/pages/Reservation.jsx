import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { cancelReservation, extendHold, getReservation, rescheduleTestDrive } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useNow } from '../hooks/useNow';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { carName, formatDate, money, DEPOSIT } from '../lib/format';
import { availableSlots, EXTENSION_HOURS, fmtDateTime, holdEndFor, latestTestDrive, statusOf } from '../lib/reservation';
import CarImage from '../components/car/CarImage';
import SlotPicker from '../components/car/SlotPicker';
import HoldCountdown from '../components/reservation/HoldCountdown';
import ReservationTimeline from '../components/reservation/ReservationTimeline';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Plate from '../components/ui/Plate';
import Skeleton from '../components/ui/Skeleton';
import StateMessage from '../components/ui/StateMessage';
import './Reservation.css';

const STATUS_LABEL = { active: 'Active', purchased: 'Purchased', expired: 'Hold ended', cancelled: 'Cancelled' };

export default function Reservation() {
  const { id } = useParams();
  const { user } = useAuth();
  const { state } = useLocation();
  const req = useAsync(() => getReservation(id, user.id), [id, user.id]);
  const [order, setOrder] = useState(null);
  useEffect(() => { if (req.data) setOrder(req.data); }, [req.data]);
  useDocumentTitle(order ? `Reservation ${order.id}` : 'Reservation');

  if (req.status === 'error') {
    return (
      <div className="container page">
        <StateMessage
          tone={req.error.status === 404 ? 'empty' : 'error'}
          title={req.error.status === 404 ? 'Reservation not found' : 'This reservation didn’t load'}
          onRetry={req.error.status === 404 ? undefined : req.reload}
          action={<Button variant="secondary" to="/account">Go to your reservations</Button>}
        >
          {req.error.message}
        </StateMessage>
      </div>
    );
  }
  if (!order || order.id !== id) return <ReservationSkeleton />;
  return <Detail order={order} onChange={setOrder} justReserved={!!state?.justReserved} />;
}

function Detail({ order, onChange, justReserved }) {
  const now = useNow(5000);
  const status = statusOf(order, now);
  const deposit = money(order.carIds.length * DEPOSIT);
  const one = order.cars.length === 1;

  const bought = order.purchase && order.cars.find((c) => c.id === order.purchase.carId);
  const heading = status === 'purchased'
    ? 'It’s yours.'
    : status === 'cancelled'
    ? 'Reservation cancelled'
    : status === 'expired'
      ? 'This hold has ended'
      : justReserved
        ? (one ? 'It’s yours to test drive.' : 'They’re yours to test drive.')
        : (one ? carName(order.cars[0]) : `${order.cars.length} cars on hold`);

  const lede = status === 'purchased'
    ? `You bought the ${bought ? carName(bought) : 'car'}. ${order.purchase.handover.method === 'pickup' ? 'Collect it' : 'We’ll deliver it'} on ${formatDate(order.purchase.handover.date, { weekday: 'long', month: 'long', day: 'numeric' })} at ${order.purchase.handover.time}.`
    : status === 'cancelled'
    ? `Your ${deposit} deposit is on its way back to the card ending ${order.cardLast4}.`
    : status === 'expired'
      ? `The hold ran out before the sale was completed, so the ${one ? 'car is' : 'cars are'} back on sale and your deposit has been refunded.`
      : justReserved
        ? `We’ve taken a ${deposit} deposit from the card ending ${order.cardLast4} and sent the inspection report to ${order.contact.email}.`
        : `Nobody else can reserve ${one ? 'this car' : 'these cars'} until your hold ends.`;

  return (
    <div className="container page resv">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/account"><Icon name="back" size={16} /> Your reservations</Link>
      </nav>

      <header className="resv__head">
        <div className="resv__ids">
          <Plate>{order.id}</Plate>
          <span className={`resv__status resv__status--${status}`}>{STATUS_LABEL[status]}</span>
        </div>
        <h1 className={`display resv__title${(justReserved && status === 'active') || status === 'purchased' ? ' resv__title--big' : ''}`}>{heading}</h1>
        <p className="resv__lede">{lede}</p>
      </header>

      <div className="resv__grid">
        <div className="resv__main">
          <section aria-labelledby="progress-title">
            <h2 id="progress-title" className="resv__h2 title">Progress</h2>
            <ReservationTimeline order={order} />
          </section>

          <section aria-labelledby="cars-title">
            <h2 id="cars-title" className="resv__h2 title">{one ? 'Your car' : 'Your cars'}</h2>
            {status === 'active' && !one && <p className="resv__hint">Buying one car releases the others on this reservation and refunds their deposit.</p>}
            <ul className="resv__cars">
              {order.cars.map((car) => (
                <li key={car.id} className={order.purchase && order.purchase.carId !== car.id ? 'is-released' : ''}>
                  <CarImage car={car} width={420} />
                  <div>
                    <Plate size="sm">{car.stock}</Plate>
                    <h3 className="title"><Link to={`/cars/${car.id}`}>{carName(car)}</Link></h3>
                    <p className="muted num">
                      {money(car.price)}
                      {status === 'active' && `, ${money(car.price - DEPOSIT)} after your deposit`}
                      {order.purchase?.carId === car.id && ', purchased'}
                      {order.purchase && order.purchase.carId !== car.id && ', released'}
                    </p>
                    {status === 'active' && (
                      <Button size="sm" to={`/reservations/${order.id}/buy?car=${car.id}`} className="resv__buy">Buy this car</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <History order={order} />
        </div>

        <aside className="resv__side" aria-label="Manage reservation">
          {status === 'active' ? (
            <>
              <HoldCountdown order={order} />
              {one ? (
                <Button size="lg" block to={`/reservations/${order.id}/buy?car=${order.cars[0].id}`}>Buy this car</Button>
              ) : (
                <p className="resv__hint">Ready to buy? Choose a car under “Your cars”.</p>
              )}
              <Manage order={order} onChange={onChange} />
            </>
          ) : status === 'purchased' ? (
            <Receipt order={order} car={bought} />
          ) : (
            <div className="resv__closed">
              <p>Still looking? New cars arrive most weeks.</p>
              <Button to="/cars" block>Browse cars</Button>
            </div>
          )}
          <dl className="resv__contact">
            <div><dt>Contact</dt><dd>{order.contact.name}<br />{order.contact.email}<br />{order.contact.phone}</dd></div>
            <div><dt>Questions?</dt><dd><a href="tel:+15550142200">(555) 014-2200</a>, open daily 9am–7pm</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

/** Reschedule, extend and cancel. One panel open at a time. */
function Manage({ order, onChange }) {
  const { user } = useAuth();
  const notify = useToast();
  const [panel, setPanel] = useState(null); // null | 'reschedule' | 'extend' | 'cancel'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [pick, setPick] = useState({ date: '', time: '' });
  const [pickErrors, setPickErrors] = useState({});
  const slots = useMemo(() => availableSlots({ until: latestTestDrive(order) }), [order]);
  const preview = pick.date && pick.time ? holdEndFor(order, pick) : null;
  const previewDiff = preview ? Math.round((new Date(preview) - new Date(order.holdEndsAt)) / 3600000) : 0;

  const open = (p) => { setPanel(p); setError(null); setPickErrors({}); setPick({ date: '', time: '' }); };

  const run = async (fn, message) => {
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      onChange(next);
      notify(message);
      setPanel(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitReschedule = (e) => {
    e.preventDefault();
    const errs = {};
    if (!pick.date) errs.date = 'Choose a day.';
    if (!pick.time) errs.time = 'Choose a time.';
    if (pick.date === order.handover.date && pick.time === order.handover.time) errs.time = 'That’s your current time. Choose a different one.';
    setPickErrors(errs);
    if (Object.keys(errs).length) return;
    run(() => rescheduleTestDrive(order.id, user.id, pick), `Test drive moved to ${formatDate(pick.date)} at ${pick.time}. Hold now ends ${fmtDateTime(holdEndFor(order, pick))}.`);
  };

  return (
    <div className="manage">
      <h2 className="resv__h2 title">Manage</h2>

      <div className={`manage__item${panel === 'reschedule' ? ' is-open' : ''}`}>
        <button className="manage__trigger" aria-expanded={panel === 'reschedule'} onClick={() => open(panel === 'reschedule' ? null : 'reschedule')}>
          <span>
            <strong>Reschedule test drive</strong>
            <small>Now {formatDate(order.handover.date)} at {order.handover.time}</small>
          </span>
          <Icon name="chevron" size={18} />
        </button>
        {panel === 'reschedule' && (
          <form className="manage__panel" onSubmit={submitReschedule} noValidate>
            {slots.length ? (
              <>
                <SlotPicker name="reschedule" slots={slots} value={pick} onChange={(v) => { setPick(v); setPickErrors({}); }} errors={pickErrors} />
                {preview ? (
                  <p className="manage__preview" role="status">
                    Your hold will end <strong>{fmtDateTime(preview)}</strong>
                    {previewDiff !== 0 && ` (${Math.abs(previewDiff)} hours ${previewDiff > 0 ? 'later' : 'earlier'})`}.
                  </p>
                ) : (
                  <p className="manage__note">Test drives can be up to 5 days after you reserved. Your hold is re-estimated to end 24 hours after the new time, and never sooner than 72 hours from booking.</p>
                )}
                {error && <p className="manage__error" role="alert">{error}</p>}
                <div className="manage__actions">
                  <Button type="submit" loading={busy}>{busy ? 'Moving test drive…' : 'Move test drive'}</Button>
                  <Button type="button" variant="ghost" onClick={() => setPanel(null)} disabled={busy}>Keep current time</Button>
                </div>
              </>
            ) : (
              <p className="manage__note">There are no open times left in the 5 days after you reserved. Call us to arrange something else.</p>
            )}
          </form>
        )}
      </div>

      <div className={`manage__item${panel === 'extend' ? ' is-open' : ''}`}>
        <button className="manage__trigger" aria-expanded={panel === 'extend'} onClick={() => open(panel === 'extend' ? null : 'extend')} disabled={order.extended}>
          <span>
            <strong>Extend hold by {EXTENSION_HOURS} hours</strong>
            <small>{order.extended ? 'Already extended. Call us if you need more time.' : 'Free, and you can do it once'}</small>
          </span>
          {!order.extended && <Icon name="chevron" size={18} />}
        </button>
        {panel === 'extend' && (
          <div className="manage__panel">
            <p className="manage__note">
              Your hold will end {fmtDateTime(holdEndFor({ ...order, extended: true }))} instead.
              You can only extend once.
            </p>
            {error && <p className="manage__error" role="alert">{error}</p>}
            <div className="manage__actions">
              <Button loading={busy} onClick={() => run(() => extendHold(order.id, user.id), `Hold extended by ${EXTENSION_HOURS} hours`)}>
                {busy ? 'Extending hold…' : 'Extend hold'}
              </Button>
              <Button variant="ghost" onClick={() => setPanel(null)} disabled={busy}>Not now</Button>
            </div>
          </div>
        )}
      </div>

      <div className={`manage__item manage__item--danger${panel === 'cancel' ? ' is-open' : ''}`}>
        <button className="manage__trigger" aria-expanded={panel === 'cancel'} onClick={() => open(panel === 'cancel' ? null : 'cancel')}>
          <span>
            <strong>Cancel reservation</strong>
            <small>Full {money(order.carIds.length * DEPOSIT)} refund</small>
          </span>
          <Icon name="chevron" size={18} />
        </button>
        {panel === 'cancel' && (
          <div className="manage__panel">
            <p className="manage__note">
              The {order.cars.length === 1 ? 'car goes' : 'cars go'} back on sale straight away and your deposit is refunded to the card ending {order.cardLast4} within 3 business days.
            </p>
            {error && <p className="manage__error" role="alert">{error}</p>}
            <div className="manage__actions">
              <Button variant="danger" loading={busy} onClick={() => run(() => cancelReservation(order.id, user.id), 'Reservation cancelled')}>
                {busy ? 'Cancelling…' : 'Cancel reservation'}
              </Button>
              <Button variant="ghost" onClick={() => setPanel(null)} disabled={busy}>Keep reservation</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Receipt({ order, car }) {
  const p = order.purchase;
  const q = p.quote;
  return (
    <section className="receipt" aria-labelledby="receipt-title">
      <div className="receipt__head">
        <h2 id="receipt-title" className="title">Purchase</h2>
        <Plate size="sm">{p.id}</Plate>
      </div>
      {car && <p className="receipt__car">{carName(car)}</p>}
      <dl className="receipt__rows">
        <div><dt>Price</dt><dd className="num">{money(p.price)}</dd></div>
        <div><dt>Deposit already paid</dt><dd className="num">−{money(p.deposit)}</dd></div>
        <div><dt>Title and registration</dt><dd className="num">{money(q.docFee)}</dd></div>
        {q.deliveryFee > 0 && <div><dt>Home delivery</dt><dd className="num">{money(q.deliveryFee)}</dd></div>}
        {p.method === 'finance' ? (
          <>
            {q.dueAtPurchase > 0 && <div><dt>Extra down payment</dt><dd className="num">{money(q.dueAtPurchase)}</dd></div>}
            <div className="receipt__total"><dt>Financed</dt><dd className="num">{money(Math.round(q.financed))}</dd></div>
            <div><dt>Monthly payment</dt><dd className="num">{money(Math.round(q.monthly))} × {p.term} at {p.apr}% APR</dd></div>
          </>
        ) : (
          <div className="receipt__total"><dt>Paid by bank transfer</dt><dd className="num">{money(q.balance)}</dd></div>
        )}
      </dl>
      <p className="receipt__note">
        {p.method === 'full' ? `From the account ending ${p.accountLast4}. ` : 'Your first payment is due 30 days after handover. '}
        Sales tax is calculated by the DMV when the car is registered. You have 7 days after handover to return it.
      </p>
      <p className="receipt__handover">
        <strong>Handover:</strong> {formatDate(p.handover.date, { weekday: 'long', month: 'long', day: 'numeric' })} at {p.handover.time},{' '}
        {p.handover.method === 'pickup' ? '1180 Harbor Road' : `${p.handover.address}, ${p.handover.zip}`}
      </p>
    </section>
  );
}

const HISTORY_TEXT = {
  created: () => 'Reserved and deposit paid',
  rescheduled: (h) => `Test drive moved from ${formatDate(h.from.date)} at ${h.from.time} to ${formatDate(h.to.date)} at ${h.to.time}${h.holdAfter && h.holdAfter !== h.holdBefore ? `. Hold re-estimated to ${fmtDateTime(h.holdAfter)}` : ''}`,
  extended: () => `Hold extended by ${EXTENSION_HOURS} hours`,
  cancelled: () => 'Reservation cancelled',
  purchased: (h) => `Car purchased${h.released?.length ? `, ${h.released.length} other ${h.released.length === 1 ? 'car' : 'cars'} released` : ''}`,
};

function History({ order }) {
  if (order.history.length < 2) return null;
  return (
    <section aria-labelledby="history-title">
      <h2 id="history-title" className="resv__h2 title">Changes</h2>
      <ul className="resv__history">
        {[...order.history].reverse().map((h, i) => (
          <li key={`${h.type}-${h.at}-${i}`}>
            <span>{HISTORY_TEXT[h.type]?.(h) ?? h.type}</span>
            <time dateTime={h.at} className="muted num">{new Date(h.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReservationSkeleton() {
  return (
    <div className="container page" aria-busy="true" aria-label="Loading reservation">
      <Skeleton width={140} height={28} />
      <div style={{ marginTop: 20 }}><Skeleton width="min(640px, 90%)" height={72} /></div>
      <div className="resv__grid" style={{ marginTop: 40 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={56} />)}
        </div>
        <Skeleton height={180} radius="var(--r-panel)" />
      </div>
    </div>
  );
}
