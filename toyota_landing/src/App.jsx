import { useState } from 'react'
import Truck from './Truck.jsx'

const PAINTS = [
  { id: 'moss', name: 'Moss', hex: '#5B6B4E', note: 'Matte, hides trail dust well' },
  { id: 'basalt', name: 'Basalt', hex: '#3B4045', note: 'Dark grey metallic' },
  { id: 'dune', name: 'Dune', hex: '#B89B6E', note: 'Desert sand, solid' },
  { id: 'ember', name: 'Ember', hex: '#A3402B', note: 'Deep oxide red' },
  { id: 'frost', name: 'Frost', hex: '#D9DCD6', note: 'Off-white, solid' },
]

const TRIMS = [
  {
    id: 'stalk',
    name: 'Stalk',
    price: 52900,
    summary: 'Everything you need to leave the pavement.',
    features: ['3.4L twin-turbo V6 hybrid, 437 hp', 'Part-time 4WD with low range', '33-inch all-terrain tyres', 'Rear locking differential'],
  },
  {
    id: 'pounce',
    name: 'Pounce',
    price: 61400,
    summary: 'Built for rocks and long weekends away.',
    features: ['Everything in Stalk', 'Front and rear lockers', 'Disconnecting front sway bar', 'Night-vision camera with thermal overlay'],
  },
  {
    id: 'apex',
    name: 'Apex',
    price: 74800,
    summary: 'For crossing a continent on dirt.',
    features: ['Everything in Pounce', 'Long-travel suspension, +2 in. lift', '35-inch tyres and steel skid plates', 'Factory roof rack and 40-in. light bar'],
  },
]

const ANGLES = [
  { label: 'Approach angle', value: '36°', detail: 'How steep a slope the front can climb onto without the bumper hitting.' },
  { label: 'Breakover angle', value: '27°', detail: 'How sharp a crest it can cross without beaching between the wheels.' },
  { label: 'Departure angle', value: '31°', detail: 'How steep a drop the rear can leave without scraping.' },
]

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function Nav() {
  return (
    <header className="nav">
      <a className="wordmark" href="#top">TOYOTA <span>Predator</span></a>
      <nav aria-label="Sections">
        <a href="#terrain">Capability</a>
        <a href="#paint">Paint</a>
        <a href="#trims">Trims</a>
        <a className="nav-cta" href="#reserve">Reserve</a>
      </nav>
    </header>
  )
}

