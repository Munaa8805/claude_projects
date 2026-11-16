import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [ids, setIds] = usePersistentState('fc:saved', []);
  /** Returns true when the car is now saved. */
  const toggle = useCallback((id) => {
    const saved = !ids.includes(id);
    setIds(saved ? [...ids, id] : ids.filter((x) => x !== id));
    return saved;
  }, [ids, setIds]);
  const has = useCallback((id) => ids.includes(id), [ids]);
  const value = useMemo(() => ({ ids, toggle, has }), [ids, toggle, has]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export const useSaved = () => useContext(SavedContext);
