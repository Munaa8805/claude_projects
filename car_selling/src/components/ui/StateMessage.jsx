import Icon from './Icon';
import Button from './Button';
import './StateMessage.css';

/** Shared layout for empty and error states. Always offers a next step. */
export default function StateMessage({ tone = 'empty', title, children, action, onRetry, compact = false }) {
  return (
    <div className={`state state--${tone}${compact ? ' state--compact' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <span className="state__icon"><Icon name={tone === 'error' ? 'alert' : 'road'} size={28} /></span>
      <h2 className="state__title title">{title}</h2>
      {children && <p className="state__body">{children}</p>}
      <div className="state__actions">
        {onRetry && <Button variant="primary" onClick={onRetry}>Try again</Button>}
        {action}
      </div>
    </div>
  );
}
