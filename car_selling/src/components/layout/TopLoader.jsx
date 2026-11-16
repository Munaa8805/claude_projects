import { useEffect, useState, useSyncExternalStore } from 'react';
import { activity } from '../../api/client';
import './TopLoader.css';

/**
 * Thin bar under the header while any API request is in flight.
 * Waits 150ms before appearing so fast responses don't flash it,
 * then finishes with a quick fill-and-fade when everything settles.
 */
export default function TopLoader() {
  const busy = useSyncExternalStore(activity.subscribe, activity.get) > 0;
  const [phase, setPhase] = useState('idle'); // idle | running | done

  useEffect(() => {
    if (busy) {
      const t = setTimeout(() => setPhase('running'), 150);
      return () => clearTimeout(t);
    }
    if (phase === 'running') {
      setPhase('done');
      const t = setTimeout(() => setPhase('idle'), 400);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  return (
    <div
      className={`top-loader top-loader--${phase}`}
      role="progressbar"
      aria-label="Loading"
      aria-hidden={phase === 'idle'}
      aria-busy={phase === 'running'}
    >
      <span className="top-loader__bar" />
    </div>
  );
}
