import type { Food, LogEntry, Settings } from "./types";

/** Typed browser-side wrappers around the /api routes. */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  foods: () => request<{ foods: Food[] }>("/api/foods").then((d) => d.foods),

  entries: (date: string) =>
    request<{ entries: LogEntry[] }>(`/api/log?date=${date}`).then((d) => d.entries),

  addEntry: (date: string, foodId: number, servings = 1) =>
    request<{ entries: LogEntry[] }>("/api/log", {
      method: "POST",
      body: JSON.stringify({ date, foodId, servings }),
    }).then((d) => d.entries),

  updateServings: (id: number, servings: number) =>
    request<{ entries: LogEntry[] }>(`/api/log/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ servings }),
    }).then((d) => d.entries),

  deleteEntry: (id: number) =>
    request<{ entries: LogEntry[] }>(`/api/log/${id}`, { method: "DELETE" }).then((d) => d.entries),

  settings: () => request<Settings>("/api/settings"),

  setGoal: (calorieGoal: number) =>
    request<Settings>("/api/settings", { method: "PUT", body: JSON.stringify({ calorieGoal }) }),
};
