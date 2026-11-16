import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getCarsByIds, listReservations } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useNow } from '../hooks/useNow';
import { statusOf } from '../lib/reservation';
import HoldCountdown from '../components/reservation/HoldCountdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { useToast } from '../context/ToastContext';
import { carName, formatDate, money, DEPOSIT } from '../lib/format';

const STATUS_LABEL = { active: 'Active', purchased: 'Purchased', expired: 'Hold ended', cancelled: 'Cancelled' };
import CarGrid, { CarGridSkeleton } from '../components/car/CarGrid';
import CarImage from '../components/car/CarImage';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Plate from '../components/ui/Plate';
import Skeleton from '../components/ui/Skeleton';
import StateMessage from '../components/ui/StateMessage';
import './Profile.css';

const TABS = [
  ['reservations', 'Reservations'],
  ['saved', 'Saved cars'],
  ['details', 'Account details'],
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'reservations';
  useDocumentTitle(TABS.find(([k]) => k === tab)[1]);

  const signOut = () => { logout(); navigate('/'); };

  return (
    <div className="container page profile">
      <header className="profile__head">
        <div>
          <h1 className="display profile__name">{user.name}</h1>
          <p className="muted">{user.email}, member since {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={signOut}>Sign out</Button>
      </header>

      <div className="profile__tabs" role="tablist" aria-label="Account sections">
        {TABS.map(([k, label]) => (
          <button
            key={k} role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls={`panel-${k}`}
            className={tab === k ? 'is-active' : ''}
            onClick={() => setParams(k === 'reservations' ? {} : { tab: k })}
          >
            {label}
          </button>
        ))}
      </div>

      <section id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="profile__panel">
        {tab === 'reservations' && <Reservations userId={user.id} />}
        {tab === 'saved' && <Saved />}
        {tab === 'details' && <Details />}
      </section>
    </div>
  );
}

function Reservations({ userId }) {
  const { status, data, error, reload } = useAsync(() => listReservations(userId), [userId]);
  const now = useNow(30000);

  if (status === 'error') return <StateMessage tone="error" title="Reservations didn’t load" onRetry={reload}>{error.message}</StateMessage>;
  if (!data) {
    return (
      <div className="orders" aria-busy="true">
        {[0, 1].map((i) => <div key={i} className="order"><Skeleton height={20} width="40%" /><Skeleton height={90} /></div>)}
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <StateMessage title="No reservations yet" action={<Button to="/cars">Browse cars</Button>}>
        When you reserve a car, its test drive time and hold details show up here.
      </StateMessage>
    );
  }

  // Active holds first, then most recent.
  const sorted = [...data].sort((a, b) =>
    (statusOf(b, now) === 'active') - (statusOf(a, now) === 'active') || b.createdAt.localeCompare(a.createdAt));

  return (
    <ul className="orders">
      {sorted.map((order) => {
        const state = statusOf(order, now);
        return (
          <li key={order.id} className={`order order--${state}`}>
            <div className="order__head">
              <Plate size="sm">{order.id}</Plate>
              <span className="order__status">{STATUS_LABEL[state]}</span>
              <span className="order__date muted">Reserved {formatDate(order.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <ul className="order__cars">
              {order.cars.map((car) => (
                <li key={car.id}>
                  <CarImage car={car} width={300} />
                  <div>
                    <Link to={`/cars/${car.id}`} className="order__car-name title">{carName(car)}</Link>
                    <p className="muted num">{money(car.price)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="order__foot">
              <div>
                {state === 'active' && <HoldCountdown order={order} compact />}
                <p className="muted">
                  {state === 'active'
                    ? `Test drive ${formatDate(order.handover.date)} at ${order.handover.time}, ${order.handover.method === 'pickup' ? 'at our lot' : 'at your home'}`
                    : state === 'purchased'
                      ? `Bought. Handover ${formatDate(order.purchase.handover.date)} at ${order.purchase.handover.time}`
                      : `${money(order.carIds.length * DEPOSIT)} deposit refunded to the card ending ${order.cardLast4}`}
                </p>
              </div>
              <Button size="sm" variant={state === 'active' ? 'primary' : 'secondary'} to={`/reservations/${order.id}`}>
                {state === 'active' ? 'Manage reservation' : state === 'purchased' ? 'View purchase' : 'View details'}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Saved() {
  const { ids } = useSaved();
  const key = ids.join(',');
  const { status, data, error, reload } = useAsync(() => getCarsByIds(ids), [key]);

  if (ids.length === 0) {
    return (
      <StateMessage title="No saved cars" action={<Button to="/cars">Browse cars</Button>}>
        Tap the heart on any car to keep it here while you compare.
      </StateMessage>
    );
  }
  if (status === 'error') return <StateMessage tone="error" title="Saved cars didn’t load" onRetry={reload}>{error.message}</StateMessage>;
  if (!data) return <CarGridSkeleton count={Math.min(ids.length, 3)} />;
  return <CarGrid cars={data.filter((c) => ids.includes(c.id))} />;
}

function Details() {
  const { user, update } = useAuth();
  const notify = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const dirty = f.name !== user.name || f.phone !== (user.phone || '');

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.name.trim()) errs.name = 'Enter your name.';
    if (f.phone && f.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a 10-digit phone number, or leave it blank.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setFormError(null);
    try {
      await update({ name: f.name.trim(), phone: f.phone.trim() });
      notify('Changes saved');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="details" onSubmit={submit} noValidate>
      {formError && <p className="details__error" role="alert">{formError}</p>}
      <Field label="Full name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} />
      <Field label="Email" value={user.email} disabled hint="Your email is your sign-in and can’t be changed here." />
      <Field label="Phone" type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} error={errors.phone} hint="Used to confirm test drives." />
      <div className="details__actions">
        <Button type="submit" loading={busy} disabled={!dirty}>Save changes</Button>
        {dirty && <Button type="button" variant="ghost" onClick={() => { setF({ name: user.name, phone: user.phone || '' }); setErrors({}); }}>Discard</Button>}
      </div>
    </form>
  );
}
