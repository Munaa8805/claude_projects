import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AlertCircle, Bike, Dumbbell, Footprints, Inbox, StretchHorizontal, Waves, X } from 'lucide-react';
import type { WorkoutType } from '../data/types';
import { useApp } from '../state/AppState';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

/** The monoline Aura wordmark. Stroke follows currentColor. */
export function Logo({ height = 22, className }: { height?: number; className?: string }) {
  const sw = height < 24 ? 5 : height < 36 ? 4.5 : 4;
  return (
    <svg height={height} viewBox="0 0 164 50" className={className} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Aura">
      <path d="M4 44 L20 6 L36 44" /><path d="M9.9 30 Q20 25 30.1 30" />
      <path d="M48 6 V30 A14 14 0 0 0 76 30 V6" />
      <path d="M90 44 V6 H102 A10 10 0 0 1 102 26 H90" /><path d="M101 26 L115 44" />
      <path d="M128 44 L144 6 L160 44" /><path d="M133.9 30 Q144 25 154.1 30" />
    </svg>
  );
}

export function Card({ children, className, as: As = 'section', ...rest }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' } & Record<string, unknown>) {
  return <As className={cx('card', className)} {...rest}>{children}</As>;
}

export function CardHeader({ title, subtitle, action, id }: { title: string; subtitle?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 id={id} className="text-[17px] leading-6 font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-ink-3 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = 'recovery' | 'sleep' | 'activity' | 'neutral';
const toneStroke: Record<Tone, string> = {
  recovery: 'stroke-recovery', sleep: 'stroke-sleep', activity: 'stroke-activity', neutral: 'stroke-ink',
};

export function ScoreRing({ value, max = 100, size = 200, stroke = 10, tone = 'recovery', label, sublabel, valueClass }: {
  value: number; max?: number; size?: number; stroke?: number; tone?: Tone; label?: string; sublabel?: string; valueClass?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? 'Score'} ${value} of ${max}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-sunken" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={cx(toneStroke[tone], 'transition-[stroke-dasharray] duration-700')}
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className={cx('metric leading-none', valueClass ?? (size >= 180 ? 'text-[64px]' : size >= 120 ? 'text-[44px]' : 'text-[28px]'))}>{value}</span>
        {sublabel && <span className="text-[13px] text-ink-3 mt-1">{sublabel}</span>}
      </div>
    </div>
  );
}

export function Chip({ tone = 'neutral', children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  const map: Record<Tone, string> = {
    recovery: 'bg-recovery-soft text-recovery-ink', sleep: 'bg-sleep-soft text-sleep-ink', activity: 'bg-activity-soft text-activity-ink', neutral: 'bg-sunken text-ink-2',
  };
  const dotMap: Record<Tone, string> = { recovery: 'bg-recovery', sleep: 'bg-sleep', activity: 'bg-activity', neutral: 'bg-ink-3' };
  return (
    <span className={cx('chip', map[tone])}>
      {dot && <span className={cx('w-2 h-2 rounded-full', dotMap[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Metric({ label, value, unit, foot, footTone, className }: {
  label: string; value: ReactNode; unit?: string; foot?: ReactNode; footTone?: 'up' | 'down' | 'none'; className?: string;
}) {
  return (
    <div className={cx('flex flex-col gap-1 min-w-0', className)}>
      <span className="label">{label}</span>
      <span className="metric text-[26px] leading-8 whitespace-nowrap">
        {value}{unit && <span className="font-sans text-sm font-medium text-ink-3"> {unit}</span>}
      </span>
      {foot && <span className={cx('text-xs', footTone === 'up' ? 'text-recovery-ink' : footTone === 'down' ? 'text-activity-ink' : 'text-ink-3')}>{foot}</span>}
    </div>
  );
}

export function Progress({ value, tone = 'recovery', label, className }: { value: number; tone?: Tone; label: string; className?: string }) {
  const bg: Record<Tone, string> = { recovery: 'bg-recovery', sleep: 'bg-sleep', activity: 'bg-activity', neutral: 'bg-ink' };
  return (
    <div className={cx('h-2 rounded-full bg-sunken overflow-hidden', className)} role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx('h-full rounded-full transition-[width] duration-700', bg[tone])} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label, size = 'md' }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string; size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-grid grid-flow-col auto-cols-fr bg-sunken rounded-full p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
            className={cx('rounded-full px-3.5 font-medium transition-colors whitespace-nowrap', size === 'sm' ? 'h-8 text-[13px]' : 'h-9 text-sm',
              on ? 'bg-card text-ink shadow-[0_0_0_1px_rgb(var(--line))] font-semibold' : 'text-ink-3 hover:text-ink')}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[15px] font-medium cursor-pointer">{label}</label>
        {description && <p className="text-sm text-ink-3">{description}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cx('relative w-12 h-7 rounded-full transition-colors shrink-0', checked ? 'bg-ink' : 'bg-line-strong')}>
        <span className={cx('absolute top-1 w-5 h-5 rounded-full transition-all', checked ? 'left-6 bg-lime' : 'left-1 bg-card')} />
      </button>
    </div>
  );
}

export function WorkoutIcon({ type, size = 20, className }: { type: WorkoutType | 'rest'; size?: number; className?: string }) {
  const props = { size, strokeWidth: 1.75, 'aria-hidden': true as const, className };
  switch (type) {
    case 'run': return <RunIcon size={size} className={className} />;
    case 'walk': return <Footprints {...props} />;
    case 'cycle': return <Bike {...props} />;
    case 'strength': return <Dumbbell {...props} />;
    case 'mobility': return <StretchHorizontal {...props} />;
    default: return <Waves {...props} />;
  }
}

function RunIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="15" cy="4.5" r="1.8" /><path d="M10 21l2.5-5 3 2.5V22" /><path d="M7 12l3-4 4 1.5 2 3.5 3 1" /><path d="M12.5 16l1-6.5" /><path d="M6 17h3l1.5-2" />
    </svg>
  );
}

export const workoutTone: Record<WorkoutType | 'rest', string> = {
  run: 'bg-activity-soft text-activity-ink',
  walk: 'bg-recovery-soft text-recovery-ink',
  cycle: 'bg-activity-soft text-activity-ink',
  strength: 'bg-sunken text-ink',
  mobility: 'bg-sleep-soft text-sleep-ink',
  rest: 'bg-sunken text-ink-3',
};

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 px-6">
      <span className="w-12 h-12 rounded-full bg-sunken flex items-center justify-center text-ink-3"><Inbox size={22} strokeWidth={1.75} aria-hidden="true" /></span>
      <p className="font-semibold mt-2">{title}</p>
      <p className="text-sm text-ink-3 max-w-xs">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center text-center gap-2 py-8 px-6">
      <span className="w-12 h-12 rounded-full bg-danger-soft flex items-center justify-center text-danger"><AlertCircle size={22} strokeWidth={1.75} aria-hidden="true" /></span>
      <p className="font-semibold mt-2">{title}</p>
      <p className="text-sm text-ink-3 max-w-xs">{body}</p>
      {onRetry && <button type="button" className="btn btn-sm mt-3" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton', className)} aria-hidden="true" />;
}

export function LoadingBlock({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-3', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className={cx('h-5', i === 0 ? 'w-1/3' : i % 2 ? 'w-full' : 'w-4/5')} />)}
    </div>
  );
}

/** Recharts tooltip in the Aura card style. */
export function ChartTooltip({ active, payload, label, render }: {
  active?: boolean; payload?: { value: number; name: string; color?: string; payload: Record<string, unknown> }[]; label?: string;
  render?: (p: Record<string, unknown>) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-line rounded-md px-3 py-2 shadow-[0_8px_24px_rgba(21,23,28,0.08)] text-sm min-w-[140px]">
      {render ? render(payload[0].payload) : (
        <>
          <p className="label mb-1">{label}</p>
          {payload.map((p) => (
            <p key={p.name} className="flex items-center justify-between gap-4">
              <span className="text-ink-3">{p.name}</span><span className="font-semibold">{p.value}</span>
            </p>
          ))}
        </>
      )}
    </div>
  );
}

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input, select, button:not([data-close])')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-[#15171C]/40" onClick={onClose} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title}
        className="relative bg-card w-full sm:max-w-md rounded-t-xl sm:rounded-xl border border-line p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button type="button" data-close className="icon-btn w-9 h-9" onClick={onClose} aria-label="Close"><X size={18} aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="bg-ink text-ground rounded-full px-5 py-3 text-sm font-medium shadow-lg">{t.message}</div>
      ))}
    </div>
  );
}
