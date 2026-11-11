"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { services, type ServiceId } from "@/lib/data";
import { useBookNow } from "./BookingContext";

export function Services() {
  const [active, setActive] = useState<ServiceId>("standard");
  const current = services.find((s) => s.id === active)!;
  const bookNow = useBookNow();

  return (
    <section id="services" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <h2 className="display-tight text-h2 font-extrabold">Six kinds of clean, one crew that knows your home.</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-soft">
            Choose a service to see what&rsquo;s included. Not sure which you need? A deep clean first, then regular
            visits, is what most new clients do.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div role="tablist" aria-label="Cleaning services" aria-orientation="vertical" className="lg:col-span-6">
            {services.map((s) => {
              const selected = s.id === active;
              return (
                <button
                  key={s.id}
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls="service-panel"
                  onClick={() => setActive(s.id)}
                  onMouseEnter={() => setActive(s.id)}
                  className="group relative flex w-full items-baseline justify-between gap-6 border-b border-line py-5 text-left first:border-t"
                >
                  {selected && (
                    <motion.span
                      layoutId="service-marker"
                      className="absolute -left-5 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full"
                      style={{ background: s.color }}
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`text-[1.65rem] font-bold tracking-tight transition-colors md:text-[2rem] ${
                      selected ? "text-navy" : "text-navy/40 group-hover:text-navy/70"
                    }`}
                  >
                    {s.name}
                  </span>
                  <span className={`shrink-0 text-base font-medium ${selected ? "text-navy" : "text-navy/40"}`}>
                    from ${s.from}
                  </span>
                </button>
              );
            })}
          </div>

          <div id="service-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="lg:col-span-6">
            <div className="lg:sticky lg:top-24">
              <div className="relative">
                <div
                  className="absolute -inset-3 arch transition-colors duration-500"
                  style={{ background: current.color }}
                  aria-hidden="true"
                />
                <div className="arch relative aspect-[5/4] overflow-hidden bg-sky-pale sm:aspect-[16/11]">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={current.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Image src={current.image} alt={current.alt} fill sizes="(min-width: 1024px) 560px, 90vw" className="object-cover" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-9"
                >
                  <p className="max-w-[34rem] text-lg leading-relaxed">{current.blurb}</p>
                  <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {current.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[15px] text-navy-soft">
                        <Check color={current.color} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => bookNow({ service: current.id })}
                    className="mt-7 rounded-full bg-navy px-6 py-3.5 font-semibold text-white hover:bg-sky"
                  >
                    Book this service
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Check({ color = "var(--color-river)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill={color} opacity="0.25" />
      <path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="var(--color-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
