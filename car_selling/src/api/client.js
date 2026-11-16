/**
 * Mock API. Every call is async with realistic latency so loading states are
 * exercised. Swap these functions for real fetch() calls to a backend; the
 * components only depend on the function signatures and the thrown errors.
 *
 * To see error states: add ?simulateError to the URL, or run
 *   localStorage.setItem('fc:simulateError', '1')
 * To see loading states: add ?slow to the URL (3s latency), or run
 *   localStorage.setItem('fc:slow', '1')
 */
import { CARS } from '../data/cars';
import { read, write } from '../lib/storage';
import { DEPOSIT, DELIVERY_FEE } from '../lib/format';
import { holdEndFor, latestTestDrive, normalise, purchaseQuote, statusOf, testDriveDate, FINANCE_TERMS } from '../lib/reservation';

const LATENCY = 550;
const SLOW_LATENCY = 3000;

export class ApiError extends Error {
  constructor(message, { status = 500, field } = {}) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

function flag(param, key) {
  try {
    return new URLSearchParams(window.location.search).has(param) || window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

const wait = () => {
  const ms = flag('slow', 'fc:slow') ? SLOW_LATENCY : LATENCY;
  return new Promise((r) => setTimeout(r, ms + Math.random() * 250));
};

/* ---------- In-flight request tracking (drives the top loading bar) ---------- */

let inFlight = 0;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
export const activity = {
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  get: () => inFlight,
};

async function request(fn) {
  inFlight++;
  emit();
  try {
    await wait();
    if (flag('simulateError', 'fc:simulateError')) {
      throw new ApiError('The inventory service did not respond. Check your connection and try again.', { status: 503 });
    }
    return fn();
  } finally {
    inFlight--;
    emit();
  }
}

/* Cars reserved or bought through this browser are unavailable to others. */
function carStates() {
  const reserved = new Set();
  const sold = new Set();
  for (const o of read('fc:orders', [])) {
    const st = statusOf(o);
    if (st === 'active') o.carIds.forEach((id) => reserved.add(id));
    if (st === 'purchased') sold.add(o.purchase.carId);
  }
  return { reserved, sold };
}
const reservedIds = () => {
  const { reserved, sold } = carStates();
  return new Set([...reserved, ...sold]);
};

function withStatus(car, states) {
  if (states.sold.has(car.id)) return { ...car, status: 'sold' };
  if (states.reserved.has(car.id)) return { ...car, status: 'reserved' };
  return car;
}

const SORTERS = {
  newest: (a, b) => b.listedAt.localeCompare(a.listedAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'miles-asc': (a, b) => a.mileage - b.mileage,
  'year-desc': (a, b) => b.year - a.year,
};

export function listCars(filters = {}) {
  return request(() => {
    const states = carStates();
    const q = (filters.q || '').trim().toLowerCase();
    // Sold cars leave the listings.
    let cars = CARS.map((c) => withStatus(c, states)).filter((c) => c.status !== 'sold').filter((c) => {
      if (filters.make && c.make !== filters.make) return false;
      if (filters.body && c.body !== filters.body) return false;
      if (filters.fuel && c.fuel !== filters.fuel) return false;
      if (filters.maxPrice && c.price > Number(filters.maxPrice)) return false;
      if (filters.maxMiles && c.mileage > Number(filters.maxMiles)) return false;
      if (filters.available && c.status !== 'available') return false;
      if (q && !`${c.year} ${c.make} ${c.model} ${c.trim} ${c.exterior}`.toLowerCase().includes(q)) return false;
      return true;
    });
    cars.sort(SORTERS[filters.sort] || SORTERS.newest);
    if (filters.limit) cars = cars.slice(0, filters.limit);
    return cars;
  });
}

export function getCar(id) {
  return request(() => {
    const car = CARS.find((c) => c.id === id);
    if (!car) throw new ApiError('We could not find that car. It may have sold or the link may be wrong.', { status: 404 });
    return withStatus(car, carStates());
  });
}

export function getSimilarCars(car, limit = 3) {
  return request(() => {
    const states = carStates();
    return CARS.filter((c) => c.id !== car.id && !states.sold.has(c.id))
      .map((c) => ({ c, score: (c.body === car.body ? 2 : 0) + (c.make === car.make ? 1 : 0) - Math.abs(c.price - car.price) / 100000 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ c }) => withStatus(c, states));
  });
}

export function getCarsByIds(ids) {
  return request(() => {
    const states = carStates();
    return ids.map((id) => CARS.find((c) => c.id === id)).filter(Boolean).map((c) => withStatus(c, states));
  });
}

/* ---------- Auth (mock: accounts live in this browser only) ---------- */

const usersKey = 'fc:users';
const publicUser = ({ password, ...u }) => u;

export function login({ email, password }) {
  return request(() => {
    const users = read(usersKey, []);
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      throw new ApiError('That email and password don’t match an account. Check both, or create an account.', { status: 401 });
    }
    return publicUser(user);
  });
}

export function register({ name, email, password }) {
  return request(() => {
    const users = read(usersKey, []);
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new ApiError('An account with this email already exists. Sign in instead.', { status: 409, field: 'email' });
    }
    const user = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), phone: '', password, createdAt: new Date().toISOString() };
    write(usersKey, [...users, user]);
    return publicUser(user);
  });
}

