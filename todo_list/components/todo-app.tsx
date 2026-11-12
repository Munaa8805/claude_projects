"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { api } from "@/lib/api-client";
import { longDate, today } from "@/lib/date";
import type { Filter, Priority, SortMode, Todo, TodoPatch } from "@/lib/types";
import { TodoFilters } from "./todo-filters";
import { TodoInput } from "./todo-input";
import { type DropSide, TodoItem } from "./todo-item";

// True only in the browser. Due-date labels depend on the user's clock, so
// they render after hydration, never on the server.
const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function sortTodos(todos: Todo[], sort: SortMode): Todo[] {
  if (sort === "manual") return todos; // the server already returns manual order
  const byPos = (a: Todo, b: Todo) => a.position - b.position;
  return [...todos].sort((a, b) => {
    if (sort === "due") {
      if (a.dueDate !== b.dueDate) {
        if (!a.dueDate) return 1; // undated tasks last
        if (!b.dueDate) return -1;
        return a.dueDate < b.dueDate ? -1 : 1;
      }
      return byPos(a, b);
    }
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byPos(a, b);
  });
}

/** Move `id` next to `targetId` in the full list (works while a filter hides some tasks). */
function moveId(ids: number[], id: number, targetId: number, side: DropSide): number[] {
  if (id === targetId) return ids;
  const rest = ids.filter((x) => x !== id);
  const at = rest.indexOf(targetId) + (side === "after" ? 1 : 0);
  return [...rest.slice(0, at), id, ...rest.slice(at)];
}

