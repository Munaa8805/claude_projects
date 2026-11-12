import { addDays, longDate, relativeDayName, today } from "@/lib/date";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface Props {
  date: string;
  onChange: (date: string) => void;
}

/** Step between days. The log can't move past today. */
export function DateSwitcher({ date, onChange }: Props) {
  const isToday = date === today();
  const stepClass =
    "grid size-9 place-items-center rounded-full text-text hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <nav aria-label="Choose day" className="flex items-center gap-1">
      <button type="button" className={stepClass} onClick={() => onChange(addDays(date, -1))} aria-label="Previous day">
        <ChevronLeftIcon />
      </button>
      <p className="min-w-36 text-center text-sm leading-tight" aria-live="polite">
        <span className="block font-semibold">{relativeDayName(date)}</span>
        <span className="block text-muted">{longDate(date)}</span>
      </p>
      <button
        type="button"
        className={stepClass}
        onClick={() => onChange(addDays(date, 1))}
        disabled={isToday}
        aria-label="Next day"
      >
        <ChevronRightIcon />
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={() => onChange(today())}
          className="ml-1 rounded-full border border-line px-3 py-1.5 text-sm font-medium hover:bg-surface"
        >
          Back to today
        </button>
      )}
    </nav>
  );
}
