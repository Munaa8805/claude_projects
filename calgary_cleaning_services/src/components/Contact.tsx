import { areas, contact } from "@/lib/data";
import { Logo } from "./Logo";

const quadColors: Record<string, string> = {
  NW: "var(--color-sky)",
  NE: "var(--color-canola)",
  SW: "var(--color-river)",
  SE: "var(--color-rose)",
};

export function Contact() {
  return (
    <footer id="contact" className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display-tight text-h2 font-extrabold">Questions first? Call, text or email us.</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
              A real person in Calgary answers. Most messages get a reply within the hour during office hours.
            </p>

            <div className="mt-10 space-y-2">
              <a href={contact.phoneHref} className="block text-[2.25rem] font-extrabold tracking-tight hover:text-canola md:text-[2.75rem]">
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="block text-xl font-semibold text-river underline decoration-2 underline-offset-4 hover:text-white">
                {contact.email}
              </a>
            </div>

            <dl className="mt-10 grid max-w-sm grid-cols-[auto_1fr] gap-x-8 gap-y-2.5 text-[15px]">
              {contact.hours.map(([day, time]) => (
                <div key={day} className="contents">
                  <dt className="text-white/65">{day}</dt>
                  <dd className="font-medium">{time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h3 className="text-h3 font-bold">Where we clean</h3>
            <p className="mt-2 text-[15px] text-white/70">
              All four quadrants of Calgary, plus Airdrie, Cochrane and Chestermere at no extra charge.
            </p>
            <AreaMap />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between md:px-8">
          <Logo light />
          <p>Bonded and insured. WCB Alberta registered. &copy; 2026 Chinook Clean Co.</p>
        </div>
      </div>
    </footer>
  );
}

function AreaMap() {
  const order = ["NW", "NE", "SW", "SE"] as const;
  return (
    <div className="relative mt-8 px-0 pb-10 pt-10 sm:px-14">
      <Town className="left-1/2 top-0 -translate-x-1/2">Airdrie</Town>
      <Town className="bottom-0 left-1/2 -translate-x-1/2">Okotoks by request</Town>
      <Town className="left-0 top-1/2 hidden -translate-y-1/2 -rotate-90 sm:block">Cochrane</Town>
      <Town className="right-0 top-1/2 hidden -translate-y-1/2 rotate-90 sm:block">Chestermere</Town>

      <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-[1.5rem]">
        {order.map((q) => (
          <div key={q} className="bg-white/[0.06] p-5 md:p-6">
            <p className="flex items-center gap-2 text-2xl font-extrabold">
              <span className="size-3 rounded-full" style={{ background: quadColors[q] }} aria-hidden="true" />
              {q}
            </p>
            <ul className="mt-3 space-y-1 text-[15px] text-white/75">
              {areas[q].map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[15px] text-white/70 sm:hidden">Also Cochrane and Chestermere.</p>
    </div>
  );
}

function Town({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`absolute whitespace-nowrap text-[15px] font-semibold text-canola ${className}`}>{children}</span>
  );
}
