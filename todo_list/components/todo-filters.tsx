import type { Filter, SortMode } from "@/lib/types";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "To do" },
  { value: "completed", label: "Done" },
];

type Props = {
  filter: Filter;
  onFilter: (f: Filter) => void;
  sort: SortMode;
  onSort: (s: SortMode) => void;
  counts: Record<Filter, number>;
};

/** Which tasks to show and in what order. */
export function TodoFilters({ filter, onFilter, sort, onSort, counts }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Show" className="inline-flex rounded-lg bg-surface p-1 shadow-[inset_0_0_0_1px_var(--line)]">
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => onFilter(f.value)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm transition-colors ${
                active ? "bg-ink font-semibold text-surface" : "text-muted hover:text-ink"
              }`}
            >
              {f.label}
              <span className={`tabular-nums ${active ? "opacity-70" : "opacity-60"}`}>{counts[f.value]}</span>
            </button>
          );
        })}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        Sort by
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortMode)}
          className="h-8 rounded-md border border-line bg-surface px-2 text-sm text-text hover:border-muted"
        >
          <option value="manual">My order</option>
          <option value="due">Due date</option>
          <option value="priority">Priority</option>
        </select>
      </label>
    </div>
  );
}
