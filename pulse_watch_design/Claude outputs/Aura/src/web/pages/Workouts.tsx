import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { allWorkouts, heartRateSeries, paceSplits, workoutById, workoutTypeLabel } from '../../data/mockData';
import type { Workout, WorkoutType } from '../../data/types';
import { fmtDate, fmtDuration, fmtPace, fmtTime12 } from '../../lib/format';
import { mondayOf } from '../../lib/analytics';
import { useApp, useSimulatedLoad } from '../../state/AppState';
import { Card, CardHeader, EmptyState, ErrorState, LoadingBlock, Skeleton, WorkoutIcon, cx, workoutTone } from '../../components/ui';
import { HeartRateChart, PaceChart } from '../../components/charts';
import { WorkoutRow } from '../../components/domain';
import { PageHeader } from '../WebLayout';

export function useAllWorkouts() {
  const { savedWorkouts } = useApp();
  return useMemo(() => [...savedWorkouts, ...allWorkouts], [savedWorkouts]);
}

export default function Workouts() {
  const workouts = useAllWorkouts();
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | WorkoutType>('all');
  const filtered = workouts.filter((w) => (type === 'all' || w.type === type) && w.title.toLowerCase().includes(q.toLowerCase()));
  const groups = new Map<string, Workout[]>();
  filtered.forEach((w) => { const k = mondayOf(w.date); groups.set(k, [...(groups.get(k) ?? []), w]); });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Workouts" subtitle={`${workouts.length} sessions over eight weeks`} />
      <div className="flex flex-wrap gap-3">
        <label className="relative flex-1 min-w-[220px] max-w-sm">
          <span className="sr-only">Search workouts</span>
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search workouts" className="w-full h-11 rounded-full border border-line bg-card pl-11 pr-4 text-[15px] placeholder:text-ink-3 focus:outline-none focus:border-ink" />
        </label>
        <label className="sr-only" htmlFor="wtype">Activity type</label>
        <select id="wtype" value={type} onChange={(e) => setType(e.target.value as typeof type)} className="h-11 rounded-full border border-line bg-card px-4 text-[15px]">
          <option value="all">All activities</option>
          {(Object.keys(workoutTypeLabel) as WorkoutType[]).map((t) => <option key={t} value={t}>{workoutTypeLabel[t]}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? <Card><EmptyState title="No workouts found" body="Try a different search or activity type." action={<button type="button" className="btn btn-sm" onClick={() => { setQ(''); setType('all'); }}>Clear filters</button>} /></Card> : (
        <div className="flex flex-col gap-5">
          {[...groups.entries()].map(([wk, ws]) => (
            <Card key={wk} className="p-5 sm:p-6">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="font-semibold">Week of {fmtDate(wk, { day: 'numeric', month: 'long' })}</h2>
                <span className="text-sm text-ink-3">{ws.length} sessions · {fmtDuration(ws.reduce((a, w) => a + w.durationMin, 0))}</span>
              </div>
              <div className="divide-y divide-line">{ws.map((w) => <WorkoutRow key={w.id} w={w} to={`/workouts/${w.id}`} />)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkoutDetail() {
  const { id } = useParams();
  const { savedWorkouts } = useApp();
  const w = savedWorkouts.find((x) => x.id === id) ?? workoutById(id ?? '');
  const loading = useSimulatedLoad(id, 450);
  if (!w) {
    return <Card><ErrorState title="We couldn't find that workout" body="It may have been removed, or the link is incomplete." /><div className="flex justify-center pb-8"><Link to="/workouts" className="btn btn-sm">Back to workouts</Link></div></Card>;
  }
  const hr = heartRateSeries(w);
  const splits = paceSplits(w);
  const isRun = w.type === 'run';
  const zones = [
    { name: 'Easy', lo: 0, hi: 130 }, { name: 'Steady', lo: 130, hi: 150 }, { name: 'Hard', lo: 150, hi: 168 }, { name: 'Max', lo: 168, hi: 999 },
  ].map((z) => ({ ...z, pct: Math.round((hr.filter((p) => p.hr >= z.lo && p.hr < z.hi).length / hr.length) * 100) }));
  const stats = [
    { label: 'Duration', value: fmtDuration(w.durationMin) },
    { label: 'Distance', value: w.distanceKm ? `${w.distanceKm.toFixed(2)} km` : '–' },
    { label: 'Avg heart rate', value: `${w.avgHr} bpm` },
    { label: 'Max heart rate', value: `${w.maxHr} bpm` },
    { label: 'Workout load', value: `+${w.load}` },
    { label: isRun || w.type === 'walk' ? 'Avg pace' : 'Calories', value: isRun || w.type === 'walk' ? `${fmtPace(w.paceSecPerKm)} /km` : `${w.calories} kcal` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link to="/workouts" className="inline-flex items-center gap-2 text-sm font-medium text-ink-3 hover:text-ink self-start"><ArrowLeft size={16} aria-hidden="true" />All workouts</Link>
      <div className="flex flex-wrap items-center gap-5">
        <span className={cx('w-16 h-16 rounded-[20px] flex items-center justify-center', workoutTone[w.type])}><WorkoutIcon type={w.type} size={28} /></span>
        <div className="flex-1 min-w-0">
          <p className="text-ink-3">{workoutTypeLabel[w.type]} · {w.intensity} intensity</p>
          <h1 className="font-display text-[30px] sm:text-[36px] font-semibold tracking-tight leading-tight">{w.title}</h1>
          <p className="text-ink-2">{fmtDate(w.date)} at {fmtTime12(w.startTime)}</p>
        </div>
      </div>

      <Card className="p-6">
        {loading ? <LoadingBlock rows={2} /> : (
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((s) => <div key={s.label}><dt className="label">{s.label}</dt><dd className="metric text-[26px] leading-9">{s.value}</dd></div>)}
          </dl>
        )}
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6">
          <CardHeader title="Heart rate" subtitle={`Average ${w.avgHr} bpm · peak ${w.maxHr} bpm`} />
          {loading ? <Skeleton className="h-[260px]" /> : <HeartRateChart points={hr} maxHr={w.maxHr} height={260} />}
        </Card>
        <Card className="p-6">
          <CardHeader title="Time in effort zones" />
          <ul className="flex flex-col gap-3">
            {zones.map((z, i) => (
              <li key={z.name}>
                <div className="flex justify-between text-sm mb-1"><span>{z.name}{z.hi < 999 ? <span className="text-ink-3"> · {z.lo || '<'}{z.lo ? '–' : ''}{z.hi} bpm</span> : <span className="text-ink-3"> · 168+ bpm</span>}</span><strong>{z.pct}%</strong></div>
                <div className="h-2.5 rounded-full bg-sunken overflow-hidden"><div className={cx('h-full rounded-full', ['bg-recovery', 'bg-activity-light', 'bg-activity', 'bg-ink'][i])} style={{ width: `${z.pct}%` }} /></div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-3 mt-4">Zones are simple example ranges based on Maya's fictional profile.</p>
        </Card>
      </section>

      {isRun && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <CardHeader title="Pace" subtitle="Split per kilometre · darkest bar is the fastest" />
            {splits.length ? <PaceChart splits={splits} height={240} /> : <EmptyState title="No splits" body="This run was shorter than one kilometre." />}
          </Card>
          <Card className="p-6 flex flex-col">
            <CardHeader title="Route" />
            <div className="flex-1 min-h-[240px] rounded-md bg-recovery-soft relative overflow-hidden" role="img" aria-label="Map placeholder showing a looped route">
              <svg viewBox="0 0 400 240" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g stroke="rgb(var(--line-strong))" strokeWidth="1" opacity="0.7">
                  {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50 - 30} y2="240" />)}
                  {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 48} x2="400" y2={i * 48 + 14} />)}
                </g>
                <path d="M70 180 C 90 120, 140 90, 190 96 S 290 60, 320 110 S 300 190, 240 196 S 120 214, 70 180 Z" fill="none" stroke="rgb(var(--activity))" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="70" cy="180" r="8" fill="rgb(var(--ink))" /><circle cx="70" cy="180" r="3.5" fill="rgb(var(--lime))" />
              </svg>
              <span className="absolute bottom-3 left-3 chip bg-card">Map placeholder · route is illustrative</span>
            </div>
          </Card>
        </section>
      )}

      <Card className="p-6">
        <CardHeader title="Activity summary" />
        <p className="text-ink-2 leading-7 max-w-3xl">
          {w.title} lasting {fmtDuration(w.durationMin)}{w.distanceKm ? ` over ${w.distanceKm.toFixed(1)} km` : ''}. Heart rate averaged {w.avgHr} bpm, which matches a {w.intensity.toLowerCase()} effort.
          This session added {w.load} to your daily load{isRun ? `, with an average pace of ${fmtPace(w.paceSecPerKm)} per kilometre` : ''}. Estimated energy: {w.calories} kcal.
        </p>
      </Card>
    </div>
  );
}
