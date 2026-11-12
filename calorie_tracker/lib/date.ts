/** Dates are plain "YYYY-MM-DD" strings in the user's local calendar. */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = parse(value);
  return toIsoDate(d) === value; // rejects 2026-02-31 etc.
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const today = () => toIsoDate(new Date());

export function addDays(iso: string, days: number): string {
  const d = parse(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** "Today", "Yesterday", or e.g. "Monday". */
export function relativeDayName(iso: string): string {
  const now = today();
  if (iso === now) return "Today";
  if (iso === addDays(now, -1)) return "Yesterday";
  if (iso === addDays(now, 1)) return "Tomorrow";
  return parse(iso).toLocaleDateString("en-US", { weekday: "long" });
}

/** e.g. "November 11, 2026". */
export function longDate(iso: string): string {
  return parse(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
