import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

/** The cart holds car ids. Each car can only be in the cart once. */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [ids, setIds] = usePersistentState('fc:cart', []);

  const add = useCallback((id) => setIds((cur) => (cur.includes(id) ? cur : [...cur, id])), [setIds]);
  const remove = useCallback((id) => setIds((cur) => cur.filter((x) => x !== id)), [setIds]);
  const clear = useCallback(() => setIds([]), [setIds]);
  const has = useCallback((id) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, count: ids.length, add, remove, clear, has }), [ids, add, remove, clear, has]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
