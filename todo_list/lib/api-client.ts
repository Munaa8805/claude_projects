import type { Priority, Todo, TodoPatch } from "./types";

/** Typed browser-side wrappers around the /api routes. Each returns the full, updated list. */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

const todos = (p: Promise<{ todos: Todo[] }>) => p.then((d) => d.todos);

export const api = {
  list: () => todos(request("/api/todos")),

  create: (title: string, dueDate: string | null, priority: Priority) =>
    todos(request("/api/todos", { method: "POST", body: JSON.stringify({ title, dueDate, priority }) })),

  update: (id: number, patch: TodoPatch) =>
    todos(request(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify(patch) })),

  remove: (id: number) => todos(request(`/api/todos/${id}`, { method: "DELETE" })),

  clearCompleted: () => todos(request("/api/todos/completed", { method: "DELETE" })),

  reorder: (ids: number[]) => todos(request("/api/todos/reorder", { method: "PUT", body: JSON.stringify({ ids }) })),
};
