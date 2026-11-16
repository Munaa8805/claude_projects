import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCar, getSimilarCars } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { carName, miles, money, monthlyPayment, DEPOSIT } from '../lib/format';
import CarImage from '../components/car/CarImage';
import CarGrid, { CarGridSkeleton } from '../components/car/CarGrid';
import WindowSticker from '../components/car/WindowSticker';
import FinanceCalculator from '../components/car/FinanceCalculator';
import SaveButton from '../components/car/SaveButton';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import LoadingImage from '../components/ui/LoadingImage';
import Plate from '../components/ui/Plate';
import Skeleton from '../components/ui/Skeleton';
import StateMessage from '../components/ui/StateMessage';
import './CarDetail.css';

export default function CarDetail() {
  const { id } = useParams();
  const { status, data: car, error, reload } = useAsync(() => getCar(id), [id]);
  useDocumentTitle(car ? carName(car) : status === 'error' ? 'Car not found' : 'Loading');

  if (status === 'error') {
    return (
      <div className="container page">
        <StateMessage
          tone={error.status === 404 ? 'empty' : 'error'}
          title={error.status === 404 ? 'This car isn’t in stock' : 'This car didn’t load'}
          onRetry={error.status === 404 ? undefined : reload}
          action={<Button variant="secondary" to="/cars">Browse all cars</Button>}
        >
          {error.message}
        </StateMessage>
      </div>
    );
  }
  if (!car || car.id !== id) return <DetailSkeleton />;
  return <Detail car={car} />;
}

function Detail({ car }) {
  const navigate = useNavigate();
  const cart = useCart();
  const notify = useToast();
  const [zoom, setZoom] = useState(false);
  const similar = useAsync(() => getSimilarCars(car), [car.id]);
  const inCart = cart.has(car.id);
  const reserved = car.status === 'reserved';
  const sold = car.status === 'sold';
  const est = monthlyPayment(car.price * 0.8, 6.9, 60);

  const addToCart = () => {
    cart.add(car.id);
    notify(`Added ${carName(car)} to your cart`, { action: { to: '/cart', label: 'View cart' } });
  };

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (e) => e.key === 'Escape' && setZoom(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  return (
    <div className="container page detail">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/cars"><Icon name="back" size={16} /> All cars</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/cars?body=${car.body}`}>{car.body === 'SUV' ? 'SUVs' : `${car.body}s`}</Link>
      </nav>

      <div className="detail__layout">
        <div className="detail__main">
          <div className="detail__media">
            <button className="detail__zoom" onClick={() => setZoom(true)} aria-label="View larger photo">
              <CarImage car={car} width={1400} ratio="16 / 10" eager />
              <span className="detail__zoom-hint"><Icon name="expand" size={16} /> Larger photo</span>
            </button>
          </div>

          <p className="detail__summary">{car.summary}</p>
          <WindowSticker car={car} />
        </div>

        <aside className="detail__buy" aria-label="Price and reservation">
          <Plate>{car.stock}</Plate>
          <h1 className="detail__name display">{car.year} {car.make} {car.model}</h1>
          <p className="detail__trim">{car.trim !== 'Base' ? `${car.trim}, ` : ''}{miles(car.mileage)}, {car.exterior}</p>

          <div className="detail__price">
            <span className="detail__amount num">{money(car.price)}</span>
            <span className="muted num">or about {money(Math.round(est))}/mo</span>
          </div>

          {sold ? (
            <div className="detail__reserved" role="status">
              <strong>Sold</strong>
              <p>This car has a new owner. Similar cars are listed below.</p>
            </div>
          ) : reserved ? (
            <div className="detail__reserved" role="status">
              <strong>Reserved by another buyer</strong>
              <p>If they don’t buy it before their hold ends, it comes back on sale. Save it to find it quickly.</p>
            </div>
          ) : inCart ? (
            <Button size="lg" block onClick={() => navigate('/cart')}>
              <Icon name="check" size={18} /> In your cart. Go to cart
            </Button>
          ) : (
            <Button size="lg" block onClick={addToCart}>Add to cart</Button>
          )}
          <div className="detail__secondary">
            <SaveButton car={car} variant="inline" />
            {inCart && <Button variant="ghost" onClick={() => { cart.remove(car.id); notify(`Removed ${carName(car)} from your cart`); }}>Remove from cart</Button>}
          </div>

          <ul className="detail__assure">
            <li><Icon name="check" size={18} /> {money(DEPOSIT)} refundable deposit holds it until a day after your test drive</li>
            <li><Icon name="check" size={18} /> Test drive at our lot or at home</li>
            <li><Icon name="check" size={18} /> 7-day return after purchase</li>
          </ul>

          {!sold && <FinanceCalculator price={car.price} />}
        </aside>
      </div>

      <section className="detail__similar" aria-labelledby="similar-title">
        <h2 id="similar-title" className="detail__similar-title title">You might also like</h2>
        {similar.status === 'loading' && <CarGridSkeleton count={3} />}
        {similar.status === 'error' && <StateMessage compact tone="error" title="Suggestions didn’t load" onRetry={similar.reload}>{similar.error.message}</StateMessage>}
        {similar.data && <CarGrid cars={similar.data} />}
      </section>

      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${carName(car)} photo`} onClick={() => setZoom(false)}>
          <LoadingImage variant="spinner" className="lightbox__img" src={`${car.image}&w=2400`} alt={`${car.exterior} ${carName(car)}`} />
          <button className="lightbox__close" onClick={() => setZoom(false)} aria-label="Close photo" autoFocus><Icon name="close" /></button>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container page detail" aria-busy="true" aria-label="Loading car">
      <Skeleton width={120} height={16} />
      <div className="detail__layout" style={{ marginTop: 24 }}>
        <div className="detail__main">
          <Skeleton height="auto" className="detail__skel-img" radius="var(--r-control)" />
          <Skeleton height={16} width="90%" />
          <Skeleton height={16} width="70%" />
        </div>
        <div className="detail__buy">
          <Skeleton width={90} height={28} />
          <Skeleton width="90%" height={72} />
          <Skeleton width="60%" height={18} />
          <Skeleton width="50%" height={40} />
          <Skeleton height={54} radius="var(--r-control)" />
        </div>
      </div>
    </div>
  );
}
