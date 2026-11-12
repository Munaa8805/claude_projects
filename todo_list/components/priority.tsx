import type { Priority } from "@/lib/types";

export const PRIORITY_LABEL: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" };

const DOT: Record<Priority, string> = { high: "bg-high", medium: "bg-medium", low: "bg-low" };

/** Coloured dot; high priority is a little larger so it reads without colour too. */
export function PriorityDot({ priority }: { priority: Priority }) {
  const size = priority === "high" ? "size-2.5" : "size-2";
  return <span aria-hidden="true" className={`inline-block shrink-0 rounded-full ${size} ${DOT[priority]}`} />;
}

/** Priority picker as a native select, so it is keyboard and screen-reader friendly for free. */
export function PrioritySelect({
  value,
  onChange,
  id,
  className = "",
}: {
  value: Priority;
  onChange: (p: Priority) => void;
  id?: string;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <span className="pointer-events-none absolute left-2.5 flex">
        <PriorityDot priority={value} />
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Priority)}
        aria-label="Priority"
        className="h-9 appearance-none rounded-md border border-line bg-surface py-0 pr-3 pl-7 text-sm text-text hover:border-muted"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </span>
  );
}