/** Page-level state: the task list, filter, sort, and drag-and-drop. */
export function TodoApp() {
  const isClient = useIsClient();
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortMode>("manual");
  const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(null);
  const [justDone, setJustDone] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ id: number; over: number | null; side: DropSide } | null>(null);

  const load = useCallback(() => {
    api.list().then(
      (list) => {
        setLoadError(null);
        setTodos(list);
      },
      (e) => setLoadError(e.message),
    );
  }, []);

  useEffect(load, [load]);

  // Clear the status message a few seconds after it appears.
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), status.isError ? 6000 : 2500);
    return () => clearTimeout(t);
  }, [status]);

  /**
   * Run a mutation and show the server's list. `optimistic` updates the screen
   * first; if the request fails the list is reloaded from the server.
   */
  const mutate = useCallback(
    async (op: () => Promise<Todo[]>, opts: { optimistic?: (t: Todo[]) => Todo[]; done?: string; failed: string }) => {
      if (opts.optimistic) setTodos((t) => (t ? opts.optimistic!(t) : t));
      try {
        setTodos(await op());
        if (opts.done) setStatus({ text: opts.done, isError: false });
        return true;
      } catch (e) {
        setStatus({ text: `${opts.failed} ${(e as Error).message}`, isError: true });
        if (opts.optimistic) api.list().then(setTodos, () => {});
        return false;
      }
    },
    [],
  );

  const counts = useMemo(() => {
    const all = todos ?? [];
    const completed = all.filter((t) => t.done).length;
    return { all: all.length, active: all.length - completed, completed };
  }, [todos]);

  const visible = useMemo(() => {
    const list = (todos ?? []).filter((t) => (filter === "all" ? true : filter === "active" ? !t.done : t.done));
    return sortTodos(list, sort);
  }, [todos, filter, sort]);

  const reorderable = sort === "manual" && visible.length > 1;

  function reorder(newIds: number[]) {
    const byId = new Map((todos ?? []).map((t) => [t.id, t]));
    mutate(() => api.reorder(newIds), {
      optimistic: () => newIds.map((id, i) => ({ ...byId.get(id)!, position: i })),
      failed: "Couldn't save the new order.",
    });
  }

  function moveBy(id: number, delta: -1 | 1) {
    const i = visible.findIndex((t) => t.id === id);
    const target = visible[i + delta];
    if (!target || !todos) return;
    reorder(moveId(todos.map((t) => t.id), id, target.id, delta === -1 ? "before" : "after"));
    // Keep keyboard focus on the moved row's handle after React re-renders.
    requestAnimationFrame(() => document.getElementById(`grip-${id}`)?.focus());
  }

  const header = (
    <header className="mb-8 flex items-end justify-between gap-4">
      <h1 className="display-type text-[clamp(4rem,18vw,7.5rem)] text-ink">To do</h1>
      {isClient && (
        <p className="pb-2 text-right text-sm leading-snug text-muted">
          {longDate(today())}
          <br />
          {todos && todos.length > 0 && (
            <span className="text-text">
              {counts.active === 0 ? "All done" : `${counts.active} left`}
              {counts.completed > 0 && counts.active > 0 && `, ${counts.completed} done`}
            </span>
          )}
        </p>
      )}
    </header>
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-10 pb-24 sm:pt-16">
      {header}

      <TodoInput
        onAdd={(title, dueDate, priority) =>
          mutate(() => api.create(title, dueDate, priority), { failed: "Couldn't add that task." }).then((ok) => {
            if (ok && filter === "completed") setFilter("all");
            return ok;
          })
        }
      />

      <section aria-label="Tasks" className="mt-8">
        {loadError ? (
          <div className="rounded-xl border border-line bg-surface p-6 text-center">
            <p className="text-ink">Your tasks didn&apos;t load. {loadError}</p>
            <button onClick={load} className="mt-3 h-9 rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink">
              Try again
            </button>
          </div>
        ) : todos === null || !isClient ? (
          <p className="px-1 text-muted">Loading tasks…</p>
        ) : todos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-muted">
            Nothing here yet. Type a task above and press Enter.
          </p>
        ) : (
          <>
            <TodoFilters filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} counts={counts} />

            {visible.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-line px-6 py-8 text-center text-muted">
                {filter === "active" ? "Everything is done." : "No finished tasks yet."}
              </p>
            ) : (
              <ul className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
                {visible.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    justDone={justDone === t.id}
                    reorderable={reorderable}
                    dragging={drag?.id === t.id}
                    dropSide={drag && drag.over === t.id && drag.id !== t.id ? drag.side : null}
                    onToggle={() => {
                      if (!t.done) setJustDone(t.id);
                      mutate(() => api.update(t.id, { done: !t.done }), {
                        optimistic: (list) => list.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
                        failed: "Couldn't update that task.",
                      });
                    }}
                    onSave={(patch: TodoPatch) => mutate(() => api.update(t.id, patch), { failed: "Couldn't save your changes." })}
                    onDelete={() =>
                      mutate(() => api.remove(t.id), {
                        optimistic: (list) => list.filter((x) => x.id !== t.id),
                        done: `Deleted “${t.title}”.`,
                        failed: "Couldn't delete that task.",
                      })
                    }
                    onMove={(delta) => moveBy(t.id, delta)}
                    onDragStart={() => setDrag({ id: t.id, over: null, side: "before" })}
                    onDragOver={(side) =>
                      setDrag((d) => (d && (d.over !== t.id || d.side !== side) ? { ...d, over: t.id, side } : d))
                    }
                    onDrop={() => {
                      if (drag && todos && drag.id !== t.id) {
                        reorder(moveId(todos.map((x) => x.id), drag.id, t.id, drag.side));
                      }
                      setDrag(null);
                    }}
                    onDragEnd={() => setDrag(null)}
                  />
                ))}
              </ul>
            )}

            {counts.completed > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const n = counts.completed;
                    if (!window.confirm(`Delete ${n} finished ${n === 1 ? "task" : "tasks"}?`)) return;
                    mutate(() => api.clearCompleted(), {
                      optimistic: (list) => list.filter((x) => !x.done),
                      done: `Cleared ${n} finished ${n === 1 ? "task" : "tasks"}.`,
                      failed: "Couldn't clear finished tasks.",
                    });
                  }}
                  className="h-8 rounded-md px-2 text-sm text-muted underline-offset-4 hover:text-overdue hover:underline"
                >
                  Clear finished tasks
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <p
        role="status"
        aria-live="polite"
        className={`fixed inset-x-4 bottom-5 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-lg px-4 py-2.5 text-sm shadow-lg transition-opacity ${
          status ? "opacity-100" : "pointer-events-none opacity-0"
        } ${status?.isError ? "bg-overdue text-accent-ink" : "bg-ink text-surface"}`}
      >
        {status?.text}
      </p>
    </main>
  );
}
