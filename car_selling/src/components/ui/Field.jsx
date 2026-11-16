import { useId } from 'react';
import './Field.css';

/** Labelled input/select/textarea with hint and error text wired for screen readers. */
export default function Field({ label, hint, error, as = 'input', children, className = '', ...rest }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  const Control = as;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      <label htmlFor={id} className="field__label">{label}</label>
      <Control id={id} className="field__control" aria-invalid={!!error || undefined} aria-describedby={describedBy} {...rest}>
        {children}
      </Control>
      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field__error">{error}</p>}
    </div>
  );
}
