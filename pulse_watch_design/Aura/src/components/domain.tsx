import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BatteryMedium, Bluetooth, BluetoothOff, Check, ChevronLeft, ChevronRight, Heart, Loader2, Pencil, RotateCcw, SkipForward, Timer, Watch } from 'lucide-react';
import type { PlanSession, SleepSegment, Workout } from '../data/types';
import { HISTORY_DAYS, TODAY, addDays } from '../data/mockData';
import { fmtDate, fmtDuration, fmtShortDate, fmtTime12 } from '../lib/format';
import { useApp } from '../state/AppState';
import { Chip, Dialog, Segmented, WorkoutIcon, cx, workoutTone } from './ui';

// ---------- Sleep timeline ----------
const stageRow: Record<SleepSegment['stage'], number> = { Awake: 0, REM: 1, Light: 2, Deep: 3 };
const stageColor: Record<SleepSegment['stage'], string> = {
  Awake: 'bg-line-strong', REM: 'bg-sleep', Light: 'bg-sleep-light', Deep: 'bg-sleep-deep',
};

/** A hypnogram-style horizontal timeline: one lane per stage, time across. */
export function SleepTimeline({ segments, start, end, compact = false }: { segments: SleepSegment[]; start: string; end: string; compact?: boolean }) {
  const total = segments.reduce((a, s) => Math.max(a, s.startMin + s.durationMin), 0);
  const [hover, setHover] = useState<SleepSegment | null>(null);
  const laneH = compact ? 14 : 22;
  const stages: SleepSegment['stage'][] = ['Awake', 'REM', 'Light', 'Deep'];
  const startMinOfDay = (() => { const [h, m] = start.split(':').map(Number); return h * 60 + m; })();
  const clock = (offset: number) => {
    const t = (startMinOfDay + offset) % 1440;
    return fmtTime12(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  };
  return (
    <div>
      <div className="flex gap-3">
        {!compact && (
          <div className="flex flex-col gap-[6px] text-xs text-ink-3 w-10" aria-hidden="true">
            {stages.map((s) => <span key={s} style={{ height: laneH }} className="flex items-center">{s}</span>)}
          </div>
        )}
        <div className="relative flex-1" style={{ height: laneH * 4 + 18 }} role="img"
          aria-label={`Sleep timeline from ${fmtTime12(start)} to ${fmtTime12(end)}. ${segments.length} stage changes.`}
          onMouseLeave={() => setHover(null)}>
          {stages.map((s, i) => (
            <div key={s} className="absolute left-0 right-0 border-t border-dashed border-line" style={{ top: i * (laneH + 6) + laneH / 2 }} aria-hidden="true" />
          ))}
          {segments.map((s, i) => (
            <div key={i}
              className={cx('absolute rounded-[5px] transition-opacity', stageColor[s.stage], hover && hover !== s && 'opacity-50')}
              style={{ left: `${(s.startMin / total) * 100}%`, width: `calc(${(s.durationMin / total) * 100}% - 1px)`, top: stageRow[s.stage] * (laneH + 6), height: laneH }}
              onMouseEnter={() => setHover(s)} />
          ))}
          {hover && (
            <div className="absolute -top-9 bg-card border border-line rounded-md px-2.5 py-1 text-xs whitespace-nowrap shadow-sm pointer-events-none"
              style={{ left: `min(calc(${(hover.startMin / total) * 100}%), calc(100% - 180px))` }}>
              <strong>{hover.stage}</strong> · {clock(hover.startMin)} · {hover.durationMin} min
            </div>
          )}
        </div>
      </div>
      <div className={cx('flex justify-between text-xs text-ink-3 mt-2', !compact && 'pl-[52px]')}>
        <span>{fmtTime12(start)}</span><span>{clock(Math.round(total / 2))}</span><span>{fmtTime12(end)}</span>
      </div>
    </div>
  );
}

export function StageLegend({ totals }: { totals: Record<SleepSegment['stage'], number> }) {
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {(['Awake', 'Light', 'Deep', 'REM'] as const).map((s) => (
        <div key={s} className="flex items-start gap-2">
          <span className={cx('w-3 h-3 rounded-[4px] mt-1 shrink-0', stageColor[s])} aria-hidden="true" />
          <div>
            <dt className="text-xs text-ink-3">{s}</dt>
            <dd className="font-semibold">{fmtDuration(totals[s])} <span className="text-xs font-normal text-ink-3">{Math.round((totals[s] / sum) * 100)}%</span></dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

// ---------- Workouts ----------
export function WorkoutRow({ w, to }: { w: Workout; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 py-3 px-2 -mx-2 rounded-md hover:bg-sunken transition-colors">
      <span className={cx('w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0', workoutTone[w.type])}><WorkoutIcon type={w.type} /></span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{w.title}</p>
        <p className="text-sm text-ink-3 truncate">{fmtShortDate(w.date)} · {fmtDuration(w.durationMin)}{w.distanceKm ? ` · ${w.distanceKm.toFixed(1)} km` : ''}</p>
      </div>
      <div className="hidden sm:flex flex-col items-end text-sm">
        <span className="flex items-center gap-1 text-ink-2"><Heart size={14} aria-hidden="true" />{w.avgHr} bpm</span>
        <span className="text-ink-3 text-xs">avg HR</span>
      </div>
      <div className="flex flex-col items-end w-14">
        <span className="metric text-lg">+{w.load}</span>
        <span className="text-ink-3 text-xs">load</span>
      </div>
    </Link>
  );
}

export function WorkoutCard({ w, to }: { w: Workout; to: string }) {
  return (
    <Link to={to} className="card p-5 flex flex-col gap-4 hover:border-line-strong transition-colors">
      <div className="flex items-start justify-between gap-3">
        <span className={cx('w-11 h-11 rounded-[14px] flex items-center justify-center', workoutTone[w.type])}><WorkoutIcon type={w.type} /></span>
        <span className="text-xs text-ink-3">{fmtDate(w.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {fmtTime12(w.startTime)}</span>
      </div>
      <div>
        <p className="font-semibold text-[17px]">{w.title}</p>
        <p className="text-sm text-ink-3">{w.intensity} intensity</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div><dt className="label">Duration</dt><dd className="font-semibold">{fmtDuration(w.durationMin)}</dd></div>
        <div><dt className="label">Avg heart rate</dt><dd className="font-semibold">{w.avgHr} bpm</dd></div>
        <div><dt className="label">Estimated load</dt><dd className="font-semibold">+{w.load}</dd></div>
        <div><dt className="label">Distance</dt><dd className="font-semibold">{w.distanceKm ? `${w.distanceKm.toFixed(1)} km` : '–'}</dd></div>
      </dl>
    </Link>
  );
}

// ---------- Device ----------
export function DeviceStatus({ compact = false }: { compact?: boolean }) {
  const { device } = useApp();
  return (
    <div className={cx('inline-flex items-center gap-2 rounded-full border border-line bg-card', compact ? 'h-9 px-3 text-[13px]' : 'h-11 px-4 text-sm')}
      aria-label={`AURA Band ${device.connected ? 'connected' : 'disconnected'}, battery ${device.battery} percent`} role="status">
      <span className={cx('w-2 h-2 rounded-full', device.connected ? 'bg-recovery' : 'bg-line-strong')} aria-hidden="true" />
      <span className="font-medium whitespace-nowrap">{device.connected ? 'Band connected' : 'Band offline'}</span>
      <span className="flex items-center gap-1 text-ink-3" aria-hidden="true"><BatteryMedium size={16} />{device.battery}%</span>
    </div>
  );
}

export function BatteryGauge({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-7 rounded-[8px] border-2 border-ink p-[3px]" role="img" aria-label={`Battery ${value} percent`}>
        <div className={cx('h-full rounded-[4px]', value > 20 ? 'bg-recovery' : 'bg-danger')} style={{ width: `${value}%` }} />
        <span className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-[3px] h-3 rounded-r bg-ink" />
      </div>
      <span className="metric text-2xl">{value}%</span>
    </div>
  );
}

type PairPhase = 'idle' | 'searching' | 'found' | 'pairing' | 'connected' | 'error';
/** Simulated Bluetooth pairing. No real hardware is contacted. */
export function DevicePairing({ onDone, startConnected = false }: { onDone?: () => void; startConnected?: boolean }) {
  const { device, setDevice } = useApp();
  const [phase, setPhase] = useState<PairPhase>(startConnected && device.connected ? 'connected' : 'idle');
  const [simulateError, setSimulateError] = useState(false);
  const setDeviceRef = useRef(setDevice);
  setDeviceRef.current = setDevice;
  useEffect(() => {
    let t: number | undefined;
    if (phase === 'searching') t = window.setTimeout(() => setPhase(simulateError ? 'error' : 'found'), 1600);
    if (phase === 'pairing') t = window.setTimeout(() => { setPhase('connected'); setDeviceRef.current({ connected: true, lastSync: 'Just now' }); }, 1400);
    return () => window.clearTimeout(t);
  }, [phase, simulateError]);

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      {phase === 'idle' && (
        <>
          <p className="text-ink-2">Keep your band close to your phone. Pairing in this prototype is simulated.</p>
          <button type="button" className="btn-primary self-start" onClick={() => setPhase('searching')}><Bluetooth size={18} aria-hidden="true" />Search for AURA Band</button>
          <label className="flex items-center gap-2 text-sm text-ink-3"><input type="checkbox" checked={simulateError} onChange={(e) => setSimulateError(e.target.checked)} className="accent-[rgb(var(--ink))] w-4 h-4" />Demo: simulate a pairing problem</label>
        </>
      )}
      {phase === 'searching' && (
        <div className="flex items-center gap-3 py-2"><Loader2 className="animate-spin text-ink-3" size={22} aria-hidden="true" /><span className="font-medium">Searching for nearby bands…</span></div>
      )}
      {phase === 'found' && (
        <div className="flex items-center gap-4 border border-line rounded-md p-4">
          <span className="w-11 h-11 rounded-[14px] bg-sunken flex items-center justify-center"><Watch size={20} aria-hidden="true" /></span>
          <div className="flex-1"><p className="font-medium">AURA Band</p><p className="text-sm text-ink-3">{device.colour} · {device.serial}</p></div>
          <button type="button" className="btn-primary btn-sm" onClick={() => setPhase('pairing')}>Pair device</button>
        </div>
      )}
      {phase === 'pairing' && (
        <div className="flex items-center gap-3 py-2"><Loader2 className="animate-spin text-ink-3" size={22} aria-hidden="true" /><span className="font-medium">Pairing with AURA Band…</span></div>
      )}
      {phase === 'connected' && (
        <div className="flex items-center gap-4 bg-recovery-soft text-recovery-ink rounded-md p-4">
          <span className="w-10 h-10 rounded-full bg-recovery text-white flex items-center justify-center"><Check size={20} aria-hidden="true" /></span>
          <div className="flex-1"><p className="font-semibold">AURA Band connected</p><p className="text-sm">Battery {device.battery}% · Last sync {device.lastSync.toLowerCase()}</p></div>
          {onDone && <button type="button" className="btn-dark btn-sm" onClick={onDone}>Continue</button>}
        </div>
      )}
      {phase === 'error' && (
        <div role="alert" className="flex flex-col gap-3 bg-danger-soft rounded-md p-4">
          <p className="flex items-center gap-2 font-semibold text-danger"><BluetoothOff size={18} aria-hidden="true" />We couldn't find your band</p>
          <p className="text-sm text-ink-2">Check that the band is charged and within a metre of your phone, then try again.</p>
          <button type="button" className="btn btn-sm self-start" onClick={() => { setSimulateError(false); setPhase('searching'); }}>Try again</button>
        </div>
      )}
    </div>
  );
}

// ---------- Date selector ----------
export function DateSelector() {
  const { selectedDate, setSelectedDate } = useApp();
  const min = addDays(TODAY, -(HISTORY_DAYS - 1));
  const isToday = selectedDate === TODAY;
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-card h-11 px-1">
      <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-sunken disabled:opacity-30" aria-label="Previous day"
        disabled={selectedDate <= min} onClick={() => setSelectedDate(addDays(selectedDate, -1))}><ChevronLeft size={18} aria-hidden="true" /></button>
      <label className="relative flex items-center px-1 cursor-pointer">
        <span className="text-sm font-medium whitespace-nowrap">{isToday ? 'Today' : fmtDate(selectedDate, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        <input type="date" className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Choose a date" min={min} max={TODAY} value={selectedDate}
          onChange={(e) => e.target.value && e.target.value >= min && e.target.value <= TODAY && setSelectedDate(e.target.value)} />
      </label>
      <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-sunken disabled:opacity-30" aria-label="Next day"
        disabled={isToday} onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight size={18} aria-hidden="true" /></button>
    </div>
  );
}

// ---------- Training plan ----------
const intensityTone = (i: PlanSession['intensity']) => (i === 'High' ? 'activity' : i === 'Moderate' ? 'activity' : i === 'Rest' ? 'neutral' : 'recovery') as 'activity' | 'neutral' | 'recovery';

export function PlanSessionCard({ s, onOpen, compact = false }: { s: PlanSession; onOpen?: () => void; compact?: boolean }) {
  const { completeSession, skipSession, resetSession } = useApp();
  const [adjusting, setAdjusting] = useState(false);
  const isToday = s.date === TODAY;
  const isRest = s.type === 'rest';
  return (
    <article className={cx('card p-4 flex flex-col gap-3 relative', isToday && 'ring-2 ring-lime border-lime', s.status === 'skipped' && 'opacity-70')}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-ink-3">{s.weekday}{isToday ? ' · Today' : ''}</p>
          <p className="text-xs text-ink-3">{fmtShortDate(s.date)}</p>
        </div>
        <span className={cx('w-9 h-9 rounded-[12px] flex items-center justify-center', workoutTone[s.type])}><WorkoutIcon type={s.type} size={18} /></span>
      </div>
      <div className="min-h-[44px]">
        <p className={cx('font-semibold leading-snug', s.status === 'skipped' && 'line-through decoration-ink-3')}>{s.title}</p>
        <p className="text-sm text-ink-3">{isRest ? 'Recovery day' : `${s.durationMin} min`}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {!isRest && <Chip tone={intensityTone(s.intensity)}>{s.intensity}</Chip>}
        {s.adjusted && <span className="chip bg-mint text-on-accent">Adjusted</span>}
        {s.status === 'completed' && <span className="chip bg-recovery-soft text-recovery-ink"><Check size={14} aria-hidden="true" />Done</span>}
        {s.status === 'skipped' && <span className="chip">Skipped</span>}
      </div>
      {!compact && !isRest && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {s.status === 'planned' ? (
            <>
              <button type="button" className="btn-sm btn" onClick={() => completeSession(s.id)} aria-label={`Mark ${s.title} on ${s.weekday} as completed`}><Check size={15} aria-hidden="true" />Done</button>
              <button type="button" className="icon-btn w-9 h-9" onClick={() => setAdjusting(true)} aria-label={`Adjust ${s.title} on ${s.weekday}`}><Pencil size={15} aria-hidden="true" /></button>
              <button type="button" className="icon-btn w-9 h-9" onClick={() => skipSession(s.id)} aria-label={`Skip ${s.title} on ${s.weekday}`}><SkipForward size={15} aria-hidden="true" /></button>
            </>
          ) : (
            <button type="button" className="btn-sm btn-ghost px-2" onClick={() => resetSession(s.id)}><RotateCcw size={14} aria-hidden="true" />Undo</button>
          )}
          {onOpen && <button type="button" className="btn-sm btn-ghost px-2 underline underline-offset-4" onClick={onOpen}>Details</button>}
        </div>
      )}
      <AdjustDialog s={s} open={adjusting} onClose={() => setAdjusting(false)} />
    </article>
  );
}

export function AdjustDialog({ s, open, onClose }: { s: PlanSession; open: boolean; onClose: () => void }) {
  const { adjustSession } = useApp();
  const [dur, setDur] = useState(s.durationMin);
  const [intensity, setIntensity] = useState<PlanSession['intensity']>(s.intensity);
  useEffect(() => { if (open) { setDur(s.durationMin); setIntensity(s.intensity); } }, [open, s.durationMin, s.intensity]);
  return (
    <Dialog open={open} onClose={onClose} title={`Adjust ${s.title.toLowerCase()}`}>
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor={`dur-${s.id}`} className="flex justify-between text-sm font-medium mb-2"><span>Duration</span><span className="metric">{dur} min</span></label>
          <input id={`dur-${s.id}`} type="range" min={10} max={120} step={5} value={dur} onChange={(e) => setDur(+e.target.value)} className="w-full accent-[rgb(var(--ink))]" />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Intensity</p>
          <Segmented label="Intensity" value={intensity as 'Low' | 'Low to moderate' | 'Moderate' | 'High'} onChange={(v) => setIntensity(v)} size="sm"
            options={[{ value: 'Low', label: 'Low' }, { value: 'Low to moderate', label: 'Low–mod' }, { value: 'Moderate', label: 'Moderate' }, { value: 'High', label: 'High' }]} />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => { adjustSession(s.id, { durationMin: dur, intensity }); onClose(); }}>Save changes</button>
        </div>
      </div>
    </Dialog>
  );
}

export function PlanSessionDialog({ s, onClose }: { s: PlanSession | null; onClose: () => void }) {
  return (
    <Dialog open={!!s} onClose={onClose} title={s ? `${s.weekday}: ${s.title}` : ''}>
      {s && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {s.type !== 'rest' && <span className="chip"><Timer size={14} aria-hidden="true" />{s.durationMin} min</span>}
            <Chip tone={intensityTone(s.intensity)}>{s.intensity}</Chip>
            {s.adjusted && <span className="chip bg-mint text-on-accent">Adjusted</span>}
          </div>
          <p className="text-ink-2">{s.description}</p>
          <div className="bg-sunken rounded-md p-4"><p className="label">Goal</p><p className="font-medium">{s.goal}</p></div>
          <p className="text-xs text-ink-3">Plans are suggestions based on fictional example data. Adjust them to how you feel.</p>
        </div>
      )}
    </Dialog>
  );
}
