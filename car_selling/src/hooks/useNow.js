import { useEffect, useState } from 'react';

/** Current time, refreshed every `interval` ms. Pass 0 to pause. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!interval) return undefined;
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}
