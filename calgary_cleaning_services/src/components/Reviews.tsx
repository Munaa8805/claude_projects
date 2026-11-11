"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { reviews } from "@/lib/data";

export function Reviews() {
  const [i, setI] = useState(0);
  const r = reviews[i];
  const light = r.color === "var(--color-sky)";

  return (
    <section id="reviews" className="py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="display-tight text-h2 font-extrabold">What Calgary says after we leave.</h2>
          <p className="mt-6 flex items-center gap-3 text-lg">
            <Stars />
            <span>
              <strong className="font-bold">4.9</strong> from 380 Google reviews
            </span>
          </p>

          <div className="mt-10 flex flex-col" role="tablist" aria-label="Choose a review">
            {reviews.map((rv, idx) => {
              const on = idx === i;
              return (
                <button
                  key={rv.name}
                  role="tab"
                  aria-selected={on}
                  aria-controls="review-panel"
                  onClick={() => setI(idx)}
                  className="flex items-center gap-4 border-b border-line py-4 text-left first:border-t"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-full text-[15px] font-bold transition ${
                      on ? "scale-100" : "scale-90 opacity-50"
                    }`}
                    style={{ background: rv.color, color: rv.color === "var(--color-sky)" ? "white" : "var(--color-navy)" }}
                    aria-hidden="true"
                  >
                    {rv.name.replace("Dr. ", "")[0]}
                  </span>
                  <span className={on ? "" : "opacity-55"}>
                    <span className="block font-semibold">{rv.name}</span>
                    <span className="block text-[15px] text-navy-soft">
                      {rv.area}, {rv.service.toLowerCase()}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8">
          <figure
            id="review-panel"
            role="tabpanel"
            style={{ backgroundColor: r.color }}
            className={`relative transition-colors duration-500 flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[2rem] p-8 md:min-h-[32rem] md:p-14 ${
              light ? "text-white" : "text-navy"
            }`}
          >
            <svg viewBox="0 0 120 90" className="absolute -bottom-6 -right-6 w-56 opacity-25 md:w-80" aria-hidden="true">
              <path d="M6 90a54 54 0 0 1 108 0" fill="none" stroke="currentColor" strokeWidth="14" />
              <path d="M32 90a28 28 0 0 1 56 0" fill="none" stroke="currentColor" strokeWidth="14" />
            </svg>
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <blockquote className="text-[1.65rem] font-semibold leading-[1.22] tracking-tight text-pretty md:text-[2.4rem]">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-10 text-lg">
                  <span className="font-bold">{r.name}</span>, {r.area}
                  <span className="block text-base opacity-80">{r.service}</span>
                </figcaption>
              </motion.div>
            </AnimatePresence>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <span className="flex gap-0.5" aria-label="5 out of 5 stars" role="img">
      {Array.from({ length: 5 }).map((_, k) => (
        <svg key={k} viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path
            d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z"
            fill="var(--color-canola)"
            stroke="var(--color-navy)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}
