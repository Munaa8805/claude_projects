const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const int = new Intl.NumberFormat('en-US');

export const money = (n) => usd.format(n);
export const miles = (n) => `${int.format(n)} mi`;
export const number = (n) => int.format(n);
export const carName = (car) => `${car.year} ${car.make} ${car.model}`;

export function formatDate(iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  // Plain YYYY-MM-DD strings are calendar days; parse them as local time, not UTC.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00`) : new Date(iso);
  return d.toLocaleDateString('en-US', opts);
}

/** Standard amortised monthly payment. */
export function monthlyPayment(principal, aprPercent, months) {
  if (principal <= 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export const DEPOSIT = 500;
export const DELIVERY_FEE = 299;
export const HOLD_HOURS = 72;
