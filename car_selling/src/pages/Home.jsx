import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listCars } from '../api/client';
import { BODY_TYPES, CARS, MAKES } from '../data/cars';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { money, DEPOSIT } from '../lib/format';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import LoadingImage from '../components/ui/LoadingImage';
import StateMessage from '../components/ui/StateMessage';
import CarGrid, { CarGridSkeleton } from '../components/car/CarGrid';
import './Home.css';

const HERO = CARS.find((c) => c.id === 'ford-mustang-gt-2019');

export default function Home() {
  useDocumentTitle();
  const navigate = useNavigate();
  const [search, setSearch] = useState({ make: '', body: '', maxPrice: '' });
  const latest = useAsync(() => listCars({ sort: 'newest', limit: 4 }), []);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(Object.entries(search).filter(([, v]) => v));
    const qs = params.toString();
    navigate(qs ? `/cars?${qs}` : '/cars');
  };
  const set = (k) => (e) => setSearch((s) => ({ ...s, [k]: e.target.value }));

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero__title display">Hold the car you want for {money(DEPOSIT)}.</h1>
          <p className="hero__lede">
            Every car here passed a 150-point inspection and has its price on the sticker.
            Reserve online, test drive it this week, and buy online or get your deposit back if it isn’t the one.
          </p>
        </div>

        <div className="hero__stage container">
          <figure className="hero__figure">
            <LoadingImage
              className="hero__img"
              src={`${HERO.image}&w=1800`}
              srcSet={`${HERO.image}&w=900 900w, ${HERO.image}&w=1800 1800w, ${HERO.image}&w=2600 2600w`}
              sizes="(max-width: 1280px) 100vw, 1200px"
              alt="Grey 2019 Ford Mustang GT parked on an empty airfield"
              fetchpriority="high"
            />
            <figcaption>
              <Link to={`/cars/${HERO.id}`}>{HERO.year} {HERO.make} {HERO.model} {HERO.trim}, {money(HERO.price)}</Link>
            </figcaption>
          </figure>

          <form className="hero__search" onSubmit={submit} aria-label="Search cars">
            <Field label="Make" as="select" value={search.make} onChange={set('make')}>
              <option value="">Any make</option>
              {MAKES.map((m) => <option key={m}>{m}</option>)}
            </Field>
            <Field label="Body type" as="select" value={search.body} onChange={set('body')}>
              <option value="">Any body</option>
              {BODY_TYPES.map((b) => <option key={b}>{b}</option>)}
            </Field>
            <Field label="Budget" as="select" value={search.maxPrice} onChange={set('maxPrice')}>
              <option value="">Any price</option>
              {[15000, 35000, 50000, 75000, 100000].map((p) => <option key={p} value={p}>Up to {money(p)}</option>)}
            </Field>
            <Button type="submit" size="lg">Search cars</Button>
          </form>
        </div>
      </section>

      <section className="container home-bodies" aria-labelledby="bodies-title">
        <h2 id="bodies-title" className="visually-hidden">Shop by body type</h2>
        <ul className="bodies">
          {BODY_TYPES.map((b) => {
            const n = CARS.filter((c) => c.body === b).length;
            return (
              <li key={b}>
                <Link to={`/cars?body=${b}`} className="bodies__link">
                  <span className="bodies__name title">{b === 'SUV' ? 'SUVs' : `${b}s`}</span>
                  <span className="bodies__count num">{n} in stock</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="container home-section" aria-labelledby="latest-title">
        <div className="home-section__head">
          <h2 id="latest-title" className="home-section__title title">Just arrived</h2>
          <Link to="/cars" className="text-link">See all {CARS.length} cars</Link>
        </div>
        {latest.status === 'loading' && !latest.data && <CarGridSkeleton count={4} columns={4} />}
        {latest.status === 'error' && (
          <StateMessage tone="error" title="New arrivals didn’t load" onRetry={latest.reload}>{latest.error.message}</StateMessage>
        )}
        {latest.data && <CarGrid cars={latest.data} columns={4} />}
      </section>

      <section id="how-it-works" className="how" aria-labelledby="how-title">
        <div className="container how__inner">
          <h2 id="how-title" className="how__title display">How reserving works</h2>
          <ol className="how__steps">
            <li>
              <h3 className="title">Reserve online</h3>
              <p>Pay a {money(DEPOSIT)} deposit by card. The car comes off the site straight away and is held until a day after your test drive.</p>
            </li>
            <li>
              <h3 className="title">Test drive it</h3>
              <p>Pick a time at our lot, or we bring the car to you. Read the inspection report before you arrive.</p>
            </li>
            <li>
              <h3 className="title">Buy it or walk away</h3>
              <p>Buy online by bank transfer or finance, then collect it or have it delivered. Or cancel from your account for a full refund.</p>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
