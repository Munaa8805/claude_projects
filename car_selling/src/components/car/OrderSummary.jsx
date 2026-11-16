import { carName, money, DEPOSIT, DELIVERY_FEE } from '../../lib/format';
import Skeleton from '../ui/Skeleton';
import './OrderSummary.css';

/** Price breakdown shared by cart and checkout. */
export default function OrderSummary({ cars, loading, delivery = false, children, showItems = false }) {
  const total = cars?.reduce((s, c) => s + c.price, 0) ?? 0;
  const deposits = (cars?.length ?? 0) * DEPOSIT;
  const balance = total - deposits + (delivery ? DELIVERY_FEE : 0);

  return (
    <aside className="summary" aria-label="Order summary">
      <h2 className="summary__title title">Summary</h2>
      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <Skeleton height={16} /><Skeleton height={16} width="80%" /><Skeleton height={32} width="50%" />
        </div>
      ) : (
        <>
          {showItems && (
            <ul className="summary__items">
              {cars.map((c) => <li key={c.id}><span>{carName(c)}</span><span className="num">{money(c.price)}</span></li>)}
            </ul>
          )}
          <dl className="summary__rows">
            <div><dt>{cars.length} {cars.length === 1 ? 'car' : 'cars'}</dt><dd className="num">{money(total)}</dd></div>
            {delivery && <div><dt>Home delivery</dt><dd className="num">{money(DELIVERY_FEE)}</dd></div>}
            <div><dt>Balance due at handover</dt><dd className="num">{money(balance)}</dd></div>
            <div className="summary__due"><dt>Due today</dt><dd className="num">{money(deposits)}</dd></div>
          </dl>
          <p className="summary__note">The deposit is refundable in full if you cancel within the hold. It counts toward the price if you buy.</p>
        </>
      )}
      {children}
    </aside>
  );
}
