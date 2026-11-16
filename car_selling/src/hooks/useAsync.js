import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async function whenever deps change.
 * Returns { status: 'loading' | 'success' | 'error', data, error, reload }.
 * Stale responses from earlier calls are ignored.
 */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ status: 'loading', data: undefined, error: null });
  const callId = useRef(0);

  const run = useCallback(() => {
    const id = ++callId.current;
    setState((s) => ({ status: 'loading', data: s.data, error: null }));
    fn().then(
      (data) => id === callId.current && setState({ status: 'success', data, error: null }),
      (error) => id === callId.current && setState({ status: 'error', data: undefined, error }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => { callId.current++; };
  }, [run]);

  return { ...state, reload: run };
}
