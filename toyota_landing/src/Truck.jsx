// Side profile of the Predator, drawn as an SVG so it can be repainted
// (thermal view or any paint colour) without image assets.
export default function Truck({ mode = 'thermal', paint = '#5B6B4E', className = '' }) {
  const thermal = mode === 'thermal'
  const body = thermal ? 'url(#heat-body)' : paint
  const glass = thermal ? 'url(#heat-glass)' : '#1E2A30'
  const tyre = thermal ? 'url(#heat-tyre)' : '#17191A'
  const rim = thermal ? '#FFE08A' : '#3A3F42'

  return (
    <svg
      className={`truck ${className}`}
      viewBox="0 0 820 340"
      role="img"
      aria-label={thermal ? 'Toyota Predator seen through a thermal camera' : 'Toyota Predator side view'}
    >
      <defs>
        {/* Heat is hottest at the engine bay and wheels, coolest at the roof */}
        <linearGradient id="heat-body" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor="#FFF4C2" />
          <stop offset="0.16" stopColor="#FFB300" />
          <stop offset="0.38" stopColor="#E8452C" />
          <stop offset="0.66" stopColor="#B0177A" />
          <stop offset="1" stopColor="#3A1D7A" />
        </linearGradient>
        <linearGradient id="heat-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5A1E8C" />
          <stop offset="1" stopColor="#221650" />
        </linearGradient>
        <radialGradient id="heat-tyre">
          <stop offset="0.35" stopColor="#FFD04D" />
          <stop offset="0.7" stopColor="#E8452C" />
          <stop offset="1" stopColor="#7A1468" />
        </radialGradient>
        <filter id="heat-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={thermal ? 'url(#heat-glow)' : undefined}>
        {/* roof rack */}
        <g stroke={thermal ? '#4B2391' : '#2A2E30'} strokeWidth="6" strokeLinecap="round">
          <line x1="292" y1="66" x2="566" y2="62" />
          <line x1="320" y1="66" x2="320" y2="80" />
          <line x1="440" y1="64" x2="440" y2="78" />
          <line x1="540" y1="62" x2="540" y2="76" />
        </g>

        {/* body */}
        <path
          fill={body}
          d="M62 252 L60 206 Q60 184 84 180 L196 168 L262 96 Q272 84 292 83 L560 78
             Q588 78 598 96 L648 162 L728 170 Q756 174 760 200 L762 252
             L700 252 A86 86 0 0 0 528 252 L282 252 A86 86 0 0 0 110 252 Z"
        />

        {/* glass */}
        <path fill={glass} d="M222 168 L276 106 Q282 99 294 99 L404 97 L404 168 Z" />
        <path fill={glass} d="M420 97 L552 95 Q566 95 574 106 L620 166 L420 168 Z" />

        {/* body line, door seam, handle */}
        <g fill="none" stroke={thermal ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.28)'} strokeWidth="3">
          <path d="M70 212 L752 212" />
          <path d="M412 100 L412 248" />
          <path d="M620 168 L620 248" />
        </g>
        <rect x="350" y="184" width="36" height="7" rx="3.5" fill={thermal ? '#FFE08A' : '#2A2E30'} />
        <rect x="560" y="184" width="36" height="7" rx="3.5" fill={thermal ? '#FFE08A' : '#2A2E30'} />

        {/* lamps */}
        <rect x="738" y="184" width="22" height="14" rx="3" fill={thermal ? '#FFFFFF' : '#F2E6B8'} />
        <rect x="58" y="190" width="12" height="20" rx="3" fill={thermal ? '#FFD04D' : '#9C2B23'} />

        {/* wheels */}
        {[196, 614].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="256" r="70" fill={tyre} />
            <circle cx={cx} cy="256" r="38" fill={thermal ? 'none' : '#26292B'} stroke={rim} strokeWidth="6" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line
                key={a}
                x1={cx}
                y1="256"
                x2={cx + 34 * Math.cos((a * Math.PI) / 180)}
                y2={256 + 34 * Math.sin((a * Math.PI) / 180)}
                stroke={rim}
                strokeWidth="5"
                strokeLinecap="round"
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
