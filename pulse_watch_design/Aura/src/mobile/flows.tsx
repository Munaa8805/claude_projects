import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, Flag, Heart, Pause, Play, Square, Zap } from 'lucide-react';
import { TODAY, suggestedWorkout } from '../data/mockData';
import type { Workout, WorkoutType } from '../data/types';
import { fmtClock, fmtDuration, fmtPace } from '../lib/format';
import { useApp } from '../state/AppState';
import { EmptyState, Logo, WorkoutIcon, cx, workoutTone } from '../components/ui';
import { HeartRateChart } from '../components/charts';
import { DevicePairing } from '../components/domain';

// ---------- Onboarding ----------
const GOALS = ['Improve fitness', 'Run a race', 'Improve consistency', 'Improve sleep habits', 'Stay active'];
const ACTS = ['Running', 'Walking', 'Cycling', 'Strength training', 'Other activities'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ChoiceList({ options, value, onChange, multi = true, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2.5">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" aria-pressed={on}
            onClick={() => onChange(multi ? (on ? value.filter((x) => x !== o) : [...value, o]) : [o])}
            className={cx('h-14 rounded-md border px-4 flex items-center justify-between text-left font-medium transition-colors', on ? 'border-ink bg-card shadow-[inset_0_0_0_1px_rgb(var(--ink))]' : 'border-line bg-card hover:border-line-strong')}>
            {o}
            <span className={cx('w-6 h-6 rounded-full border flex items-center justify-center', on ? 'bg-lime border-lime text-on-accent' : 'border-line-strong')} aria-hidden="true">{on && <Check size={14} />}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Onboarding() {
  const [params] = useSearchParams();
  const initial = Number(params.get('step') ?? 1);
  const [step, setStep] = useState(initial >= 1 && initial <= 6 ? initial : 1);
  const { member, updateMember, setOnboarded } = useApp();
  const [goals, setGoals] = useState<string[]>(['Run a race']);
  const [acts, setActs] = useState<string[]>(['Running', 'Walking', 'Strength training']);
  const [days, setDays] = useState<string[]>(member.trainingDays);
  const [paired, setPaired] = useState(false);
  const navigate = useNavigate();
  const total = 6;
  const canNext = step === 2 ? goals.length > 0 : step === 3 ? acts.length > 0 : step === 4 ? days.length > 0 : step === 5 ? paired : true;
  const next = () => {
    if (step === 4) updateMember({ trainingDays: days, preferredActivities: acts.filter((a) => a !== 'Other activities') });
    setStep((s) => Math.min(total, s + 1));
  };

  return (
    <div className="flex flex-col min-h-full">
      {step > 1 && step < 6 && (
        <div className="flex items-center gap-3 h-12 mb-4">
          <button type="button" className="icon-btn w-10 h-10" onClick={() => setStep((s) => s - 1)} aria-label="Previous step"><ChevronLeft size={18} aria-hidden="true" /></button>
          <div className="flex-1 flex gap-1.5" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
            {Array.from({ length: total - 1 }, (_, i) => <span key={i} className={cx('h-1.5 flex-1 rounded-full', i < step ? 'bg-ink' : 'bg-line')} />)}
          </div>
          <span className="text-sm text-ink-3 w-10 text-right">{step}/{total - 1}</span>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col flex-1 gap-6 pt-6">
          <Logo height={30} className="text-ink" />
          <div className="relative aspect-square rounded-xl bg-sunken overflow-hidden flex items-center justify-center" role="img" aria-label="Illustration of the screenless AURA Band">
            <svg viewBox="0 0 300 300" className="w-[86%]" aria-hidden="true">
              <circle cx="150" cy="150" r="118" fill="none" stroke="rgb(var(--mint))" strokeWidth="2" />
              <circle cx="150" cy="150" r="92" fill="none" stroke="rgb(var(--mint))" strokeWidth="2" opacity="0.6" />
              <rect x="112" y="40" width="76" height="220" rx="38" fill="#DCCBAE" />
              <rect x="106" y="108" width="88" height="84" rx="30" fill="#CDB99A" stroke="#15171C" strokeOpacity="0.12" />
              <path d="M132 150 Q150 140 168 150" fill="none" stroke="#15171C" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              <path d="M126 60 h48 M126 240 h48" stroke="#15171C" strokeOpacity="0.08" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-[30px] leading-9 font-semibold tracking-tight">Welcome to Aura</h1>
            <p className="text-ink-2 mt-2 leading-6">A screenless band and a calm coach that helps you understand recovery, sleep and training.</p>
          </div>
          <button type="button" className="btn-primary h-12 w-full mt-auto" onClick={() => setStep(2)}>Get started</button>
        </div>
      )}

      {step === 2 && (<Step title="What are you working toward?" sub="Choose all that apply."><ChoiceList label="Goals" options={GOALS} value={goals} onChange={setGoals} /></Step>)}
      {step === 3 && (<Step title="How do you like to move?" sub="We'll suggest sessions you enjoy."><ChoiceList label="Activities" options={ACTS} value={acts} onChange={setActs} /></Step>)}
      {step === 4 && (
        <Step title="When can you train?" sub={`${days.length} days a week selected.`}>
          <div className="grid grid-cols-4 gap-2.5" role="group" aria-label="Training days">
            {DAYS.map((d) => {
              const on = days.includes(d);
              return <button key={d} type="button" aria-pressed={on} onClick={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])}
                className={cx('h-16 rounded-md border font-semibold flex flex-col items-center justify-center', on ? 'bg-lime border-lime text-on-accent' : 'bg-card border-line text-ink-2')}>
                <span>{d.slice(0, 3)}</span>
              </button>;
            })}
          </div>
          <p className="text-sm text-ink-3 mt-4">Rest days matter too. Most runners do well with 4–5 training days.</p>
        </Step>
      )}
      {step === 5 && (<Step title="Pair your AURA Band" sub="Pairing is simulated in this prototype."><DevicePairing startConnected={false} onDone={() => { setPaired(true); setStep(6); }} /></Step>)}
      {step === 6 && (
        <div className="flex flex-col flex-1 gap-6 pt-16 text-center items-center">
          <span className="w-20 h-20 rounded-full bg-lime text-on-accent flex items-center justify-center"><Check size={36} aria-hidden="true" /></span>
          <div>
            <h1 className="font-display text-[30px] leading-9 font-semibold tracking-tight">You're all set, {member.firstName}</h1>
            <p className="text-ink-2 mt-2 leading-6">Wear your band tonight. After a few nights Aura learns your baseline and your scores become more personal.</p>
          </div>
          <button type="button" className="btn-primary h-12 w-full mt-auto" onClick={() => { setOnboarded(true); navigate('/m'); }}>Go to Today</button>
        </div>
      )}

      {step > 1 && step < 6 && (
        <div className="mt-auto pt-6">
          <button type="button" className="btn-dark h-12 w-full" disabled={!canNext} onClick={next}>{step === 5 && !paired ? 'Pair to continue' : 'Continue'}</button>
          {step === 5 && <button type="button" className="btn-ghost w-full mt-2" onClick={() => setStep(6)}>Set up later</button>}
        </div>
      )}
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div><h1 className="font-display text-[26px] leading-8 font-semibold tracking-tight">{title}</h1><p className="text-ink-3 mt-1">{sub}</p></div>
      {children}
    </div>
  );
}

// ---------- Live workout (fully simulated) ----------
const LIVE_TYPES: { type: WorkoutType; label: string; title: string; pace?: number; hr: number }[] = [
  { type: 'run', label: 'Run', title: suggestedWorkout.title, pace: 372, hr: 138 },
  { type: 'walk', label: 'Walk', title: 'Brisk walk', pace: 640, hr: 104 },
  { type: 'cycle', label: 'Ride', title: 'Easy ride', pace: 150, hr: 124 },
  { type: 'strength', label: 'Strength', title: 'Strength training', hr: 116 },
];

export function LiveWorkout() {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState(LIVE_TYPES[0]);
  const [phase, setPhase] = useState<'ready' | 'running' | 'paused'>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [hr, setHr] = useState(92);
  const [dist, setDist] = useState(0);
  const [points, setPoints] = useState<{ min: number; hr: number }[]>([]);
  const st = useRef({ elapsed: 0, hr: 92, dist: 0 });

  useEffect(() => {
    if (phase !== 'running') return;
    const t = window.setInterval(() => {
      const s = st.current;
      for (let i = 0; i < speed; i++) {
        s.elapsed += 1;
        const warm = Math.min(1, s.elapsed / 300);
        const target = 92 + (cfg.hr - 92) * warm + (s.elapsed / 60) * 0.25 + Math.sin(s.elapsed / 37) * 3;
        s.hr += (target - s.hr) * 0.08 + (Math.random() - 0.5) * 1.6;
        if (cfg.pace) s.dist += 1 / (cfg.pace * (1 + (Math.random() - 0.5) * 0.06));
      }
      setElapsed(s.elapsed);
      setHr(Math.round(s.hr));
      setDist(s.dist);
      setPoints((p) => [...p.slice(-240), { min: s.elapsed / 60, hr: Math.round(s.hr) }]);
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, speed, cfg]);

  const load = Math.round((elapsed / 60) * (cfg.type === 'run' ? 0.42 : cfg.type === 'cycle' ? 0.36 : cfg.type === 'strength' ? 0.5 : 0.25));
  const pace = dist > 0.02 ? elapsed / dist : undefined;
  const zone = hr < 130 ? 'Easy' : hr < 150 ? 'Steady' : 'Hard';

  const end = () => {
    const all = points.length ? points : [{ min: 0, hr }];
    const avg = Math.round(all.reduce((a, p) => a + p.hr, 0) / all.length);
    const max = Math.max(...all.map((p) => p.hr));
    const w: Workout = {
      id: `w-live-${Date.now()}`, date: TODAY, startTime: '17:30', type: cfg.type, title: cfg.title,
      durationMin: Math.max(1, Math.round(elapsed / 60)), distanceKm: cfg.pace ? +dist.toFixed(2) : undefined,
      avgHr: avg, maxHr: max, load: Math.max(1, load), intensity: avg < 130 ? 'Low' : avg < 145 ? 'Low to moderate' : 'Moderate',
      paceSecPerKm: cfg.pace && cfg.type !== 'cycle' && pace ? Math.round(pace) : undefined, calories: Math.round((elapsed / 60) * 9),
    };
    navigate('/m/workout/summary', { state: { workout: w, points: all, elapsedSec: elapsed } });
  };

  if (phase === 'ready') {
    return (
      <div className="flex flex-col min-h-full gap-6 pt-2">
        <div className="flex items-center gap-2 h-12"><button type="button" className="icon-btn w-10 h-10" onClick={() => navigate(-1)} aria-label="Back"><ChevronLeft size={18} aria-hidden="true" /></button><span className="font-semibold">New workout</span></div>
        <div>
          <p className="text-sm text-ink-3">Suggested for today</p>
          <h1 className="font-display text-[28px] leading-9 font-semibold tracking-tight">{cfg.title}</h1>
          <p className="text-ink-2 mt-1">{cfg.type === 'run' ? suggestedWorkout.message : 'Go at a comfortable effort.'}</p>
        </div>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Workout type">
          {LIVE_TYPES.map((t) => (
            <button key={t.type} type="button" role="radio" aria-checked={cfg.type === t.type} onClick={() => setCfg(t)}
              className={cx('rounded-md border h-20 flex flex-col items-center justify-center gap-1.5 text-sm font-medium', cfg.type === t.type ? 'border-ink shadow-[inset_0_0_0_1px_rgb(var(--ink))] bg-card' : 'border-line bg-card text-ink-2')}>
              <WorkoutIcon type={t.type} />{t.label}
            </button>
          ))}
        </div>
        <div className="bg-sunken rounded-md p-4 text-sm text-ink-2">Target heart rate {cfg.type === 'run' ? suggestedWorkout.hrZone : 'easy to steady'}. All live metrics on the next screen are simulated.</div>
        <button type="button" className="mt-auto mx-auto w-28 h-28 rounded-full bg-lime text-on-accent flex flex-col items-center justify-center font-semibold text-lg shadow-[0_10px_30px_rgba(199,243,107,0.5)]" onClick={() => setPhase('running')}>
          <Play size={30} aria-hidden="true" />Start
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full gap-4 pt-2">
      <div className="flex items-center justify-between h-12">
        <span className="flex items-center gap-2 font-semibold"><span className={cx('w-9 h-9 rounded-[12px] flex items-center justify-center', workoutTone[cfg.type])}><WorkoutIcon type={cfg.type} size={18} /></span>{cfg.title}</span>
        <button type="button" onClick={() => setSpeed((s) => (s === 1 ? 20 : 1))} aria-pressed={speed > 1} className={cx('h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1 border', speed > 1 ? 'bg-ink text-ground border-ink' : 'border-line text-ink-3')}>
          <Zap size={13} aria-hidden="true" />{speed > 1 ? 'Demo ×20' : 'Speed up demo'}
        </button>
      </div>

      <div className="text-center py-2" aria-live="off">
        <p className={cx('text-sm font-semibold', phase === 'paused' ? 'text-activity-ink' : 'text-ink-3')} role="status">{phase === 'paused' ? 'Paused' : 'Workout time'}</p>
        <p className={cx('metric text-[76px] leading-[84px] tabular-nums', phase === 'paused' && 'opacity-50')}>{fmtClock(elapsed)}</p>
      </div>

      <div className="bg-card border border-line rounded-lg p-4">
        <div className="flex items-end justify-between mb-1">
          <div className="flex items-center gap-2">
            <Heart size={22} className={cx('text-activity', phase === 'running' && 'animate-pulse')} fill="currentColor" aria-hidden="true" />
            <span className="metric text-[40px] leading-none tabular-nums" aria-label={`Heart rate ${hr} beats per minute`}>{hr}</span>
            <span className="text-sm text-ink-3 mb-1">bpm</span>
          </div>
          <span className="chip">{zone}</span>
        </div>
        <HeartRateChart points={points.length > 1 ? points : [{ min: 0, hr: 92 }, { min: 0.01, hr: 92 }]} height={120} live />
      </div>

      <dl className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-line rounded-md p-3"><dt className="label">Distance</dt><dd className="metric text-2xl tabular-nums">{cfg.pace ? dist.toFixed(2) : '–'}<span className="font-sans text-xs text-ink-3"> {cfg.pace ? 'km' : ''}</span></dd></div>
        <div className="bg-card border border-line rounded-md p-3"><dt className="label">{cfg.type === 'run' || cfg.type === 'walk' ? 'Pace' : 'Calories'}</dt><dd className="metric text-2xl tabular-nums">{cfg.type === 'run' || cfg.type === 'walk' ? fmtPace(pace) : Math.round((elapsed / 60) * 9)}</dd></div>
        <div className="bg-card border border-line rounded-md p-3"><dt className="label">Load</dt><dd className="metric text-2xl tabular-nums">+{load}</dd></div>
      </dl>

      <div className="mt-auto flex items-center justify-center gap-5 pt-2">
        {phase === 'running' ? (
          <button type="button" className="w-20 h-20 rounded-full bg-ink text-ground flex flex-col items-center justify-center text-xs font-semibold gap-1" onClick={() => setPhase('paused')}><Pause size={26} aria-hidden="true" />Pause</button>
        ) : (
          <>
            <button type="button" className="w-20 h-20 rounded-full bg-lime text-on-accent flex flex-col items-center justify-center text-xs font-semibold gap-1" onClick={() => setPhase('running')}><Play size={26} aria-hidden="true" />Resume</button>
            <button type="button" className="w-20 h-20 rounded-full bg-card border-2 border-ink text-ink flex flex-col items-center justify-center text-xs font-semibold gap-1" onClick={end}><Square size={22} aria-hidden="true" />End</button>
          </>
        )}
      </div>
      <p className="text-xs text-ink-3 text-center">Simulated data · no band connection required</p>
    </div>
  );
}

// ---------- Summary ----------
export function WorkoutSummary() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { saveWorkout, toast, member, plan, completeSession } = useApp();
  const data = loc.state as { workout: Workout; points: { min: number; hr: number }[]; elapsedSec: number } | null;
  const message = useMemo(() => {
    if (!data) return '';
    const w = data.workout;
    return w.avgHr < 146 ? `Nice work, ${member.firstName}. You kept your effort relaxed and steady, exactly what today called for.` : `Strong session, ${member.firstName}. That was a bit harder than planned, so take it easy tomorrow.`;
  }, [data, member.firstName]);
  if (!data) {
    return <EmptyState title="No workout to summarise" body="Start a workout from Today to see a summary here." action={<button type="button" className="btn btn-sm" onClick={() => navigate('/m')}>Back to Today</button>} />;
  }
  const { workout: w, points, elapsedSec } = data;
  const stats = [
    ['Duration', elapsedSec < 3600 ? fmtClock(elapsedSec) : fmtDuration(w.durationMin)],
    ['Distance', w.distanceKm !== undefined ? `${w.distanceKm.toFixed(2)} km` : '–'],
    ['Avg heart rate', `${w.avgHr} bpm`],
    ['Max heart rate', `${w.maxHr} bpm`],
    ['Estimated load', `+${w.load}`],
    ['Workout type', w.type === 'run' ? 'Running' : w.type === 'walk' ? 'Walking' : w.type === 'cycle' ? 'Cycling' : 'Strength'],
  ];
  return (
    <div className="flex flex-col gap-5 pt-4">
      <div className="flex flex-col items-center text-center gap-3">
        <span className="w-16 h-16 rounded-full bg-lime text-on-accent flex items-center justify-center"><Flag size={28} aria-hidden="true" /></span>
        <h1 className="font-display text-[28px] leading-9 font-semibold tracking-tight">Workout complete</h1>
        <p className="text-ink-2 leading-6">{message}</p>
      </div>
      <div className="bg-card border border-line rounded-lg p-5">
        <p className="font-semibold">{w.title}</p>
        <dl className="grid grid-cols-2 gap-4 mt-4">
          {stats.map(([l, v]) => <div key={l}><dt className="label">{l}</dt><dd className="metric text-[22px]">{v}</dd></div>)}
        </dl>
      </div>
      <div className="bg-card border border-line rounded-lg p-5">
        <p className="font-semibold mb-2">Heart rate</p>
        <HeartRateChart points={points.length > 1 ? points : [...points, { min: 0.1, hr: points[0].hr }]} height={150} />
      </div>
      <div className="flex flex-col gap-2 pb-2">
        <button type="button" className="btn-primary h-12" onClick={() => { saveWorkout(w); const p = plan.find((x) => x.date === TODAY); if (p && p.status === 'planned' && p.type === w.type) completeSession(p.id); toast('Workout saved'); navigate('/m'); }}>Save workout</button>
        <button type="button" className="btn h-12" onClick={() => navigate('/m')}>Back to Today</button>
      </div>
    </div>
  );
}
