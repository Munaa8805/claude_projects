import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { TODAY, allWorkouts, history, today } from '../../data/mockData';
import type { WorkoutType } from '../../data/types';
import { fmtDuration, fmtNumber } from '../../lib/format';
import { lastNDays, weeks } from '../../lib/analytics';
import { useSimulatedLoad } from '../../state/AppState';
import { Card, CardHeader, EmptyState, Progress, ScoreRing, Segmented, Skeleton, cx } from '../../components/ui';
import { LoadChart } from '../../components/charts';
import { WorkoutCard } from '../../components/domain';
import { PageHeader } from '../WebLayout';

const filters: { value: 'all' | WorkoutType; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'run', label: 'Running' }, { value: 'walk', label: 'Walking' }, { value: 'cycle', label: 'Cycling' }, { value: 'strength', label: 'Strength' },
];

export default function Activity() {
  const [range, setRange] = useState<'7' | '14' | '28'>('14');
  const [showDuration, setShowDuration] = useState(true);
  const [type, setType] = useState<'all' | WorkoutType>('all');
  const [count, setCount] = useState(9);
  const loading = useSimulatedLoad(range);
  const days = lastNDays(+range);
  const ws = weeks();
  const thisWeek = lastNDays(7);
  const lastWeek = history.slice(-14, -7);
  const sum = (ds: typeof thisWeek, f: (d: (typeof thisWeek)[number]) => number) => ds.reduce((a, d) => a + f(d), 0);
  const train = (ds: typeof thisWeek) => ds.flatMap((d) => d.workouts);
  const comparison = [
    { label: 'Sessions', now: train(thisWeek).length, before: train(lastWeek).length, fmt: (v: number) => String(v) },
    { label: 'Training time', now: sum(thisWeek, (d) => d.workouts.reduce((a, w) => a + w.durationMin, 0)), before: sum(lastWeek, (d) => d.workouts.reduce((a, w) => a + w.durationMin, 0)), fmt: fmtDuration },
    { label: 'Distance', now: train(thisWeek).reduce((a, w) => a + (w.distanceKm ?? 0), 0), before: train(lastWeek).reduce((a, w) => a + (w.distanceKm ?? 0), 0), fmt: (v: number) => `${v.toFixed(1)} km` },
    { label: 'Total load', now: sum(thisWeek, (d) => d.dailyLoad), before: sum(lastWeek, (d) => d.dailyLoad), fmt: (v: number) => String(v) },
  ];
  const list = allWorkouts.filter((w) => w.date <= TODAY && (type === 'all' || w.type === type));
  const volume = thisWeek.reduce((a, d) => a + d.workouts.reduce((x, w) => x + w.durationMin, 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity and load" subtitle="How much training you're doing, and how hard" />

      <section className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5">
        <Card className="p-6 flex items-center gap-6">
          <ScoreRing value={today.dailyLoad} size={140} stroke={11} tone="activity" label="Today's load" sublabel="Today's Load" valueClass="text-[46px]" />
          <ScoreRing value={today.weeklyLoad} size={140} stroke={11} tone="neutral" label="Weekly load" sublabel="Weekly Load" valueClass="text-[46px]" />
        </Card>
        <Card className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
          <div><p className="label">Activity volume · 7 days</p><p className="metric text-[30px] leading-10">{fmtDuration(volume)}</p></div>
          <div><p className="label">Active minutes today</p><p className="metric text-[30px] leading-10">{today.activeMin}</p></div>
          <div><p className="label">Steps today</p><p className="metric text-[30px] leading-10">{fmtNumber(today.steps)}</p></div>
          <div>
            <p className="label">Weekly load range</p>
            <p className="text-sm text-ink-2 mb-2">Your usual: 45–65</p>
            <Progress value={today.weeklyLoad} tone="neutral" label="Weekly load within usual range" />
          </div>
        </Card>
      </section>

      <Card className="p-6">
        <div className="flex flex-wrap justify-between gap-3 mb-4">
          <div><h2 className="text-[17px] font-semibold">Daily load trend</h2><p className="text-sm text-ink-3">Bars show daily load; hover for workout and intensity</p></div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-2 text-sm mr-2"><input type="checkbox" checked={showDuration} onChange={(e) => setShowDuration(e.target.checked)} className="w-4 h-4 accent-[rgb(var(--ink))]" />Show duration</label>
            <Segmented label="Range" value={range} onChange={setRange} size="sm" options={[{ value: '7', label: '7D' }, { value: '14', label: '14D' }, { value: '28', label: '28D' }]} />
          </div>
        </div>
        {loading ? <Skeleton className="h-[280px]" /> : <LoadChart days={days} height={280} showDuration={showDuration} />}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-ink-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-activity" aria-hidden="true" />Workout day</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-activity-light" aria-hidden="true" />Rest day</span>
          <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-ink-3" aria-hidden="true" />Weekly load</span>
          {showDuration && <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-sleep" aria-hidden="true" />Training minutes</span>}
        </div>
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6">
          <CardHeader title="Weekly comparison" subtitle="Last 7 days vs the 7 before" />
          <ul className="divide-y divide-line">
            {comparison.map((c) => {
              const up = c.now >= c.before;
              return (
                <li key={c.label} className="flex justify-between items-center py-3.5">
                  <div><p className="text-sm text-ink-3">{c.label}</p><p className="metric text-xl">{c.fmt(c.now)}</p></div>
                  <p className="text-sm text-ink-3 flex items-center gap-1">{up ? <ArrowUpRight size={15} aria-hidden="true" /> : <ArrowDownRight size={15} aria-hidden="true" />}was {c.fmt(c.before)}</p>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="lg:col-span-2 p-6">
          <CardHeader title="Eight weeks of training" subtitle="Sessions per week · lighter week after the 24–25 Oct weekend" />
          <div className="grid grid-cols-9 gap-2 items-end h-[250px]" role="img" aria-label={`Sessions per week: ${ws.map((w) => `${w.label} ${w.sessions}`).join(', ')}`}>
            {ws.map((w) => (
              <div key={w.start} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-semibold">{w.sessions}</span>
                <div className={cx('w-full max-w-[36px] rounded-[8px]', w.current ? 'bg-ink' : w.start === '2026-10-26' ? 'bg-activity-light' : 'bg-activity')} style={{ height: `${(w.sessions / 8) * 100}%` }} />
                <span className="text-[11px] text-ink-3 whitespace-nowrap">{w.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section aria-labelledby="hist-h">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 id="hist-h" className="font-display text-xl font-semibold">Workout history</h2>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by activity">
            {filters.map((f) => (
              <button key={f.value} type="button" role="radio" aria-checked={type === f.value} onClick={() => { setType(f.value); setCount(9); }}
                className={cx('h-9 px-4 rounded-full text-sm font-medium border transition-colors', type === f.value ? 'bg-ink text-ground border-ink' : 'bg-card border-line hover:border-line-strong')}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? <Card><EmptyState title="No workouts of this type yet" body="Workouts appear here after your band syncs them." /></Card> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {list.slice(0, count).map((w) => <WorkoutCard key={w.id} w={w} to={`/workouts/${w.id}`} />)}
            </div>
            {count < list.length && <button type="button" className="btn mt-5 mx-auto flex" onClick={() => setCount((c) => c + 9)}>Show more workouts</button>}
          </>
        )}
      </section>
    </div>
  );
}
