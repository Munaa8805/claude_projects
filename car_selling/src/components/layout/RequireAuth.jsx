import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Sends signed-out visitors to /login, then back here afterwards. */
export default function RequireAuth({ children, reason }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search, reason }} />;
  }
  return children;
}
