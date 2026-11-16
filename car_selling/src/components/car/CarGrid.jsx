import CarCard from './CarCard';
import Skeleton from '../ui/Skeleton';
import './CarGrid.css';

export default function CarGrid({ cars, columns }) {
  return (
    <ul className="car-grid" style={columns ? { '--cols': columns } : undefined}>
      {cars.map((car) => <li key={car.id}><CarCard car={car} /></li>)}
    </ul>
  );
}

export function CarGridSkeleton({ count = 6, columns }) {
  return (
    <ul className="car-grid" style={columns ? { '--cols': columns } : undefined} aria-busy="true" aria-label="Loading cars">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="car-grid__skeleton">
          <Skeleton height="auto" radius="var(--r-control)" className="car-grid__skeleton-img" />
          <Skeleton width="70%" height={24} />
          <Skeleton width="45%" height={14} />
          <Skeleton width="60%" height={14} />
        </li>
      ))}
    </ul>
  );
}
