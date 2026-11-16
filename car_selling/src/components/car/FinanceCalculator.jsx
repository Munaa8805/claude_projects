import { useId, useState } from 'react';
import { money, monthlyPayment } from '../../lib/format';
import './FinanceCalculator.css';

const TERMS = [36, 48, 60, 72];
const APR = 6.9;

export default function FinanceCalculator({ price }) {
  const id = useId();
  const [down, setDown] = useState(Math.round(price * 0.2 / 500) * 500);
  const [term, setTerm] = useState(60);
  const payment = monthlyPayment(price - down, APR, term);

  return (
    <section className="calc" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`} className="calc__title title">Estimate a monthly payment</h2>
      <div className="calc__row">
        <label htmlFor={`${id}-down`}>Down payment</label>
        <output htmlFor={`${id}-down`} className="num">{money(down)}</output>
      </div>
      <input
        id={`${id}-down`} type="range" className="calc__range"
        min={0} max={Math.round(price * 0.6 / 500) * 500} step={500}
        value={down} onChange={(e) => setDown(Number(e.target.value))}
        style={{ '--pct': `${(down / (price * 0.6)) * 100}%` }}
      />
      <fieldset className="calc__terms">
        <legend>Term</legend>
        {TERMS.map((t) => (
          <label key={t} className={`calc__term${t === term ? ' is-active' : ''}`}>
            <input type="radio" name={`${id}-term`} value={t} checked={t === term} onChange={() => setTerm(t)} />
            {t} mo
          </label>
        ))}
      </fieldset>
      <p className="calc__result">
        <span className="calc__amount num">{money(Math.round(payment))}</span>
        <span className="muted">per month at {APR}% APR</span>
      </p>
      <p className="calc__note">An estimate only. Your rate depends on your credit and is confirmed when you pay the balance.</p>
    </section>
  );
}
