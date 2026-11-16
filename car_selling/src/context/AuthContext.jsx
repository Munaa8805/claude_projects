import { createContext, useCallback, useContext, useMemo } from 'react';
import * as api from '../api/client';
import { usePersistentState } from '../hooks/usePersistentState';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = usePersistentState('fc:session', null);

  const login = useCallback(async (creds) => setUser(await api.login(creds)), [setUser]);
  const register = useCallback(async (data) => setUser(await api.register(data)), [setUser]);
  const logout = useCallback(() => setUser(null), [setUser]);
  const update = useCallback(async (patch) => {
    const next = await api.updateUser(user.id, patch);
    setUser(next);
    return next;
  }, [user, setUser]);

  const value = useMemo(() => ({ user, login, register, logout, update }), [user, login, register, logout, update]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
