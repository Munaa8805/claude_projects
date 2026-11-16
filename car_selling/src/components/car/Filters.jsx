import { BODY_TYPES, FUEL_TYPES, MAKES } from '../../data/cars';
import { money, number } from '../../lib/format';
import Field from '../ui/Field';
import './Filters.css';

const PRICE_STEPS = [15000, 25000, 35000, 50000, 75000, 100000];
const MILE_STEPS = [10000, 20000, 30000, 40000];

/** Controlled filter form. `values` mirrors URL search params. */
export default function Filters({ values, onChange, onReset, activeCount }) {
  const set = (key) => (e) => onChange(key, e.target.type === 'checkbox' ? (e.target.checked ? '1' : '') : e.target.value);

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()} aria-label="Filter cars">
      <Field label="Keyword" type="search" placeholder="Model, trim or colour" value={values.q || ''} onChange={set('q')} />
      <Field label="Make" as="select" value={values.make || ''} onChange={set('make')}>
        <option value="">Any make</option>
        {MAKES.map((m) => <option key={m}>{m}</option>)}
      </Field>

      <fieldset className="filters__group">
        <legend>Body type</legend>
        <div className="filters__chips">
          {['', ...BODY_TYPES].map((b) => (
            <label key={b || 'any'} className={`chip${(values.body || '') === b ? ' is-active' : ''}`}>
              <input type="radio" name="body" value={b} checked={(values.body || '') === b} onChange={set('body')} />
              {b || 'Any'}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Maximum price" as="select" value={values.maxPrice || ''} onChange={set('maxPrice')}>
        <option value="">No limit</option>
        {PRICE_STEPS.map((p) => <option key={p} value={p}>Up to {money(p)}</option>)}
      </Field>
      <Field label="Maximum mileage" as="select" value={values.maxMiles || ''} onChange={set('maxMiles')}>
        <option value="">No limit</option>
        {MILE_STEPS.map((m) => <option key={m} value={m}>Up to {number(m)} mi</option>)}
      </Field>
      <Field label="Fuel" as="select" value={values.fuel || ''} onChange={set('fuel')}>
        <option value="">Any fuel</option>
        {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
      </Field>

      <label className="filters__check">
        <input type="checkbox" checked={values.available === '1'} onChange={set('available')} />
        Hide reserved cars
      </label>

      {activeCount > 0 && (
        <button type="button" className="filters__reset" onClick={onReset}>Clear {activeCount} {activeCount === 1 ? 'filter' : 'filters'}</button>
      )}
    </form>
  );
}
