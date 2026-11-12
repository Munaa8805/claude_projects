import { DEFAULT_CALORIE_GOAL, getDb } from "./db";
import type { Food, LogEntry, Settings } from "./types";

/** All SQL lives here. Route handlers call these functions and never touch the DB directly. */

interface FoodRow {
  id: number;
  name: string;
  category: Food["category"];
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface LogRow {
  id: number;
  date: string;
  food_id: number | null;
  servings: number;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

const toFood = (r: FoodRow): Food => ({
  id: r.id,
  name: r.name,
  category: r.category,
  servingSize: r.serving_size,
  calories: r.calories,
  protein: r.protein,
  carbs: r.carbs,
  fat: r.fat,
});

const toEntry = (r: LogRow): LogEntry => ({
  id: r.id,
  date: r.date,
  foodId: r.food_id,
  servings: r.servings,
  name: r.name,
  servingSize: r.serving_size,
  calories: r.calories,
  protein: r.protein,
  carbs: r.carbs,
  fat: r.fat,
  createdAt: r.created_at,
});

export function listFoods(): Food[] {
  const rows = getDb().prepare(`SELECT * FROM foods ORDER BY name COLLATE NOCASE`).all() as FoodRow[];
  return rows.map(toFood);
}

export function listEntries(date: string): LogEntry[] {
  const rows = getDb()
    .prepare(`SELECT * FROM log_entries WHERE date = ? ORDER BY created_at, id`)
    .all(date) as LogRow[];
  return rows.map(toEntry);
}

export class NotFoundError extends Error {}

/**
 * Log a food on a date. If that food is already in the day's log, its servings
 * are increased instead of adding a duplicate line.
 */
export function addEntry(date: string, foodId: number, servings: number): LogEntry[] {
  const db = getDb();
  db.transaction(() => {
    const food = db.prepare(`SELECT * FROM foods WHERE id = ?`).get(foodId) as FoodRow | undefined;
    if (!food) throw new NotFoundError(`No food with id ${foodId}`);

    const existing = db
      .prepare(`SELECT id FROM log_entries WHERE date = ? AND food_id = ?`)
      .get(date, foodId) as { id: number } | undefined;

    if (existing) {
      db.prepare(`UPDATE log_entries SET servings = servings + ? WHERE id = ?`).run(servings, existing.id);
    } else {
      db.prepare(
        `INSERT INTO log_entries (date, food_id, servings, name, serving_size, calories, protein, carbs, fat)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(date, food.id, servings, food.name, food.serving_size, food.calories, food.protein, food.carbs, food.fat);
    }
  })();
  return listEntries(date);
}

/** Set an entry's servings. Returns the entry's day log. */
export function updateServings(id: number, servings: number): LogEntry[] {
  const db = getDb();
  const row = db.prepare(`SELECT date FROM log_entries WHERE id = ?`).get(id) as { date: string } | undefined;
  if (!row) throw new NotFoundError(`No log entry with id ${id}`);
  db.prepare(`UPDATE log_entries SET servings = ? WHERE id = ?`).run(servings, id);
  return listEntries(row.date);
}

/** Delete an entry. Returns the entry's day log. */
export function deleteEntry(id: number): LogEntry[] {
  const db = getDb();
  const row = db.prepare(`SELECT date FROM log_entries WHERE id = ?`).get(id) as { date: string } | undefined;
  if (!row) throw new NotFoundError(`No log entry with id ${id}`);
  db.prepare(`DELETE FROM log_entries WHERE id = ?`).run(id);
  return listEntries(row.date);
}

export function getSettings(): Settings {
  const row = getDb().prepare(`SELECT value FROM settings WHERE key = 'calorie_goal'`).get() as
    | { value: string }
    | undefined;
  const goal = Number(row?.value);
  return { calorieGoal: Number.isFinite(goal) && goal > 0 ? goal : DEFAULT_CALORIE_GOAL };
}

export function setCalorieGoal(goal: number): Settings {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES ('calorie_goal', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(String(goal));
  return getSettings();
}
