import './Plate.css';
/** Stock number styled as a licence plate — the store's signature mark. */
export default function Plate({ children, size = 'md' }) {
  return <span className={`plate plate--${size}`} aria-label={`Stock number ${children}`}>{children}</span>;
}