export function updateUser(id, patch) {
  return request(() => {
    const users = read(usersKey, []);
    const idx = users.findIndex((u) => u.id === id);
    if (idx < 0) throw new ApiError('Your session has expired. Sign in again.', { status: 401 });
    users[idx] = { ...users[idx], ...patch };
    write(usersKey, users);
    return publicUser(users[idx]);
  });
}

/* ---------- Reservations ---------- */

const ordersKey = 'fc:orders';
const withCars = (order) => ({ ...order, cars: order.carIds.map((cid) => CARS.find((c) => c.id === cid)).filter(Boolean) });

/** Load one of the user's reservations, run `change` on it, save, and return it. */
function mutate(id, userId, change) {
  const orders = read(ordersKey, []);
  const idx = orders.findIndex((o) => o.id === id && o.userId === userId);
  if (idx < 0) throw new ApiError('We could not find that reservation.', { status: 404 });
  const order = normalise(orders[idx]);
  const status = statusOf(order);
  if (status !== 'active') {
    throw new ApiError(
      {
        cancelled: 'This reservation has been cancelled, so it can’t be changed.',
        expired: 'The hold on this reservation has ended, so it can’t be changed.',
        purchased: 'You’ve already bought a car from this reservation.',
      }[status],
      { status: 409 },
    );
  }
  change(order);
  order.holdEndsAt = holdEndFor(order);
  orders[idx] = order;
  write(ordersKey, orders);
  return withCars(order);
}

