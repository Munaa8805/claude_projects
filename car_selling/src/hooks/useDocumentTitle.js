import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Forecourt` : 'Forecourt — inspected cars, reserved online';
  }, [title]);
}
