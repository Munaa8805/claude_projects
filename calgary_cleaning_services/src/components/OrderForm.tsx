"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { frequencies, homeSizes, plans, services } from "@/lib/data";
import { useBooking } from "./BookingContext";

const steps = ["Your clean", "Day and time", "Your details"] as const;
const windows = [
  { id: "morning", label: "Morning", time: "8am – 12pm" },
  { id: "afternoon", label: "Afternoon", time: "12pm – 4pm" },
  { id: "evening", label: "Evening", time: "4pm – 8pm" },
];
const entries = ["I'll be home", "Key under the mat or lockbox", "Concierge or building manager"];

type Details = {
  date: string;
  window: string;
  entry: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export function OrderForm() {
  const { draft, setDraft } = useBooking();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [d, setD] = useState<Details>({
    date: "",
    window: "morning",
    entry: entries[0],
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setD((p) => ({ ...p, [k]: e.target.value }));

  const service = services.find((s) => s.id === draft.service)!;
  const plan = plans.find((p) => p.id === draft.service);
  const freq = frequencies.find((f) => f.id === draft.frequency)!;
  const recurring = draft.service === "standard";
  const estimate = plan
    ? Math.round(plan.price[draft.size] * (recurring ? 1 - freq.off : 1))
    : null;

  function go(next: number) {
    setError("");
    if (next > step) {
      const fields = formRef.current?.querySelectorAll<HTMLInputElement>(`[data-step="${step}"] :is(input,textarea,select)`);
      const bad = fields && Array.from(fields).find((f) => !f.checkValidity());
      if (bad) {
        setError(bad.dataset.error || "Fill in the highlighted field to continue.");
        bad.focus();
        return;
      }
    }
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 2) return go(step + 1);
    const fields = formRef.current?.querySelectorAll<HTMLInputElement>(`[data-step="2"] :is(input,textarea)`);
    const bad = fields && Array.from(fields).find((f) => !f.checkValidity());
    if (bad) {
      setError(bad.dataset.error || "Fill in the highlighted field to continue.");
      bad.focus();
      return;
    }
    // No backend yet: this is where the request would be sent to email or a CRM.
    setSent(true);
  }

  const prettyDate = d.date
    ? new Date(d.date + "T12:00").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })
    : "Pick a day";

  return (
    <section id="book" className="bg-canola-pale py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <h2 id="book-start" tabIndex={-1} className="display-tight text-h2 font-extrabold outline-none">
            Book your clean.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-navy-soft">
            Three short steps. We call or text within two business hours to confirm, and you pay after the clean.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_24px_50px_-30px_rgba(19,41,75,0.4)] md:p-10 lg:col-span-8">
            {sent ? (
              <Confirmation name={d.name} date={prettyDate} phone={d.phone} />
            ) : (
              <>
                <ol className="flex gap-2 md:gap-3" aria-label="Booking steps">
                  {steps.map((s, idx) => (
                    <li key={s} className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-line">
                        <motion.div
                          className="h-full bg-rose"
                          initial={false}
                          animate={{ width: idx <= step ? "100%" : "0%" }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <p
                        className={`mt-2.5 text-sm font-medium md:text-[15px] ${idx === step ? "text-navy" : "text-navy-soft"}`}
                        aria-current={idx === step ? "step" : undefined}
                      >
                        <span className="tabular-nums">{idx + 1}.</span> {s}
                      </p>
                    </li>
                  ))}
                </ol>

                <form ref={formRef} onSubmit={submit} noValidate className="mt-9">
                  <div className="relative min-h-[22rem] overflow-hidden">
                    <AnimatePresence mode="wait" custom={dir} initial={false}>
                      <motion.div
                        key={step}
                        custom={dir}
                        initial={{ opacity: 0, x: dir * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dir * -40 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        data-step={step}
                      >
                        {step === 0 && (
                          <div className="space-y-8">
                            <ChoiceGroup legend="What do you need?">
                              <div className="grid gap-2.5 sm:grid-cols-2">
                                {services.map((s) => (
                                  <Choice
                                    key={s.id}
                                    name="service"
                                    checked={draft.service === s.id}
                                    onChange={() => setDraft({ service: s.id })}
                                    title={s.name}
                                    sub={`from $${s.from}`}
                                    dot={s.color}
                                  />
                                ))}
                              </div>
                            </ChoiceGroup>
                            <div className="grid gap-6 sm:grid-cols-2">
                              <Select
                                label="Home size"
                                value={draft.size}
                                onChange={(e) => setDraft({ size: e.target.value as typeof draft.size })}
                                options={homeSizes.map((h) => [h.id, h.label])}
                              />
                              {recurring && (
                                <Select
                                  label="How often"
                                  value={draft.frequency}
                                  onChange={(e) => setDraft({ frequency: e.target.value as typeof draft.frequency })}
                                  options={frequencies.map((f) => [
                                    f.id,
                                    f.off ? `${f.label} (save ${Math.round(f.off * 100)}%)` : f.label,
                                  ])}
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {step === 1 && (
                          <div className="space-y-8">
                            <Field label="Day of your first visit">
                              <input
                                type="date"
                                required
                                ref={(el) => {
                                  if (el) el.min = tomorrow();
                                }}
                                value={d.date}
                                onChange={set("date")}
                                data-error="Choose a day for your first visit, starting tomorrow."
                                className={inputCls}
                              />
                            </Field>
                            <ChoiceGroup legend="Arrival window">
                              <div className="grid gap-2.5 sm:grid-cols-3">
                                {windows.map((w) => (
                                  <Choice
                                    key={w.id}
                                    name="window"
                                    checked={d.window === w.id}
                                    onChange={() => setD((p) => ({ ...p, window: w.id }))}
                                    title={w.label}
                                    sub={w.time}
                                  />
                                ))}
                              </div>
                            </ChoiceGroup>
                            <Select
                              label="How will we get in?"
                              value={d.entry}
                              onChange={set("entry")}
                              options={entries.map((e) => [e, e])}
                            />
                          </div>
                        )}

                        {step === 2 && (
                          <div className="grid gap-6 sm:grid-cols-2">
                            <Field label="Full name">
                              <input required autoComplete="name" value={d.name} onChange={set("name")} data-error="Enter your name so the crew knows who to ask for." className={inputCls} />
                            </Field>
                            <Field label="Mobile number">
                              <input
                                required
                                type="tel"
                                autoComplete="tel"
                                pattern="[\d\s()+\-]{10,}"
                                value={d.phone}
                                onChange={set("phone")}
                                placeholder="403 555 0148"
                                data-error="Enter a 10-digit phone number so we can confirm by text."
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Email" className="sm:col-span-2">
                              <input required type="email" autoComplete="email" value={d.email} onChange={set("email")} data-error="Enter an email address for your booking receipt." className={inputCls} />
                            </Field>
                            <Field label="Address in Calgary or nearby" className="sm:col-span-2">
                              <input required autoComplete="street-address" value={d.address} onChange={set("address")} placeholder="Street address and postal code" data-error="Enter the address we'll be cleaning." className={inputCls} />
                            </Field>
                            <Field label="Anything we should know? (optional)" className="sm:col-span-2">
                              <textarea rows={3} value={d.notes} onChange={set("notes")} placeholder="Pets, parking, rooms to skip, products you prefer…" className={inputCls} />
                            </Field>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <p role="alert" className="mt-4 min-h-6 text-[15px] font-medium text-[#c2264f]">
                    {error}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-6">
                    {step > 0 ? (
                      <button type="button" onClick={() => go(step - 1)} className="rounded-full px-4 py-3 font-semibold text-navy-soft hover:text-navy">
                        Back
                      </button>
                    ) : (
                      <span />
                    )}
                    <button type="submit" className="rounded-full bg-navy px-7 py-3.5 font-semibold text-white hover:bg-sky">
                      {step < 2 ? "Continue" : "Send booking request"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <aside className="lg:col-span-4" aria-label="Booking summary">
            <div className="rounded-[1.75rem] bg-navy p-7 text-white lg:sticky lg:top-24 md:p-8">
              <h3 className="text-h3 font-bold">Your booking</h3>
              <dl className="mt-6 space-y-4 text-[15px]">
                <Row k="Service" v={service.name} />
                <Row k="Home" v={homeSizes.find((h) => h.id === draft.size)!.label} />
                <Row k="Visits" v={recurring ? freq.label : "One time"} />
                <Row k="When" v={d.date ? `${prettyDate}, ${windows.find((w) => w.id === d.window)!.time}` : "Pick a day"} />
              </dl>
              <div className="mt-7 border-t border-white/15 pt-6">
                <p className="text-[15px] text-white/70">{estimate ? "Price per visit" : "Starting price"}</p>
                <p className="mt-1 text-[2.75rem] font-extrabold leading-none tracking-tight tabular-nums">
                  ${estimate ?? service.from}
                </p>
                <p className="mt-3 text-sm text-white/70">
                  {estimate
                    ? "GST included. You pay after the clean."
                    : "We confirm the exact price on a quick call before your visit."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function tomorrow() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
}

const inputCls =
  "mt-2 block w-full rounded-xl border-2 border-line bg-snow px-4 py-3 text-base text-navy placeholder:text-navy-soft/60 outline-none transition focus:border-sky focus:bg-white aria-[invalid=true]:border-rose user-invalid:border-rose";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-[15px] font-semibold ${className}`}>
      {label}
      {children}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: [string, string][];
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={onChange} className={`${inputCls} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5 8l5 5 5-5%22 fill=%22none%22 stroke=%22%2313294b%22 stroke-width=%222%22/></svg>')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12`}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ChoiceGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[15px] font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Choice({
  name,
  checked,
  onChange,
  title,
  sub,
  dot,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  sub: string;
  dot?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sky ${
        checked ? "border-navy bg-sky-pale/60" : "border-line hover:border-navy-soft/50"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-navy" : "border-line"}`}
        aria-hidden="true"
      >
        {checked && <motion.span layoutId={`dot-${name}`} className="size-2.5 rounded-full bg-navy" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-tight">{title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-sm text-navy-soft">
          {dot && <span className="size-2 rounded-full" style={{ background: dot }} aria-hidden="true" />}
          {sub}
        </span>
      </span>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/70">{k}</dt>
      <dd className="text-right font-semibold">{v}</dd>
    </div>
  );
}

function Confirmation({ name, date, phone }: { name: string; date: string; phone: string }) {
  return (
    <div className="flex min-h-[26rem] flex-col items-start justify-center" role="status">
      <svg viewBox="0 0 64 64" className="size-16" aria-hidden="true">
        <motion.circle cx="32" cy="32" r="30" fill="var(--color-river)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} />
        <motion.path
          d="M19 33l9 9 17-19"
          fill="none"
          stroke="var(--color-navy)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.25, duration: 0.45 }}
        />
      </svg>
      <h3 className="mt-7 text-[2rem] font-extrabold leading-tight tracking-tight">
        Booking request sent{name ? `, ${name.split(" ")[0]}` : ""}.
      </h3>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-navy-soft">
        We&rsquo;ll text {phone || "you"} within two business hours to confirm {date}. Nothing is charged until after
        your clean.
      </p>
    </div>
  );
}
