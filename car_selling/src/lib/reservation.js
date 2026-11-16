/**
 * Reservation and purchase rules shared by the API mock and the UI.
 *
 * Hold length: at least HOLD_HOURS from booking, and always until DECISION_HOURS
 * after the test drive. Moving the test drive re-estimates the end of the hold.
 * The hold can be extended once by EXTENSION_HOURS.
 */
import { HOLD_HOURS } from './format';

export const EXTENSION_HOURS = 24;
export const DECISION_HOURS = 24;
export const LATEST_TEST_DRIVE_HOURS = 120; // test drive must be within 5 days of booking
export const TEST_DRIVE_TIMES = ['10:00', '12:00', '14:00', '16:00'];
export const DOC_FEE = 199;
export const FINANCE_APR = 6.9;
export const FINANCE_TERMS = [36, 48, 60, 72];
const HOUR = 3600 * 1000;

export function testDriveDate({ date, time }) {
  return new Date(`${date}T${time}`);
}

/** End of the hold for a given test drive slot (defaults to the booked one). */
export function holdEndFor(order, handover = order.handover) {
  const base = new Date(order.createdAt).getTime() + HOLD_HOURS * HOUR;
  const afterDrive = testDriveDate(handover).getTime() + DECISION_HOURS * HOUR;
  return new Date(Math.max(base, afterDrive) + (order.extended ? EXTENSION_HOURS * HOUR : 0)).toISOString();
}

/** Latest moment a test drive can be booked for this reservation. */
export const latestTestDrive = (order) => new Date(new Date(order.createdAt).getTime() + LATEST_TEST_DRIVE_HOURS * HOUR);

/** Fill in fields older stored reservations may not have, and derive the hold end. */
export function normalise(order) {
  const o = { extended: false, history: [{ type: 'created', at: order.createdAt }], purchase: null, ...order };
  return { ...o, holdEndsAt: holdEndFor(o) };
}

/** 'active' | 'purchased' | 'expired' | 'cancelled'. Expiry is derived from the clock. */
export function statusOf(order, now = Date.now()) {
  if (order.status === 'cancelled') return 'cancelled';
  if (order.purchase) return 'purchased';
  return new Date(holdEndFor(normalise(order))).getTime() <= now ? 'expired' : 'active';
}

const pad = (n) => String(n).padStart(2, '0');
export const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Slots starting at least an hour from `from` and no later than `until`.
 * Returns [{ date, times: [...] }] with empty days removed.
 */
export function availableSlots({ from = new Date(), until, maxDays = 7 }) {
  const out = [];
  const end = until ? new Date(until).getTime() : Infinity;
  const start = new Date(from);
  for (let i = 0; i <= 14 && out.length < maxDays; i++) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const date = isoDay(day);
    const times = TEST_DRIVE_TIMES.filter((t) => {
      const at = testDriveDate({ date, time: t }).getTime();
      return at > start.getTime() + HOUR && at <= end;
    });
    if (times.length) out.push({ date, times });
  }
  return out;
}

export function remaining(ms) {
  const clamped = Math.max(0, ms);
  return {
    h: Math.floor(clamped / HOUR),
    m: Math.floor((clamped % HOUR) / 60000),
    s: Math.floor((clamped % 60000) / 1000),
    ms: clamped,
  };
}

/** Price breakdown for buying one car out of a reservation. */
export function purchaseQuote({ price, deposit, delivery, deliveryFee, method, extraDown = 0, term = 60 }) {
  const docFee = DOC_FEE;
  const delivFee = delivery ? deliveryFee : 0;
  const fees = docFee + delivFee;
  const balance = price - deposit + fees;
  const base = { docFee, deliveryFee: delivFee, fees, balance };
  if (method !== 'finance') return { ...base, dueAtPurchase: balance, financed: 0, monthly: 0 };
  const down = Math.min(Math.max(0, extraDown), balance);
  const financed = balance - down;
  const r = FINANCE_APR / 100 / 12;
  const monthly = financed > 0 ? (financed * r) / (1 - Math.pow(1 + r, -term)) : 0;
  return { ...base, dueAtPurchase: down, financed, monthly };
}

export const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
