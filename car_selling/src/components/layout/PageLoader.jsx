import Skeleton from '../ui/Skeleton';
import Spinner from '../ui/Spinner';

/** Fallback while a page's code chunk downloads. */
export default function PageLoader() {
  return (
    <div className="container page" aria-busy="true">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--c-ink-2)', marginBottom: 32 }}>
        <Spinner size={18} label="Loading page" />
        <span aria-hidden="true">Loading…</span>
      </div>
      <Skeleton width="min(520px, 80%)" height={64} />
      <div style={{ display: 'grid', gap: 12, marginTop: 24, maxWidth: 560 }}>
        <Skeleton height={16} />
        <Skeleton height={16} width="75%" />
      </div>
    </div>
  );
}
