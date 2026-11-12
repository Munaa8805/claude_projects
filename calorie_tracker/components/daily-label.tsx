"use client";

import { useState } from "react";
import { formatCalories, formatGrams, macroEnergySplit } from "@/lib/nutrition";
import type { Nutrients } from "@/lib/types";
import { MAX_GOAL, MIN_GOAL } from "@/lib/validation";

interface Props {
  dayName: string;
  totals: Nutrients;
  goal: number | null;
  onGoalChange: (goal: number) => Promise<void>;
}

const MACROS = [
  { key: "protein", label: "Protein", swatch: "bg-protein" },
  { key: "carbs", label: "Carbohydrate", swatch: "bg-carbs" },
  { key: "fat", label: "Fat", swatch: "bg-fat" },
] as const;

/** The day's totals, laid out like a printed nutrition facts panel. */
export function DailyLabel({ dayName, totals, goal, onGoalChange }: Props) {
  const split = macroEnergySplit(totals);
  const remaining = goal === null ? null : goal - totals.calories;
  const progress = goal ? Math.min(totals.calories / goal, 1) : 0;
  const over = remaining !== null && remaining < 0;

  return (
    <section aria-labelledby="label-title" className="border-2 border-ink bg-surface px-4 pt-3 pb-4 text-ink">
      <h2 id="label-title" className="label-type text-5xl">
        {dayName}
      </h2>

      <div className="mt-2 border-t border-ink pt-1.5">
        <GoalRow goal={goal} onGoalChange={onGoalChange} />
      </div>

      <div className="mt-1.5 border-t-[10px] border-ink pt-2">
        <div className="flex items-end justify-between gap-4">
          <span className="label-type text-3xl">Calories</span>
          <span className="label-type text-7xl" aria-label={`${formatCalories(totals.calories)} calories eaten`}>
            {formatCalories(totals.calories)}
          </span>
        </div>

        <div
          role="meter"
          aria-label="Calories against daily goal"
          aria-valuemin={0}
          aria-valuemax={goal ?? 0}
          aria-valuenow={Math.round(totals.calories)}
          className="mt-3 h-2.5 border border-ink"
        >
          <div
            className={`h-full transition-[width] duration-300 ${over ? "bg-over" : "bg-ink"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className={`mt-1.5 text-sm font-semibold ${over ? "text-over" : ""}`}>
          {remaining === null
            ? " "
            : over
              ? `${formatCalories(-remaining)} Cal over your goal`
              : `${formatCalories(remaining)} Cal left`}
        </p>
      </div>

      <div className="mt-2 border-t-[5px] border-ink">
        <p className="border-b border-ink py-1 text-right text-xs font-bold">% of calories</p>
        <dl>
          {MACROS.map(({ key, label, swatch }) => (
            <div key={key} className="flex items-center justify-between border-b border-ink py-1.5">
              <dt className="flex items-center gap-2">
                <span className={`size-2.5 ${swatch}`} aria-hidden="true" />
                <span className="font-bold">{label}</span>
                <span>{formatGrams(totals[key])}</span>
              </dt>
              <dd className="font-bold">{Math.round(split[key] * 100)}%</dd>
            </div>
          ))}
        </dl>

        <div className="mt-2.5 flex h-2 gap-px bg-line" aria-hidden="true">
          {MACROS.map(({ key, swatch }) => (
            <div key={key} className={swatch} style={{ flexGrow: split[key] }} />
          ))}
        </div>
      </div>

      <p className="mt-3 border-t-[10px] border-ink pt-2 text-xs leading-snug">
        Protein and carbohydrate supply 4 Cal per gram; fat supplies 9.
      </p>
    </section>
  );
}

function GoalRow({ goal, onGoalChange }: { goal: number | null; onGoalChange: (g: number) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="flex items-baseline justify-between text-sm">
        <span>
          Daily goal <strong>{goal === null ? "…" : `${formatCalories(goal)} Cal`}</strong>
        </span>
        <button
          type="button"
          className="font-semibold underline underline-offset-2 hover:no-underline"
          onClick={() => {
            setDraft(goal ? String(goal) : "");
            setError(null);
            setEditing(true);
          }}
        >
          Change goal
        </button>
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(draft);
    if (!Number.isInteger(value) || value < MIN_GOAL || value > MAX_GOAL) {
      setError(`Enter a whole number from ${MIN_GOAL} to ${MAX_GOAL}.`);
      return;
    }
    try {
      await onGoalChange(value);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the goal.");
    }
  }

  return (
    <form onSubmit={save} className="text-sm">
      <div className="flex items-center gap-2">
        <label htmlFor="goal-input">Daily goal</label>
        <input
          id="goal-input"
          type="number"
          inputMode="numeric"
          min={MIN_GOAL}
          max={MAX_GOAL}
          step={50}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          aria-invalid={error !== null}
          aria-describedby={error ? "goal-error" : undefined}
          className="w-24 border border-ink bg-surface px-2 py-1 font-bold"
        />
        <span>Cal</span>
        <button type="submit" className="ml-auto bg-ink px-2.5 py-1 font-semibold text-surface">
          Save goal
        </button>
        <button type="button" className="font-semibold underline underline-offset-2" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
      {error && (
        <p id="goal-error" className="mt-1 text-over">
          {error}
        </p>
      )}
    </form>
  );
}
