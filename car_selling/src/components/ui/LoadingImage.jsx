import { useEffect, useRef, useState } from 'react';
import Spinner from './Spinner';
import './LoadingImage.css';

/**
 * <img> wrapper that shows a placeholder until the image has loaded, then fades it in.
 * variant: 'shimmer' (light surfaces) | 'spinner' (dark overlays like the lightbox)
 */
export default function LoadingImage({ className = '', variant = 'shimmer', onLoad, ...imgProps }) {
  const ref = useRef(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    // Cached images can finish before React attaches onLoad.
    if (ref.current?.complete && ref.current.naturalWidth > 0) setState('loaded');
  }, [imgProps.src]);

  return (
    <span className={`loading-img loading-img--${variant} is-${state} ${className}`.trim()}>
      {state === 'loading' && variant === 'spinner' && <span className="loading-img__spinner"><Spinner size={32} label="Loading photo" /></span>}
      {state === 'error' && <span className="loading-img__error">Photo unavailable</span>}
      <img
        ref={ref}
        {...imgProps}
        onLoad={(e) => { setState('loaded'); onLoad?.(e); }}
        onError={() => setState('error')}
      />
    </span>
  );
}
