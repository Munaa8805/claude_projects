import { formatDate, money, DEPOSIT } from '../../lib/format';
import { fmtDateTime, statusOf, testDriveDate } from '../../lib/reservation';
import { carName } from '../../lib/format';
import { useNow } from '../../hooks/useNow';
import './ReservationTimeline.css';

const slot = ({ date, time }) => `${formatDate(date)} at ${time}`;
const short = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Stages of a reservation, each marked done, current, upcoming, skipped or ended. */
export default function ReservationTimeline({ order }) {
  const now = useNow(60000);
  const status = statusOf(order, now);
  const deposit = money(order.carIds.length * DEPOSIT);
  const driveDone = testDriveDate(order.handover).getTime() < now;
  const where = order.handover.method === 'pickup' ? 'at our lot, 1180 Harbor Road' : `at ${order.handover.address}`;
  const rescheduled = order.history.filter((h) => h.type === 'rescheduled').length;
  const p = order.purchase;

  const steps = [
    { title: 'Deposit paid', state: 'done', body: `${deposit} on the card ending ${order.cardLast4}.`, meta: short(order.createdAt) },
    {
      title: driveDone ? 'Test drive' : status === 'active' ? 'Test drive booked' : status === 'purchased' ? 'Test drive skipped' : 'Test drive cancelled',
      state: driveDone ? 'done' : status === 'active' ? 'current' : 'skipped',
      body: `${slot(order.handover)}, ${where}.${rescheduled ? ` Rescheduled ${rescheduled === 1 ? 'once' : `${rescheduled} times`}.` : ''}`,
    },
  ];

  if (status === 'purchased') {
    const car = order.cars.find((c) => c.id === p.carId);
    const handoverAt = testDriveDate(p.handover);
    steps.push({
      title: 'Purchased',
      state: 'done',
      body: `${car ? carName(car) : 'Car'} for ${money(p.price)}, ${p.method === 'finance' ? `financed over ${p.term} months` : 'paid in full by bank transfer'}.${p.released.length ? ` ${p.released.length === 1 ? 'Your other car was' : 'Your other cars were'} released and the deposit refunded.` : ''}`,
      meta: short(p.at),
    });
    steps.push({
      title: handoverAt.getTime() < now ? 'Handed over' : 'Handover',
      state: handoverAt.getTime() < now ? 'done' : 'current',
      body: `${slot(p.handover)}, ${p.handover.method === 'pickup' ? 'collect from our lot' : `delivered to ${p.handover.address}`}. Bring your driver’s license and proof of insurance.`,
    });
  } else if (status === 'cancelled') {
    steps.push({ title: 'Cancelled', state: 'ended', body: `${deposit} is being refunded to the card ending ${order.cardLast4}. Refunds take up to 3 business days.`, meta: short(order.history.find((h) => h.type === 'cancelled')?.at ?? order.holdEndsAt) });
  } else if (status === 'expired') {
    steps.push({ title: 'Hold ended', state: 'ended', body: `The car is back on sale and ${deposit} has been refunded to the card ending ${order.cardLast4}.`, meta: short(order.holdEndsAt) });
  } else {
    steps.push({ title: 'Buy it or walk away', state: driveDone ? 'current' : 'upcoming', body: 'Buy online, or cancel before the hold ends for a full refund.', meta: `By ${fmtDateTime(order.holdEndsAt)}` });
  }

  return (
    <ol className="timeline" aria-label="Reservation progress">
      {steps.map((s, i) => (
        <li key={s.title} className={`timeline__step is-${s.state}`} aria-current={s.state === 'current' ? 'step' : undefined}>
          <span className="timeline__dot" aria-hidden="true">{s.state === 'done' ? '✓' : i + 1}</span>
          <div className="timeline__content">
            <h3 className="timeline__title title">{s.title}</h3>
            <p className="timeline__body">{s.body}</p>
            {s.meta && <p className="timeline__meta">{s.meta}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
