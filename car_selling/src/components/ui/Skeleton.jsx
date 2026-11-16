import './Skeleton.css';
export default function Skeleton({ width = '100%', height = 16, radius, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}
