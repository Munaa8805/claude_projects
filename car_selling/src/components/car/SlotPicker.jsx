import { formatDate } from '../../lib/format';
import { TEST_DRIVE_TIMES } from '../../lib/reservation';
import './SlotPicker.css';

/**
 * Day + time picker for test drives.
 * slots: [{ date: 'YYYY-MM-DD', times: ['10:00', ...] }] — only these can be chosen.
 */
export default function SlotPicker({ name, slots, value, onChange, errors = {} }) {
  const day = slots.find((s) => s.date === value.date);

  const pickDay = (date) => {
    const times = slots.find((s) => s.date === date)?.times ?? [];
    // Keep the chosen time if the new day has it.
    onChange({ date, time: times.includes(value.time) ? value.time : '' });
  };

  return (
    <div className="slot-picker">
      <div className={`picker${errors.date ? ' is-invalid' : ''}`} role="radiogroup" aria-label="Day">
        <p className="picker__label">Day</p>
        <div className="picker__grid picker__grid--days">
          {slots.map(({ date }) => (
            <label key={date} className={`slot${value.date === date ? ' is-active' : ''}`}>
              <input type="radio" name={`${name}-date`} value={date} checked={value.date === date} onChange={() => pickDay(date)} />
              <span className="slot__wd">{formatDate(date, { weekday: 'short' })}</span>
              <span className="slot__d num">{formatDate(date, { month: 'short', day: 'numeric' })}</span>
            </label>
          ))}
        </div>
        {errors.date && <p className="field__error">{errors.date}</p>}
      </div>

      <div className={`picker${errors.time ? ' is-invalid' : ''}`} role="radiogroup" aria-label="Time">
        <p className="picker__label">Time</p>
        <div className="picker__grid">
          {TEST_DRIVE_TIMES.map((t) => {
            const open = day ? day.times.includes(t) : false;
            return (
              <label key={t} className={`slot slot--time${value.time === t ? ' is-active' : ''}${open ? '' : ' is-disabled'}`}>
                <input type="radio" name={`${name}-time`} value={t} checked={value.time === t} disabled={!open} onChange={() => onChange({ ...value, time: t })} />
                <span className="num">{t}</span>
              </label>
            );
          })}
        </div>
        {!day && <p className="picker__hint">Choose a day to see open times.</p>}
        {errors.time && <p className="field__error">{errors.time}</p>}
      </div>
    </div>
  );
}
