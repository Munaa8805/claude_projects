import { getDb } from "./db";
import type { Priority, Todo, TodoPatch } from "./types";

export class NotFoundError extends Error {}

type Row = {
  id: number;
  title: string;
  done: number;
  due_date: string | null;
  priority: Priority;
  position: number;
  created_at: string;
};

const toTodo = (r: Row): Todo => ({
  id: r.id,
  title: r.title,
  done: r.done === 1,
  dueDate: r.due_date,
  priority: r.priority,
  position: r.position,
  createdAt: r.created_at,
});

/** Every task in manual order. */
export function listTodos(): Todo[] {
  const rows = getDb().prepare(`SELECT * FROM todos ORDER BY position, id`).all() as Row[];
  return rows.map(toTodo);
}

/** Add a task to the top of the list. */
export function createTodo(input: { title: string; dueDate: string | null; priority: Priority }): Todo[] {
  const db = getDb();
  db.transaction(() => {
    const { min } = db.prepare(`SELECT COALESCE(MIN(position), 1) AS min FROM todos`).get() as { min: number };
    db.prepare(`INSERT INTO todos (title, due_date, priority, position) VALUES (?, ?, ?, ?)`).run(
      input.title,
      input.dueDate,
      input.priority,
      min - 1,
    );
  })();
  return listTodos();
}

export function updateTodo(id: number, patch: TodoPatch): Todo[] {
  const columns: Record<string, string | number | null> = {};
  if (patch.title !== undefined) columns.title = patch.title;
  if (patch.done !== undefined) columns.done = patch.done ? 1 : 0;
  if (patch.dueDate !== undefined) columns.due_date = patch.dueDate;
  if (patch.priority !== undefined) columns.priority = patch.priority;
  // Column names come from the fixed keys above, never from user input.
  const sets = Object.keys(columns).map((c) => `${c} = ?`);
  const values = Object.values(columns);

  if (sets.length > 0) {
    const result = getDb()
      .prepare(`UPDATE todos SET ${sets.join(", ")} WHERE id = ?`)
      .run(...values, id);
    if (result.changes === 0) throw new NotFoundError(`No task with id ${id}`);
  } else if (!getDb().prepare(`SELECT 1 FROM todos WHERE id = ?`).get(id)) {
    throw new NotFoundError(`No task with id ${id}`);
  }
  return listTodos();
}

export function deleteTodo(id: number): Todo[] {
  const result = getDb().prepare(`DELETE FROM todos WHERE id = ?`).run(id);
  if (result.changes === 0) throw new NotFoundError(`No task with id ${id}`);
  return listTodos();
}

export function clearCompleted(): Todo[] {
  getDb().prepare(`DELETE FROM todos WHERE done = 1`).run();
  return listTodos();
}

/**
 * Save a new manual order. `ids` must contain every task exactly once, so a
 * stale client can't silently drop tasks from the order.
 */
export function reorderTodos(ids: number[]): Todo[] {
  const db = getDb();
  db.transaction(() => {
    const existing = (db.prepare(`SELECT id FROM todos`).all() as { id: number }[]).map((r) => r.id);
    const given = new Set(ids);
    if (given.size !== ids.length || existing.length !== ids.length || existing.some((id) => !given.has(id))) {
      throw new ReorderMismatchError("The task list changed. Reload and try again.");
    }
    const set = db.prepare(`UPDATE todos SET position = ? WHERE id = ?`);
    ids.forEach((id, i) => set.run(i, id));
  })();
  return listTodos();
}

export class ReorderMismatchError extends Error {}
