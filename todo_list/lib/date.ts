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

/** e.g. "Nov 14", with the year only when it isn't the current one. */
export function shortDate(iso: string): string {
  const d = parse(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
}

/** How a due date reads next to a task, and whether it is late. */
export function dueLabel(iso: string, done: boolean): { text: string; tone: "overdue" | "soon" | "later" } {
  const now = today();
  const soon = done ? "later" : "soon"; // finished tasks don't need the highlight
  if (iso === now) return { text: "Due today", tone: soon };
  if (iso === addDays(now, 1)) return { text: "Due tomorrow", tone: soon };
  if (iso < now) return { text: `${done ? "Was due" : "Overdue since"} ${shortDate(iso)}`, tone: done ? "later" : "overdue" };
  return { text: `Due ${shortDate(iso)}`, tone: "later" };
}
