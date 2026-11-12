"use client";

import { useRef, useState } from "react";
import type { Priority } from "@/lib/types";
import { MAX_TITLE } from "@/lib/validation";
import { PlusIcon } from "./icons";
import { PrioritySelect } from "./priority";

/** The "new task" form. Enter adds; the date and priority are optional. */
export function TodoInput({ onAdd }: { onAdd: (title: string, dueDate: string | null, priority: Priority) => Promise<boolean> }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    const ok = await onAdd(t, dueDate || null, priority);
    setBusy(false);
    if (ok) {
      setTitle("");
      setDueDate("");
      setPriority("medium");
    }
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-surface p-2 transition-colors has-[#new-task:focus-visible]:border-accent">
      <label htmlFor="new-task" className="sr-only">
        New task
      </label>
      <input
        ref={inputRef}
        id="new-task"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={MAX_TITLE}
        placeholder="Add a task, then press Enter"
        autoComplete="off"
        autoFocus
        className="h-11 w-full rounded-md bg-transparent px-2 text-lg text-ink placeholder:text-muted focus-visible:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="sr-only sm:not-sr-only">Due</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            className="h-9 rounded-md border border-line bg-surface px-2 text-sm text-text hover:border-muted"
          />
        </label>
        <PrioritySelect value={priority} onChange={setPriority} />
        <button
          type="submit"
          disabled={!title.trim() || busy}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3.5 text-sm font-semibold text-accent-ink transition-opacity disabled:opacity-40"
        >
          <PlusIcon />
          Add task
        </button>
      </div>
    </form>
  );
}
