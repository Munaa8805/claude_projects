import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * SQLite connection (server only). The file lives in ./data by default and is
 * created and migrated the first time any API route touches it.
 */
const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "todo.db");

// Keep one connection across dev-server hot reloads.
const globalForDb = globalThis as unknown as { todoDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.todoDb) globalForDb.todoDb = open();
  return globalForDb.todoDb;
}

function open(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}

/** Ordered schema migrations, tracked with PRAGMA user_version. Append only. */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    done       INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
    due_date   TEXT,
    priority   TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    position   INTEGER NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE INDEX idx_todos_position ON todos(position);
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
