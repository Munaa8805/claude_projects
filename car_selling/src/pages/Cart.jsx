import { Link, useNavigate } from 'react-router-dom';
import { getCarsByIds } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { carName, miles, money, DEPOSIT, HOLD_HOURS } from '../lib/format';
import CarImage from '../components/car/CarImage';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Plate from '../components/ui/Plate';
import Skeleton from '../components/ui/Skeleton';
import StateMessage from '../components/ui/StateMessage';
import OrderSummary from '../components/car/OrderSummary';
import './Cart.css';

export default function Cart() {
  useDocumentTitle('Cart');
  const cart = useCart();
  const notify = useToast();
  const navigate = useNavigate();
  const key = cart.ids.join(',');
  const { status, data, error, reload } = useAsync(() => getCarsByIds(cart.ids), [key]);

  const remove = (car) => {
    cart.remove(car.id);
    notify(`Removed ${carName(car)} from your cart`);
  };

  if (cart.count === 0) {
    return (
      <div className="container page">
        <header className="page-head"><h1 className="display">Your cart</h1></header>
        <StateMessage title="Your cart is empty" action={<Button to="/cars">Browse cars</Button>}>
          Add a car to reserve it with a {money(DEPOSIT)} refundable deposit. Cars you save are in your account.
        </StateMessage>
      </div>
    );
  }

  const cars = data?.filter((c) => cart.ids.includes(c.id));
  const unavailable = cars?.filter((c) => c.status !== 'available') ?? [];

  return (
    <div className="container page">
      <header className="page-head">
        <h1 className="display">Your cart</h1>
        <p>Cars stay on sale until you pay the deposit. Once you do, they’re held for you for at least {HOLD_HOURS} hours, and until a day after your test drive.</p>
      </header>

      <div className="cart">
        <section aria-label="Cars in your cart">
          {status === 'error' && <StateMessage tone="error" title="Your cart didn’t load" onRetry={reload}>{error.message}</StateMessage>}
          {status === 'loading' && !cars && (
            <ul className="cart__list">
              {cart.ids.map((id) => (
                <li key={id} className="cart__item">
                  <Skeleton height="auto" className="cart__skel-img" radius="var(--r-control)" />
                  <div style={{ display: 'grid', gap: 10 }}><Skeleton width="60%" height={24} /><Skeleton width="40%" height={14} /></div>
                </li>
              ))}
            </ul>
          )}
          {cars && (
            <ul className="cart__list">
              {cars.map((car) => (
                <li key={car.id} className={`cart__item${car.status !== 'available' ? ' is-unavailable' : ''}`}>
                  <Link to={`/cars/${car.id}`} className="cart__thumb" tabIndex={-1} aria-hidden="true">
                    <CarImage car={car} width={360} />
                  </Link>
                  <div className="cart__info">
                    <Plate size="sm">{car.stock}</Plate>
                    <h2 className="cart__name title"><Link to={`/cars/${car.id}`}>{carName(car)}</Link></h2>
                    <p className="muted cart__meta">{car.trim !== 'Base' ? `${car.trim}, ` : ''}{miles(car.mileage)}, {car.exterior}</p>
                    {car.status !== 'available' && (
                      <p className="cart__warn"><Icon name="alert" size={16} /> {car.status === 'sold' ? 'Sold' : 'Reserved by another buyer'}. Remove it to continue.</p>
                    )}
                  </div>
                  <div className="cart__side">
                    <p className="cart__price num">{money(car.price)}</p>
                    <p className="cart__deposit num">{money(DEPOSIT)} deposit today</p>
                    <button className="cart__remove" onClick={() => remove(car)}>
                      <Icon name="trash" size={16} /> Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/cars" className="text-link cart__continue">Keep browsing</Link>
        </section>

        <OrderSummary cars={cars} loading={!cars}>
          {unavailable.length > 0 && <p className="cart__block">Remove cars that are reserved or sold before you check out.</p>}
          <Button size="lg" block disabled={!cars || unavailable.length > 0} onClick={() => navigate('/checkout')}>
            Check out
          </Button>
        </OrderSummary>
      </div>
    </div>
  );
}
