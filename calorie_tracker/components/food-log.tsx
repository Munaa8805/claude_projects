import { formatCalories, formatServings } from "@/lib/nutrition";
import type { LogEntry } from "@/lib/types";
import { CloseIcon, MinusIcon, PlusIcon } from "./icons";

interface Props {
  entries: LogEntry[] | null; // null while loading
  dayName: string;
  /** The entry that last changed, plus a counter so repeat changes re-flash. */
  changed: { id: number; token: number } | null;
  onServingsChange: (entry: LogEntry, servings: number) => void;
  onRemove: (entry: LogEntry) => void;
}

const STEP = 0.5;

/** What was eaten on the selected day, with servings steppers and remove buttons. */
export function FoodLog({ entries, dayName, changed, onServingsChange, onRemove }: Props) {
  const stepBtn =
    "grid size-8 place-items-center rounded-full border border-line text-text hover:border-ink disabled:opacity-30 disabled:hover:border-line";

  return (
    <section aria-labelledby="log-title">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-1.5">
        <h2 id="log-title" className="text-lg font-bold">
          What you ate
        </h2>
        {entries && entries.length > 0 && (
          <span className="text-sm text-muted">
            {entries.length} {entries.length === 1 ? "food" : "foods"}
          </span>
        )}
      </div>

      {entries === null ? (
        <p className="py-6 text-sm text-muted">Loading your log…</p>
      ) : entries.length === 0 ? (
        <p className="py-6 text-sm text-muted">
          Nothing logged for {dayName === "Today" || dayName === "Yesterday" ? dayName.toLowerCase() : dayName} yet.
          Find a food in the list and press its add button.
        </p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="relative isolate flex items-center gap-3 border-b border-line py-2.5"
            >
              {changed?.id === entry.id && (
                <span key={changed.token} className="just-changed pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{entry.name}</p>
                <p className="text-sm text-muted">
                  {formatServings(entry.servings)} × {entry.servingSize}
                </p>
              </div>

              <div className="flex items-center gap-1" role="group" aria-label={`Servings of ${entry.name}`}>
                <button
                  type="button"
                  className={stepBtn}
                  onClick={() => onServingsChange(entry, entry.servings - STEP)}
                  disabled={entry.servings <= STEP}
                  aria-label={`Remove half a serving of ${entry.name}`}
                >
                  <MinusIcon width={14} height={14} />
                </button>
                <button
                  type="button"
                  className={stepBtn}
                  onClick={() => onServingsChange(entry, entry.servings + STEP)}
                  aria-label={`Add half a serving of ${entry.name}`}
                >
                  <PlusIcon width={14} height={14} />
                </button>
              </div>

              <p className="w-16 text-right font-bold">
                {formatCalories(entry.calories * entry.servings)}
                <span className="ml-0.5 text-xs font-normal text-muted">Cal</span>
              </p>

              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-over"
                onClick={() => onRemove(entry)}
                aria-label={`Remove ${entry.name} from the log`}
              >
                <CloseIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
