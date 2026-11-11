"use client";

import { AnimatePresence, motion } from "motion/react";
import { frequencies, homeSizes, plans } from "@/lib/data";
import { useBooking, useBookNow } from "./BookingContext";

export function Pricing() {
  const { draft, setDraft } = useBooking();
  const bookNow = useBookNow();
  const freq = frequencies.find((f) => f.id === draft.frequency)!;

  return (
    <section id="prices" className="relative overflow-hidden bg-sky py-24 text-white md:py-32">
      {/* A large faint arch, echoing the hero */}
      <svg viewBox="0 0 600 300" className="pointer-events-none absolute -right-40 -top-10 w-[56rem] opacity-20" aria-hidden="true">
        <path d="M40 300a260 260 0 0 1 520 0" fill="none" stroke="white" strokeWidth="56" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display-tight text-h2 font-extrabold">Prices you can see before we come over.</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white">
              Flat prices by home size, GST included. Regular visits cost less the more often we come. No contracts:
              pause or cancel with 48 hours&rsquo; notice.
            </p>
          </div>

          <div className="flex flex-col gap-7 lg:col-span-6 lg:col-start-7">
            <Segmented
              label="Your home"
              options={homeSizes}
              value={draft.size}
              onChange={(size) => setDraft({ size })}
            />
            <Segmented
              label="How often for regular cleans"
              options={frequencies.map((f) => ({
                id: f.id,
                label: f.label,
                badge: f.off ? `-${Math.round(f.off * 100)}%` : undefined,
              }))}
              value={draft.frequency}
              onChange={(frequency) => setDraft({ frequency })}
            />
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-[1.75rem] bg-white text-navy shadow-[0_30px_60px_-30px_rgba(19,41,75,0.55)]">
          {plans.map((plan, i) => {
            const base = plan.price[draft.size];
            const price = plan.recurring ? Math.round(base * (1 - freq.off)) : base;
            const discounted = plan.recurring && freq.off > 0;
            return (
              <div
                key={plan.id}
                className={`grid items-center gap-x-8 gap-y-4 px-6 py-7 md:grid-cols-12 md:px-10 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="md:col-span-5">
                  <h3 className="text-h3 font-bold">{plan.name}</h3>
                  <p className="mt-1 text-[15px] text-navy-soft">{plan.note}</p>
                </div>
                <p className="text-[15px] text-navy-soft md:col-span-2">
                  About {plan.hours[draft.size]}
                  <span className="block text-sm">{plan.recurring ? freq.label.toLowerCase() : "one visit"}</span>
                </p>
                <div className="flex items-baseline gap-3 md:col-span-3">
                  <RollingPrice value={price} />
                  {discounted && <span className="text-base text-navy-soft line-through">${base}</span>}
                </div>
                <div className="md:col-span-2 md:text-right">
                  <button
                    onClick={() => bookNow({ service: plan.id })}
                    className={`w-full rounded-full px-5 py-3 font-semibold md:w-auto ${
                      i === 0 ? "bg-rose text-white hover:bg-navy" : "bg-sky-pale text-navy hover:bg-navy hover:text-white"
                    }`}
                  >
                    Book this
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 max-w-2xl text-[15px] text-white">
          Pets, extra-large basements or a home that hasn&rsquo;t been cleaned in a while? Add a note when you book and
          we&rsquo;ll confirm the price before your visit.
        </p>
      </div>
    </section>
  );
}

function RollingPrice({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-[3.25rem] items-center overflow-hidden text-[2.75rem] font-extrabold tracking-tight tabular-nums">
      <span>$</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {value} dollars
      </span>
    </span>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string; badge?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-[15px] font-medium text-white">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.id === value;
          return (
            <label
              key={o.id}
              className={`relative cursor-pointer rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-canola ${
                on ? "text-navy" : "bg-navy/25 text-white hover:bg-navy/40"
              }`}
            >
              {on && (
                <motion.span
                  layoutId={`seg-${label}`}
                  className="absolute inset-0 rounded-full bg-canola"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <input
                type="radio"
                name={label}
                value={o.id}
                checked={on}
                onChange={() => onChange(o.id)}
                className="sr-only"
              />
              <span className="relative">
                {o.label}
                {o.badge && <span className={`ml-1.5 text-sm ${on ? "text-navy/75" : "text-white"}`}>{o.badge}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
