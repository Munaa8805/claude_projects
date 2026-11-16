import { useEffect, useRef, useState } from 'react';
import { useNow } from '../../hooks/useNow';
import { fmtDateTime, remaining } from '../../lib/reservation';
import './HoldCountdown.css';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Live countdown to the end of the hold. When the end moves (test drive
 * rescheduled, hold extended) it flags the change and says by how much.
 */
export default function HoldCountdown({ order, compact = false }) {
  const now = useNow(compact ? 30000 : 1000);
  const start = new Date(order.createdAt).getTime();
  const end = new Date(order.holdEndsAt).getTime();
  const { h, m, s, ms } = remaining(end - now);
  const pct = Math.max(0, Math.min(100, (ms / (end - start)) * 100));
  const urgent = ms > 0 && ms < 12 * 3600 * 1000;

  const prevEnd = useRef(end);
  const [change, setChange] = useState(null);
  useEffect(() => {
    if (prevEnd.current === end) return undefined;
    const diffH = Math.round((end - prevEnd.current) / 3600000);
    prevEnd.current = end;
    if (!diffH) return undefined;
    setChange(diffH);
    const t = setTimeout(() => setChange(null), 6000);
    return () => clearTimeout(t);
  }, [end]);

  if (compact) {
    return (
      <p className={`hold-compact${urgent ? ' is-urgent' : ''}`}>
        <span className="num">{h}h {pad(m)}m</span> left on hold
      </p>
    );
  }

  return (
    <div className={`hold${urgent ? ' is-urgent' : ''}${change ? ' is-updated' : ''}`}>
      <p className="hold__label">Held for you</p>
      <p className="hold__time num" aria-hidden="true">
        {h}<small>h</small> {pad(m)}<small>m</small> {pad(s)}<small>s</small>
      </p>
      <p className="visually-hidden">Hold ends {fmtDateTime(order.holdEndsAt)}.</p>
      <div className="hold__track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
      <p className="hold__ends">Ends {fmtDateTime(order.holdEndsAt)}{order.extended ? ', extended once' : ''}</p>
      <p className="hold__rule">Lasts until 24 hours after your test drive, and at least 72 hours from booking.</p>
      {change && (
        <p className="hold__change" role="status">
          Re-estimated: {change > 0 ? `${change} hours longer` : `${Math.abs(change)} hours shorter`}
        </p>
      )}
    </div>
  );
}
