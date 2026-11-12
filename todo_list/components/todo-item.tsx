"use client";

import { useEffect, useRef, useState } from "react";
import { dueLabel } from "@/lib/date";
import type { Priority, Todo, TodoPatch } from "@/lib/types";
import { MAX_TITLE } from "@/lib/validation";
import { CheckIcon, GripIcon, PencilIcon, TrashIcon } from "./icons";
import { PRIORITY_LABEL, PriorityDot, PrioritySelect } from "./priority";

export type DropSide = "before" | "after";

type Props = {
  todo: Todo;
  justDone: boolean;
  reorderable: boolean;
  dragging: boolean;
  dropSide: DropSide | null;
  onToggle: () => void;
  onSave: (patch: TodoPatch) => Promise<boolean>;
  onDelete: () => void;
  onMove: (delta: -1 | 1) => void;
  onDragStart: () => void;
  onDragOver: (side: DropSide) => void;
  onDrop: () => void;
  onDragEnd: () => void;
};

const TONE = {
  overdue: "text-overdue font-semibold",
  soon: "bg-soon-bg text-soon rounded px-1.5",
  later: "text-muted",
};

export function TodoItem(p: Props) {
  const { todo } = p;
  const [editing, setEditing] = useState(false);

  const rowClass = [
    "group flex items-start gap-3 border-b border-line px-3 py-3 last:border-b-0 sm:px-4",
    todo.done ? "is-done" : "",
    p.justDone ? "just-done" : "",
    p.dragging ? "is-dragging" : "",
    p.dropSide === "before" ? "drop-before" : p.dropSide === "after" ? "drop-after" : "",
  ].join(" ");

  return (
    <li
      className={rowClass}
      onDragOver={(e) => {
        if (!p.reorderable) return;
        e.preventDefault();
        const r = e.currentTarget.getBoundingClientRect();
        p.onDragOver(e.clientY < r.top + r.height / 2 ? "before" : "after");
      }}
      onDrop={(e) => {
        if (!p.reorderable) return;
        e.preventDefault();
        p.onDrop();
      }}
    >
      {p.reorderable && (
        <button
          id={`grip-${todo.id}`}
          type="button"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(todo.id));
            const row = e.currentTarget.closest("li");
            if (row) e.dataTransfer.setDragImage(row, 16, 16);
            p.onDragStart();
          }}
          onDragEnd={p.onDragEnd}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              p.onMove(e.key === "ArrowUp" ? -1 : 1);
            }
          }}
          aria-label={`Move “${todo.title}”. Use the up and down arrow keys.`}
          className="-ml-1 mt-1 flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted opacity-60 hover:opacity-100 active:cursor-grabbing"
        >
          <GripIcon />
        </button>
      )}

      <label className="relative mt-0.5 flex size-7 shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={p.onToggle}
          aria-label={todo.done ? `Mark “${todo.title}” as not done` : `Mark “${todo.title}” as done`}
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          className={`flex size-6 items-center justify-center rounded-[7px] border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
            todo.done ? "border-accent bg-accent text-accent-ink" : "border-muted/60 text-transparent hover:border-accent"
          }`}
        >
          <CheckIcon />
        </span>
      </label>

      {editing ? (
        <EditForm
          todo={todo}
          onCancel={() => setEditing(false)}
          onSave={async (patch) => {
            if (await p.onSave(patch)) setEditing(false);
          }}
        />
      ) : (
        <>
          <div className="min-w-0 flex-1 pt-1" onDoubleClick={() => setEditing(true)}>
            <p className="text-[1.0625rem] leading-snug break-words text-ink">
              <span className="task-title">{todo.title}</span>
            </p>
            <Meta todo={todo} />
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            <IconButton label={`Edit “${todo.title}”`} onClick={() => setEditing(true)}>
              <PencilIcon />
            </IconButton>
            <IconButton label={`Delete “${todo.title}”`} onClick={p.onDelete} danger>
              <TrashIcon />
            </IconButton>
          </div>
        </>
      )}
    </li>
  );
}

function Meta({ todo }: { todo: Todo }) {
  const due = todo.dueDate ? dueLabel(todo.dueDate, todo.done) : null;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem]">
      <span className="inline-flex items-center gap-1.5 text-muted">
        <PriorityDot priority={todo.priority} />
        {PRIORITY_LABEL[todo.priority]}
      </span>
      {due && <span className={TONE[due.tone]}>{due.text}</span>}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label.split(" “")[0]}
      className={`flex size-8 items-center justify-center rounded-md text-muted hover:bg-paper ${danger ? "hover:text-overdue" : "hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

/** Inline editor. Enter saves, Escape cancels. */
function EditForm({ todo, onSave, onCancel }: { todo: Todo; onSave: (patch: TodoPatch) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(todo.title);
  const [dueDate, setDueDate] = useState(todo.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function save(e?: React.FormEvent) {
    e?.preventDefault();
    const t = title.trim();
    if (!t) return;
    const patch: TodoPatch = {};
    if (t !== todo.title) patch.title = t;
    if ((dueDate || null) !== todo.dueDate) patch.dueDate = dueDate || null;
    if (priority !== todo.priority) patch.priority = priority;
    if (Object.keys(patch).length === 0) return onCancel();
    onSave(patch);
  }

  return (
    <form
      onSubmit={save}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      className="min-w-0 flex-1"
    >
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={MAX_TITLE}
        aria-label="Task"
        className="h-9 w-full rounded-md border border-line bg-paper px-2 text-[1.0625rem] text-ink"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
          className="h-9 rounded-md border border-line bg-surface px-2 text-sm text-text"
        />
        <PrioritySelect value={priority} onChange={setPriority} />
        <div className="ml-auto flex gap-1.5">
          <button type="button" onClick={onCancel} className="h-9 rounded-md px-3 text-sm text-muted hover:text-ink">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="h-9 rounded-md bg-accent px-3 text-sm font-semibold text-accent-ink disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
