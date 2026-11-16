import Plate from '../ui/Plate';
import Icon from '../ui/Icon';
import { miles, money } from '../../lib/format';
import './WindowSticker.css';

/** Spec sheet modelled on a dealer window sticker. */
export default function WindowSticker({ car }) {
  const rows = [
    ['Engine', car.engine],
    ['Power', `${car.power} hp`],
    ['0–60 mph', `${car.zeroToSixty} sec`],
    ['Transmission', car.transmission],
    ['Drivetrain', car.drivetrain],
    [car.fuel === 'Electric' ? 'Range' : 'Fuel economy', car.economy],
    ['Mileage', miles(car.mileage)],
    ['Previous owners', car.owners],
    ['Exterior', car.exterior],
    ['Interior', car.interior],
  ];

  return (
    <section className="sticker" aria-labelledby="sticker-title">
      <header className="sticker__head">
        <div>
          <h2 id="sticker-title" className="sticker__title title">Vehicle details</h2>
          <p className="sticker__sub">{car.year} {car.make} {car.model} {car.trim !== 'Base' ? car.trim : ''}</p>
        </div>
        <Plate>{car.stock}</Plate>
      </header>

      <dl className="sticker__specs">
        {rows.map(([k, v]) => (
          <div key={k} className="sticker__row">
            <dt>{k}</dt>
            <dd className="num">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="sticker__block">
        <h3 className="sticker__label">Equipment</h3>
        <ul className="sticker__features">
          {car.features.map((f) => <li key={f}><Icon name="check" size={16} />{f}</li>)}
        </ul>
      </div>

      <div className="sticker__block sticker__inspection">
        <h3 className="sticker__label">Inspection</h3>
        <p>Passed our 150-point inspection. Clean title, no reported accidents. The full report is sent with your reservation.</p>
      </div>

      <footer className="sticker__foot">
        <span>Price</span>
        <strong className="num">{money(car.price)}</strong>
      </footer>
    </section>
  );
}
