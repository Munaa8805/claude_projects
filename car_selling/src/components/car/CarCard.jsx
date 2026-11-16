import { Link } from 'react-router-dom';
import CarImage from './CarImage';
import SaveButton from './SaveButton';
import { miles, money } from '../../lib/format';
import './CarCard.css';

export default function CarCard({ car }) {
  const reserved = car.status !== 'available';
  return (
    <article className={`car-card${reserved ? ' car-card--reserved' : ''}`}>
      <div className="car-card__media">
        <CarImage car={car} width={640} />
        <SaveButton car={car} />
        {reserved && <span className="car-card__badge">{car.status === 'sold' ? 'Sold' : 'Reserved'}</span>}
      </div>
      <div className="car-card__body">
        <h3 className="car-card__name title">
          <Link to={`/cars/${car.id}`} className="car-card__link">
            {car.year} {car.make} {car.model}
          </Link>
        </h3>
        <p className="car-card__trim">{car.trim !== 'Base' ? car.trim : car.body} in {car.exterior}</p>
        <ul className="car-card__specs" aria-label="Key specs">
          <li>{miles(car.mileage)}</li>
          <li>{car.transmission}</li>
          <li>{car.fuel === 'Electric' ? 'Electric' : car.drivetrain}</li>
        </ul>
        <p className="car-card__price num">{money(car.price)}</p>
      </div>
    </article>
  );
}