function Hero() {
  const [mode, setMode] = useState('thermal')
  return (
    <section id="top" className={`hero hero--${mode}`}>
      <div className="hero-copy">
        <h1 className="hero-title">Predator</h1>
        <p className="hero-lede">
          A body-on-frame Toyota SUV that is as capable on a trail at 2&nbsp;a.m. as it is at noon.
          Arrives at dealers in spring 2027.
        </p>
      </div>

      <div className="hero-stage">
        <Truck mode={mode} />
        <div className="ground" aria-hidden="true" />
      </div>

      <div className="hero-foot">
        <div className="view-toggle" role="radiogroup" aria-label="Camera view">
          {[
            ['thermal', 'Thermal'],
            ['day', 'Daylight'],
          ].map(([id, label]) => (
            <button
              key={id}
              role="radio"
              aria-checked={mode === id}
              className={mode === id ? 'is-on' : ''}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="hero-caption">
          {mode === 'thermal'
            ? 'This is what the Pounce and Apex trims show on the dash at night: people, animals and washouts appear as heat, well beyond headlight range.'
            : 'The same truck in daylight, in Moss.'}
        </p>
        <a className="btn btn--primary" href="#reserve">Reserve a Predator</a>
      </div>
    </section>
  )
}

function Intro() {
  return (
    <section className="intro">
      <p>
        The Predator sits between the 4Runner and the Land Cruiser. It is short enough for tight
        forest tracks, has a hybrid V6 with the torque to crawl in silence on battery, and ships with
        a camera that sees in the dark.
      </p>
      <dl className="facts">
        <div><dt>Power</dt><dd>437 hp</dd></div>
        <div><dt>Torque</dt><dd>583 lb-ft</dd></div>
        <div><dt>Electric crawl</dt><dd>Up to 18 mi</dd></div>
        <div><dt>Towing</dt><dd>7,500 lb</dd></div>
      </dl>
    </section>
  )
}

function Terrain() {
  return (
    <section id="terrain" className="terrain">
      <h2>Made for terrain, not parking lots</h2>
      <p className="section-lede">Figures are for the Apex trim with 35-inch tyres.</p>

      <figure className="terrain-figure">
        <svg viewBox="0 0 900 260" role="img" aria-label="Diagram of the approach, breakover and departure angles">
          <path className="terrain-ground" d="M0 230 L150 230 L300 120 L360 120 L450 60 L540 120 L610 120 L760 210 L900 210" />
          <g className="terrain-angle">
            <path d="M300 120 L150 230" />
            <text x="190" y="170">36°</text>
            <path d="M450 60 L380 120 M450 60 L520 120" />
            <text x="432" y="45">27°</text>
            <path d="M610 120 L760 210" />
            <text x="700" y="150">31°</text>
          </g>
        </svg>
      </figure>

      <div className="angles">
        {ANGLES.map((a) => (
          <div key={a.label} className="angle">
            <p className="angle-value">{a.value}</p>
            <h3>{a.label}</h3>
            <p>{a.detail}</p>
          </div>
        ))}
      </div>

      <dl className="facts facts--wide">
        <div><dt>Ground clearance</dt><dd>11.6 in</dd></div>
        <div><dt>Wading depth</dt><dd>35 in</dd></div>
        <div><dt>Wheelbase</dt><dd>112 in</dd></div>
      </dl>
    </section>
  )
}

function Paint() {
  const [paint, setPaint] = useState(PAINTS[0])
  return (
    <section id="paint" className="paint">
      <div className="paint-copy">
        <h2>Pick a paint</h2>
        <p className="section-lede">Five colours, each chosen to look good under a layer of mud.</p>
        <div className="swatches" role="radiogroup" aria-label="Paint colour">
          {PAINTS.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={paint.id === p.id}
              aria-label={p.name}
              className={`swatch ${paint.id === p.id ? 'is-on' : ''}`}
              style={{ '--swatch': p.hex }}
              onClick={() => setPaint(p)}
            />
          ))}
        </div>
        <p className="paint-name">{paint.name}</p>
        <p className="paint-note">{paint.note}</p>
      </div>
      <div className="paint-stage">
        <Truck mode="day" paint={paint.hex} />
      </div>
    </section>
  )
}

function Trims({ onChoose }) {
  return (
    <section id="trims" className="trims">
      <h2>Three trims</h2>
      <p className="section-lede">Prices are MSRP before destination and taxes.</p>
      <div className="trim-grid">
        {TRIMS.map((t) => (
          <article key={t.id} className={`trim trim--${t.id}`}>
            <h3>{t.name}</h3>
            <p className="trim-price">From {fmt(t.price)}</p>
            <p className="trim-summary">{t.summary}</p>
            <ul>
              {t.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <a className="btn btn--ghost" href="#reserve" onClick={() => onChoose(t.id)}>
              Reserve {t.name}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

function Reserve({ trim, setTrim }) {
  const [sent, setSent] = useState(null)
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    if (!data.name.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) {
      setError('Enter your name and a valid email address to reserve.')
      return
    }
    setError('')
    setSent(data)
  }

  const chosen = TRIMS.find((t) => t.id === trim)

  return (
    <section id="reserve" className="reserve">
      <div className="reserve-copy">
        <h2>Reserve yours</h2>
        <p>
          A $500 refundable deposit holds your place in line. Your local dealer will contact you to
          confirm the build before production starts.
        </p>
      </div>

      {sent ? (
        <div className="reserve-done" role="status">
          <h3>Reserved</h3>
          <p>
            Thanks, {sent.name.split(' ')[0]}. Your {chosen.name} reservation is in. We sent a
            confirmation to {sent.email}.
          </p>
          <button className="btn btn--ghost" onClick={() => setSent(null)}>Change reservation</button>
        </div>
      ) : (
        <form className="reserve-form" onSubmit={submit} noValidate>
          <fieldset>
            <legend>Trim</legend>
            <div className="trim-pick">
              {TRIMS.map((t) => (
                <label key={t.id} className={trim === t.id ? 'is-on' : ''}>
                  <input type="radio" name="trim" value={t.id} checked={trim === t.id} onChange={() => setTrim(t.id)} />
                  <span>{t.name}</span>
                  <small>{fmt(t.price)}</small>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Full name</span>
            <input name="name" autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label className="field">
            <span>ZIP code</span>
            <input name="zip" inputMode="numeric" autoComplete="postal-code" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn--primary" type="submit">Reserve {chosen.name}</button>
        </form>
      )}
    </section>
  )
}

export default function App() {
  const [trim, setTrim] = useState('pounce')
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Terrain />
        <Paint />
        <Trims onChoose={setTrim} />
        <Reserve trim={trim} setTrim={setTrim} />
      </main>
      <footer className="footer">
        <p>Toyota Predator concept page. Specifications and prices are preliminary and may change.</p>
      </footer>
    </>
  )
}
