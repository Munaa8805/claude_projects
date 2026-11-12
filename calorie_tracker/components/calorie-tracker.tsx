"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { api } from "@/lib/api-client";
import { relativeDayName, today } from "@/lib/date";
import { formatServings, sumEntries } from "@/lib/nutrition";
import type { Food, LogEntry } from "@/lib/types";
import { DailyLabel } from "./daily-label";
import { DateSwitcher } from "./date-switcher";
import { FoodLog } from "./food-log";
import { FoodSearch } from "./food-search";

// True only in the browser. "Today" depends on the user's clock, so the
// date-dependent UI renders after hydration, never on the server.
const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/** Page-level state: selected day, food list, that day's log, and the calorie goal. */
export function CalorieTracker() {
  const isClient = useIsClient();
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const date = pickedDate ?? (isClient ? today() : null);

  const [foods, setFoods] = useState<Food[] | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [log, setLog] = useState<{ date: string; entries: LogEntry[] } | null>(null);
  const [changed, setChanged] = useState<{ id: number; token: number } | null>(null);
  const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(null);

  // The date currently on screen, so late responses for another day are dropped.
  const dateRef = useRef(date);
  useEffect(() => {
    dateRef.current = date;
  }, [date]);

  // Food list and goal: load once.
  useEffect(() => {
    api.foods().then(setFoods, (e) => setStatus({ text: `Couldn't load foods. ${e.message}`, isError: true }));
    api.settings().then(
      (s) => setGoal(s.calorieGoal),
      (e) => setStatus({ text: `Couldn't load your goal. ${e.message}`, isError: true }),
    );
  }, []);

  // The selected day's log.
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    api.entries(date).then(
      (entries) => !cancelled && setLog({ date, entries }),
      (e) => !cancelled && setStatus({ text: `Couldn't load the log. ${e.message}`, isError: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [date]);

  // Clear the status message a few seconds after it appears.
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), status.isError ? 6000 : 2500);
    return () => clearTimeout(t);
  }, [status]);

  const entries = log && log.date === date ? log.entries : null;
  const totals = useMemo(() => sumEntries(entries ?? []), [entries]);

  /** Run a log mutation and show the server's updated list for that day. */
  const mutate = useCallback(
    async (forDate: string, op: () => Promise<LogEntry[]>, onDone?: (entries: LogEntry[]) => void) => {
      try {
        const next = await op();
        if (dateRef.current !== forDate) return;
        setLog({ date: forDate, entries: next });
        onDone?.(next);
      } catch (e) {
        setStatus({ text: e instanceof Error ? e.message : "Something went wrong. Try again.", isError: true });
      }
    },
    [],
  );

  const flash = (id: number) => setChanged((c) => ({ id, token: (c?.token ?? 0) + 1 }));

  const handleAdd = (food: Food) => {
    if (!date) return;
    mutate(
      date,
      () => api.addEntry(date, food.id),
      (next) => {
        const entry = next.find((e) => e.foodId === food.id);
        if (entry) flash(entry.id);
        const day = relativeDayName(date);
        const where = day === "Today" || day === "Yesterday" ? day.toLowerCase() : day;
        setStatus({ text: `Added ${food.name} to ${where}.`, isError: false });
      },
    );
  };

  const handleServings = (entry: LogEntry, servings: number) => {
    mutate(
      entry.date,
      () => api.updateServings(entry.id, servings),
      () => {
        flash(entry.id);
        setStatus({ text: `${entry.name}: ${formatServings(servings)} servings.`, isError: false });
      },
    );
  };

  const handleRemove = (entry: LogEntry) => {
    mutate(
      entry.date,
      () => api.deleteEntry(entry.id),
      () => setStatus({ text: `Removed ${entry.name}.`, isError: false }),
    );
  };

  const handleGoal = async (next: number) => {
    const s = await api.setGoal(next);
    setGoal(s.calorieGoal);
  };

  const dayName = date ? relativeDayName(date) : "Today";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 pb-16 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="text-xl font-bold [font-stretch:87%]">Calorie Tracker</h1>
        {date && <DateSwitcher date={date} onChange={setPickedDate} />}
      </header>

      <main className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-x-10">
        <div className="md:col-start-1 md:row-start-1">
          <DailyLabel dayName={dayName} totals={totals} goal={goal} onGoalChange={handleGoal} />
        </div>

        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          <FoodSearch foods={foods} onAdd={handleAdd} />
        </div>

        <div className="md:col-start-1 md:row-start-2">
          <FoodLog
            entries={entries}
            dayName={dayName}
            changed={changed}
            onServingsChange={handleServings}
            onRemove={handleRemove}
          />
        </div>
      </main>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 flex justify-center px-4">
        {status && (
          <p
            role={status.isError ? "alert" : undefined}
            className={`pointer-events-auto rounded-full px-4 py-2 text-sm font-medium shadow-lg ${
              status.isError ? "bg-over text-white" : "bg-ink text-surface"
            }`}
          >
            {status.text}
          </p>
        )}
      </div>
    </div>
  );
}
