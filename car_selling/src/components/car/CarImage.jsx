import { useState } from 'react';
import './CarImage.css';

/**
 * Car photo with a fixed aspect ratio, a placeholder while loading,
 * and a drawn fallback if the image fails.
 */
export default function CarImage({ car, width = 900, ratio = '3 / 2', eager = false, className = '' }) {
  const [state, setState] = useState('loading');
  const src = `${car.image}&w=${width}`;
  const srcSet = [width / 2, width, width * 1.5].map((w) => `${car.image}&w=${Math.round(w)} ${Math.round(w)}w`).join(', ');

  return (
    <div className={`car-img car-img--${state} ${className}`} style={{ aspectRatio: ratio }}>
      {state !== 'error' ? (
        <img
          src={src} srcSet={srcSet} sizes={`(max-width: 700px) 100vw, ${width}px`}
          alt={`${car.exterior} ${car.year} ${car.make} ${car.model}`}
          loading={eager ? 'eager' : 'lazy'} decoding="async"
          onLoad={() => setState('loaded')} onError={() => setState('error')}
        />
      ) : (
        <div className="car-img__fallback" role="img" aria-label={`Photo unavailable for ${car.year} ${car.make} ${car.model}`}>
          <svg viewBox="0 0 200 80" aria-hidden="true">
            <path d="M14 58c0-8 4-12 14-14l26-6 22-16c6-4 12-6 20-6h30c10 0 18 4 26 12l12 12 14 4c6 2 8 6 8 12v4h-14M44 62h82M14 62h6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="34" cy="62" r="11" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="148" cy="62" r="11" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
          <span>Photo coming soon</span>
        </div>
      )}
    </div>
  );
}
