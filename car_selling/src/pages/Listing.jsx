import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listCars } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Filters from '../components/car/Filters';
import CarGrid, { CarGridSkeleton } from '../components/car/CarGrid';
import StateMessage from '../components/ui/StateMessage';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Field from '../components/ui/Field';
import './Listing.css';

const FILTER_KEYS = ['q', 'make', 'body', 'fuel', 'maxPrice', 'maxMiles', 'available'];
const PAGE_SIZE = 12;
const SORTS = [
  ['newest', 'Newest listings'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['miles-asc', 'Lowest mileage'],
  ['year-desc', 'Newest model year'],
];

export default function Listing() {
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const values = Object.fromEntries(params.entries());
  const activeCount = FILTER_KEYS.filter((k) => values[k]).length;

  /* Debounce keyword typing; other filters apply immediately. */
  const [q, setQ] = useState(values.q || '');
  const qTimer = useRef();
  useEffect(() => { setQ(params.get('q') || ''); }, [params]);

  const query = useMemo(() => {
    const f = {};
    for (const k of [...FILTER_KEYS, 'sort']) if (params.get(k)) f[k] = params.get(k);
    return f;
  }, [params]);
  const key = JSON.stringify(query);
  const result = useAsync(() => listCars(query), [key]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => setVisible(PAGE_SIZE), [key]);

  const title = values.body ? `${values.body === 'SUV' ? 'SUVs' : `${values.body}s`}` : values.fuel === 'Electric' ? 'Electric cars' : 'All cars';
  useDocumentTitle(title);

  const update = (k, v) => {
    if (k === 'q') {
      setQ(v);
      clearTimeout(qTimer.current);
      qTimer.current = setTimeout(() => apply(k, v), 300);
      return;
    }
    apply(k, v);
  };
  const apply = (k, v) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v) next.set(k, v); else next.delete(k);
      return next;
    }, { replace: true });
  };
  const reset = () => setParams(params.get('sort') ? { sort: params.get('sort') } : {});

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [drawer]);

  const cars = result.data;
  const loading = result.status === 'loading';

  return (
    <div className="container page listing">
      <header className="listing__head">
        <h1 className="listing__title display">{title}</h1>
        <p className="listing__count num" aria-live="polite">
          {loading ? 'Updating results…' : result.status === 'error' ? '' : `${cars.length} ${cars.length === 1 ? 'car' : 'cars'}`}
        </p>
      </header>

      <div className="listing__toolbar">
        <Button variant="secondary" className="listing__filter-btn" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="filters-panel">
          <Icon name="sliders" size={18} /> Filters{activeCount > 0 && ` (${activeCount})`}
        </Button>
        <Field label="Sort by" as="select" className="listing__sort" value={values.sort || 'newest'} onChange={(e) => apply('sort', e.target.value === 'newest' ? '' : e.target.value)}>
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Field>
      </div>

      <div className="listing__layout">
        <aside id="filters-panel" className={`listing__aside${drawer ? ' is-open' : ''}`} aria-label="Filters">
          <div className="listing__drawer-head">
            <h2 className="title">Filters</h2>
            <button className="listing__close" onClick={() => setDrawer(false)} aria-label="Close filters"><Icon name="close" /></button>
          </div>
          <Filters values={{ ...values, q }} onChange={update} onReset={reset} activeCount={activeCount} />
          <div className="listing__drawer-foot">
            <Button block onClick={() => setDrawer(false)}>
              {loading ? 'Updating…' : `Show ${cars?.length ?? 0} ${cars?.length === 1 ? 'car' : 'cars'}`}
            </Button>
          </div>
        </aside>
        {drawer && <div className="listing__scrim" onClick={() => setDrawer(false)} aria-hidden="true" />}

        <section className={`listing__results${loading && cars ? ' is-refreshing' : ''}`} aria-label="Results">
          {loading && !cars && <CarGridSkeleton count={6} />}
          {result.status === 'error' && (
            <StateMessage tone="error" title="Cars didn’t load" onRetry={result.reload}>{result.error.message}</StateMessage>
          )}
          {cars && cars.length === 0 && (
            <StateMessage
              title="No cars match these filters"
              action={<Button variant="secondary" onClick={reset}>Clear filters</Button>}
            >
              Try a higher budget or mileage, or a different body type. New cars arrive most weeks.
            </StateMessage>
          )}
          {cars && cars.length > 0 && (
            <>
              <CarGrid cars={cars.slice(0, visible)} />
              <div className="listing__more">
                <p className="muted num">Showing {Math.min(visible, cars.length)} of {cars.length}</p>
                {visible < cars.length && (
                  <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Show more cars</Button>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
