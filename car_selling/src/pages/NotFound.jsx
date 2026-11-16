import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Button from '../components/ui/Button';
import Plate from '../components/ui/Plate';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container page" style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <Plate size="lg">404</Plate>
      <h1 className="display" style={{ fontSize: 'var(--fs-3xl)', maxWidth: '14ch' }}>This page isn’t on the lot.</h1>
      <p className="muted" style={{ maxWidth: '52ch' }}>The link may be old or mistyped. Every car we have in stock is on the browse page.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button to="/cars">Browse cars</Button>
        <Button to="/" variant="secondary">Go to the homepage</Button>
      </div>
    </div>
  );
}
