import { Link } from 'react-router-dom';
import Spinner from './Spinner';
import './Button.css';

/**
 * variant: primary (plate yellow) | secondary (outlined) | ghost | danger
 * Renders a <Link> when `to` is given.
 */
export default function Button({ variant = 'primary', size = 'md', to, loading = false, block = false, className = '', children, ...rest }) {
  const cls = `btn btn--${variant} btn--${size}${block ? ' btn--block' : ''} ${className}`.trim();
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  return (
    <button className={cls} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner size={16} />}
      <span>{children}</span>
    </button>
  );
}
