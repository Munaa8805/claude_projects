export function ArchMark({ className = "" }: { className?: string }) {
  // Three nested arches: sky, river, rose. The chinook arch, simplified.
  return (
    <svg viewBox="0 0 40 28" className={className} aria-hidden="true">
      <path d="M2 27a18 18 0 0 1 36 0" fill="none" stroke="var(--color-sky)" strokeWidth="4" strokeLinecap="round" />
      <path d="M9 27a11 11 0 0 1 22 0" fill="none" stroke="var(--color-river)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="22" r="4.5" fill="var(--color-canola)" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <ArchMark className="h-6 w-auto" />
      <span className={`text-lg font-bold tracking-tight ${light ? "text-white" : "text-navy"}`}>
        Chinook Clean Co.
      </span>
    </span>
  );
}
