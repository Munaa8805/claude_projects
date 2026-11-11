import Image from "next/image";
import { images } from "@/lib/data";

const promises = [
  { text: "Bonded and insured in Alberta", color: "bg-sky" },
  { text: "The same cleaner every visit", color: "bg-rose" },
  { text: "We bring every supply", color: "bg-river" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h1 className="hero-in display-tight text-display font-extrabold text-balance" style={{ animationDelay: "0.45s" }}>
            Come home to a house that feels like a clear chinook sky.
          </h1>

          <div className="hero-in" style={{ animationDelay: "0.85s" }}>
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-navy-soft md:text-xl">
              Calgary&rsquo;s home and office cleaners since 2016. Book a regular clean, a deep clean or a
              move-out clean online in two minutes, with prices you can see before you book.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#book"
                className="rounded-full bg-rose px-7 py-4 text-base font-semibold text-white shadow-[0_8px_0_-2px_var(--color-navy)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_0_-2px_var(--color-navy)] active:translate-y-0.5 active:shadow-[0_4px_0_-2px_var(--color-navy)]"
              >
                Book a clean
              </a>
              <a
                href="#prices"
                className="rounded-full px-6 py-4 text-base font-semibold text-navy underline decoration-sky decoration-2 underline-offset-4 hover:decoration-rose"
              >
                See prices for your home
              </a>
            </div>

            <ul className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-7">
              {promises.map((p) => (
                <li key={p.text} className="flex items-center gap-2.5 text-[15px] font-medium">
                  <span className={`size-2.5 rounded-full ${p.color}`} aria-hidden="true" />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <HeroArch />
      </div>
    </section>
  );
}

function HeroArch() {
  const bands = [
    { r: 262, color: "var(--color-sky)", w: 9 },
    { r: 250, color: "var(--color-river)", w: 9 },
    { r: 238, color: "var(--color-rose)", w: 9 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[30rem] lg:col-span-5">
      {/* Arch bands behind the photo */}
      <svg viewBox="0 0 540 290" className="absolute -top-16 left-1/2 w-[118%] -translate-x-1/2" aria-hidden="true">
        {bands.map((b, i) => (
          <path
            key={b.r}
            d={`M ${270 - b.r} 290 A ${b.r} ${b.r} 0 0 1 ${270 + b.r} 290`}
            pathLength={1}
            fill="none"
            stroke={b.color}
            strokeWidth={b.w}
            strokeLinecap="round"
            className="hero-band"
            style={{ animationDelay: `${0.1 + i * 0.12}s` }}
          />
        ))}
      </svg>

      {/* Sun */}
      <div
        className="hero-sun absolute -right-2 top-[30%] z-10 size-24 rounded-full bg-canola md:size-28"
        aria-hidden="true"
      />

      {/* Photo inside the arch */}
      <div className="hero-photo arch relative aspect-[4/5] overflow-hidden bg-sky-pale">
        <Image
          src={images.hero}
          alt="A Chinook Clean cleaner in yellow gloves wiping down a window frame"
          fill
          priority
          sizes="(min-width: 1024px) 480px, 90vw"
          className="object-cover"
        />
      </div>

      <p
        style={{ animationDelay: "1.3s" }}
        className="hero-in absolute -bottom-5 left-5 z-10 max-w-[15rem] rounded-2xl bg-white px-5 py-4 text-[15px] leading-snug shadow-[0_18px_40px_-18px_rgba(19,41,75,0.45)]"
      >
        <span className="font-bold">Booked for 9am Thursday.</span> We&rsquo;ll text you when we&rsquo;re 20 minutes out.
      </p>
    </div>
  );
}
