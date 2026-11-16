# Forecourt storefront

A React storefront for an online used-car dealership where buyers reserve a car with a refundable deposit.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Structure

```
src/
  api/client.js        Mock API (async, simulated latency). Replace with real fetch calls.
  data/cars.js         Inventory seed data
  context/             Auth, cart, saved cars, toasts
  hooks/               useAsync (loading/error/data), persistent state, document title
  components/
    layout/            Header, Footer, Layout, RequireAuth
    ui/                Button, Field, Icon, Plate, Skeleton, Spinner, StateMessage
    car/               CarCard, CarGrid, CarImage, Filters, SlotPicker, WindowSticker, FinanceCalculator, OrderSummary
    reservation/       HoldCountdown, ReservationTimeline
  pages/               Home, Listing, CarDetail, Cart, Checkout, Reservation, Purchase, Auth, Profile, NotFound
  styles/tokens.css    Design tokens (colour, type, space, radius, motion)
```

## Reservations and buying

Paying the $500 deposit holds the cars. The hold lasts **at least 72 hours, and always until 24 hours after the test drive**. Test drives can be booked up to 5 days after reserving.

`/reservations/:id` tracks a reservation:

- Live countdown and a timeline (deposit paid → test drive → buy or walk away)
- **Reschedule the test drive**: the hold end is re-estimated, with a preview before you confirm
- Extend the hold once by 24 hours, or cancel for a full refund
- **Buy this car**: opens `/reservations/:id/buy`

Buying takes three steps:

1. **Payment**: pay in full by bank transfer, or finance over 36–72 months at 6.9% APR. Finance is declined if the monthly payment is over 15% of monthly income.
2. **Handover**: collect from the lot, or home delivery for $299, on a chosen day and time.
3. **Review**: confirm and agree to the purchase terms.

The deposit counts toward the price, and a $199 title and registration fee is added. A bought car is marked **Sold** and leaves the listings. Other cars on the same reservation are released and their deposits refunded.

Holds that run out become **Hold ended** automatically. The rules live in `src/lib/reservation.js`.

## Trying the states

- **Loading:** every API call has ~600ms of latency. Add `?slow` to any URL (or run `localStorage.setItem('fc:slow', '1')`) to stretch it to 3s. While requests are in flight, a yellow bar runs under the header; pages show skeletons, buttons show spinners, and large photos show a placeholder until they arrive.
- **Error:** add `?simulateError` to any URL, or run `localStorage.setItem('fc:simulateError', '1')`.
- **Empty:** filter the listing until nothing matches, or open the cart, saved cars or reservations before adding anything.
- **Declined payment:** use a card number ending in `0002` at checkout, or a bank account number ending in `0002` when buying.
- **Declined finance:** enter a low yearly income (for example 20000) when financing.
- **Not found:** visit `/cars/not-a-car`.

Accounts, the cart and reservations are stored in `localStorage`. This is a front-end demo with no real authentication or payments.
