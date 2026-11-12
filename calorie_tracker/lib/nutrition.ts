import type { LogEntry, Nutrients } from "./types";

/** Sum nutrients across log entries, scaling each by its servings. */
export function sumEntries(entries: LogEntry[]): Nutrients {
  return entries.reduce<Nutrients>(
    (acc, e) => ({
      calories: acc.calories + e.calories * e.servings,
      protein: acc.protein + e.protein * e.servings,
      carbs: acc.carbs + e.carbs * e.servings,
      fat: acc.fat + e.fat * e.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

const intFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const gramFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export const formatCalories = (n: number) => intFormat.format(Math.round(n));
export const formatGrams = (n: number) => `${gramFormat.format(n)} g`;

/** "1", "1.5", "0.5": servings shown without trailing zeros. */
export const formatServings = (n: number) => gramFormat.format(n);

/** Energy from each macro (4/4/9 kcal per gram) as a share of the macro total. */
export function macroEnergySplit({ protein, carbs, fat }: Nutrients) {
  const p = protein * 4;
  const c = carbs * 4;
  const f = fat * 9;
  const total = p + c + f;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: p / total, carbs: c / total, fat: f / total };
}
