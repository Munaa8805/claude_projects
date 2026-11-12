import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SEED_FOODS } from "./seed-foods";

/**
 * SQLite connection (server only). The file lives in ./data by default and is
 * created, migrated, and seeded the first time any API route touches it.
 */
const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "calorie-tracker.db");

export const DEFAULT_CALORIE_GOAL = 2000;

// Keep one connection across dev-server hot reloads.
const globalForDb = globalThis as unknown as { calorieDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.calorieDb) globalForDb.calorieDb = open();
  return globalForDb.calorieDb;
}

function open(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seed(db);
  return db;
}

/** Ordered schema migrations, tracked with PRAGMA user_version. Append only. */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE foods (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL UNIQUE,
    category     TEXT    NOT NULL,
    serving_size TEXT    NOT NULL,
    calories     REAL    NOT NULL CHECK (calories >= 0),
    protein      REAL    NOT NULL CHECK (protein >= 0),
    carbs        REAL    NOT NULL CHECK (carbs >= 0),
    fat          REAL    NOT NULL CHECK (fat >= 0)
  );

  CREATE TABLE log_entries (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    date         TEXT    NOT NULL,
    food_id      INTEGER REFERENCES foods(id) ON DELETE SET NULL,
    servings     REAL    NOT NULL CHECK (servings > 0),
    name         TEXT    NOT NULL,
    serving_size TEXT    NOT NULL,
    calories     REAL    NOT NULL,
    protein      REAL    NOT NULL,
    carbs        REAL    NOT NULL,
    fat          REAL    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX idx_log_entries_date ON log_entries(date);

  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
];

function migrate(db: Database.Database) {
  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

function seed(db: Database.Database) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO foods (name, category, serving_size, calories, protein, carbs, fat)
    VALUES (@name, @category, @servingSize, @calories, @protein, @carbs, @fat)
  `);
  db.transaction(() => {
    for (const food of SEED_FOODS) insert.run(food);
    db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('calorie_goal', ?)`).run(
      String(DEFAULT_CALORIE_GOAL),
    );
  })();
}
