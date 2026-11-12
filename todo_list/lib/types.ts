export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  dueDate: string | null; // "YYYY-MM-DD"
  priority: Priority;
  position: number;
  createdAt: string;
};

export type Filter = "all" | "active" | "completed";
export type SortMode = "manual" | "due" | "priority";

export type TodoPatch = Partial<Pick<Todo, "title" | "done" | "dueDate" | "priority">>;