export function createReservation({ userId, carIds, contact, handover, card }) {
  return request(() => {
    const digits = card.number.replace(/\s/g, '');
    if (digits.endsWith('0002')) {
      throw new ApiError('Your card was declined. Use a different card or contact your bank.', { status: 402, field: 'number' });
    }
    const reserved = reservedIds();
    const taken = carIds.filter((id) => reserved.has(id) || CARS.find((c) => c.id === id)?.status === 'reserved');
    if (taken.length) {
      throw new ApiError('One of these cars was just reserved or sold. Remove it from your cart to continue.', { status: 409 });
    }
    const createdAt = new Date().toISOString();
    const order = normalise({
      id: `R-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      carIds,
      contact,
      handover,
      cardLast4: digits.slice(-4),
      createdAt,
      status: 'active',
      history: [{ type: 'created', at: createdAt }],
    });
    write(ordersKey, [order, ...read(ordersKey, [])]);
    return order;
  });
}

export function listReservations(userId) {
  return request(() => read(ordersKey, []).filter((o) => o.userId === userId).map((o) => withCars(normalise(o))));
}

export function getReservation(id, userId) {
  return request(() => {
    const order = read(ordersKey, []).find((o) => o.id === id && o.userId === userId);
    if (!order) throw new ApiError('We could not find that reservation. It may belong to a different account.', { status: 404 });
    return withCars(normalise(order));
  });
}

export function rescheduleTestDrive(id, userId, { date, time }) {
  return request(() => mutate(id, userId, (order) => {
    const at = testDriveDate({ date, time });
    if (at.getTime() <= Date.now()) throw new ApiError('Choose a time in the future.', { status: 422 });
    if (at.getTime() > latestTestDrive(order).getTime()) {
      throw new ApiError('Test drives must be within 5 days of reserving. Choose an earlier day.', { status: 422 });
    }
    const from = { date: order.handover.date, time: order.handover.time };
    const holdBefore = holdEndFor(order);
    order.handover = { ...order.handover, date, time };
    order.history = [...order.history, { type: 'rescheduled', at: new Date().toISOString(), from, to: { date, time }, holdBefore, holdAfter: holdEndFor(order) }];
  }));
}

export function extendHold(id, userId) {
  return request(() => mutate(id, userId, (order) => {
    if (order.extended) throw new ApiError('This hold has already been extended once. Call us if you need more time.', { status: 409 });
    order.extended = true;
    order.history = [...order.history, { type: 'extended', at: new Date().toISOString() }];
  }));
}

export function cancelReservation(id, userId) {
  return request(() => mutate(id, userId, (order) => {
    order.status = 'cancelled';
    order.history = [...order.history, { type: 'cancelled', at: new Date().toISOString() }];
  }));
}

/**
 * Buy one car from an active reservation. Other cars on the reservation are
 * released and their deposits refunded.
 * payment: { method: 'full', account: { holder, routing, number } }
 *        | { method: 'finance', term, extraDown, income, employment }
 * handover: { method: 'pickup' | 'delivery', address, zip, date, time }
 */
export function purchaseCar(id, userId, { carId, payment, handover }) {
  return request(() => mutate(id, userId, (order) => {
    const car = CARS.find((c) => c.id === carId);
    if (!car || !order.carIds.includes(carId)) throw new ApiError('That car isn’t on this reservation.', { status: 404 });

    const quote = purchaseQuote({
      price: car.price, deposit: DEPOSIT, delivery: handover.method === 'delivery', deliveryFee: DELIVERY_FEE,
      method: payment.method, extraDown: Number(payment.extraDown) || 0, term: Number(payment.term) || 60,
    });

    if (payment.method === 'full') {
      if (payment.account.number.endsWith('0002')) {
        throw new ApiError('Your bank declined the transfer. Check the account details or use a different account.', { status: 402, field: 'number' });
      }
    } else {
      if (!FINANCE_TERMS.includes(Number(payment.term))) throw new ApiError('Choose a finance term.', { status: 422 });
      const income = Number(payment.income);
      // Simple affordability check: monthly payment under 15% of gross monthly income.
      if (quote.monthly > (income / 12) * 0.15) {
        throw new ApiError(
          `We couldn’t approve finance of ${Math.round(quote.financed).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} on this income. Try a larger down payment or a longer term, or pay in full.`,
          { status: 402, field: 'finance' },
        );
      }
    }

    const at = new Date().toISOString();
    const released = order.carIds.filter((c) => c !== carId);
    order.purchase = {
      id: `P-${Math.floor(100000 + Math.random() * 900000)}`,
      carId,
      at,
      price: car.price,
      deposit: DEPOSIT,
      method: payment.method,
      ...(payment.method === 'full'
        ? { accountLast4: payment.account.number.slice(-4) }
        : { term: Number(payment.term), apr: 6.9, extraDown: Number(payment.extraDown) || 0 }),
      quote,
      handover,
      released,
    };
    order.history = [...order.history, { type: 'purchased', at, carId, released }];
  }));
}
