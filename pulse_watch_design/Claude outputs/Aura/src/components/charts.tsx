import { useMemo } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { DayRecord, Workout } from '../data/types';
import { TODAY } from '../data/mockData';
import { fmtDuration, fmtPace, fmtShortDate, weekdayShort } from '../lib/format';
import { useApp } from '../state/AppState';
import { ChartTooltip } from './ui';

/** Resolves Aura's CSS colour tokens so charts follow the active theme. */
export function useColors() {
  const { theme } = useApp();
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const get = (n: string) => `rgb(${cs.getPropertyValue(`--${n}`).trim().split(' ').join(',')})`;
    return {
      ink: get('ink'), ink3: get('ink-subtle'), line: get('line'), sunken: get('card-sunken'), card: get('card'),
      recovery: get('recovery'), sleep: get('sleep'), sleepDeep: get('sleep-deep'), sleepLight: get('sleep-light'),
      activity: get('activity'), activityLight: get('activity-light'), lime: get('lime'), mint: get('mint'), lineStrong: get('line-strong'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}

const axis = { tickLine: false, axisLine: false, tick: { fontSize: 12 } } as const;

// ---------- Load ----------
export function LoadChart({ days, height = 240, showTrend = true, showDuration = false }: { days: DayRecord[]; height?: number; showTrend?: boolean; showDuration?: boolean }) {
  const c = useColors();
  const data = days.map((d) => {
    const main = d.workouts.find((w) => w.type !== 'walk' && w.type !== 'mobility') ?? d.workouts[0];
    return {
      date: d.date,
      label: days.length <= 7 ? weekdayShort(d.date) : fmtShortDate(d.date),
      load: d.dailyLoad,
      weekly: d.weeklyLoad,
      rest: d.isRest,
      today: d.date === TODAY,
      minutes: d.workouts.reduce((a, w) => a + w.durationMin, 0),
      workout: main ? `${main.title} · ${fmtDuration(main.durationMin)}` : 'Rest day',
      intensity: main?.intensity,
    };
  });
  return (
    <div style={{ height }} role="img" aria-label={`Daily load for ${days.length} days, from ${fmtShortDate(days[0].date)} to ${fmtShortDate(days[days.length - 1].date)}. Highest ${Math.max(...data.map((d) => d.load))}.`}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="label" {...axis} interval={days.length > 14 ? Math.ceil(days.length / 8) : 0} />
          <YAxis {...axis} domain={[0, 100]} ticks={[0, 50, 100]} />
          {showDuration && <YAxis yAxisId="min" orientation="right" {...axis} hide />}
          <Tooltip cursor={{ fill: c.sunken, radius: 8 } as never} content={<ChartTooltip render={(p) => (
            <div className="flex flex-col gap-1">
              <p className="label">{fmtShortDate(p.date as string)}{p.today ? ' · Today' : ''}</p>
              <p className="flex justify-between gap-4"><span className="text-ink-3">Daily load</span><strong>{p.load as number}</strong></p>
              {showTrend && <p className="flex justify-between gap-4"><span className="text-ink-3">Weekly load</span><strong>{p.weekly as number}</strong></p>}
              {showDuration && <p className="flex justify-between gap-4"><span className="text-ink-3">Training</span><strong>{p.minutes as number} min</strong></p>}
              <p className="text-ink-2">{p.rest ? 'Rest day' : (p.workout as string)}</p>
              {p.intensity ? <p className="text-xs text-ink-3">{p.intensity as string} intensity</p> : null}
            </div>
          )} />} />
          <Bar animationDuration={600} dataKey="load" name="Daily load" radius={[8, 8, 8, 8]} maxBarSize={days.length <= 7 ? 40 : 18}>
            {data.map((d) => <Cell key={d.date} fill={d.today ? c.ink : d.rest ? c.activityLight : c.activity} />)}
          </Bar>
          {showDuration && <Line yAxisId="min" dataKey="minutes" name="Training minutes" stroke={c.sleep} strokeWidth={2} dot={{ r: 3, fill: c.sleep }} />}
          {showTrend && <Line dataKey="weekly" name="Weekly load" stroke={c.ink3} strokeDasharray="4 4" strokeWidth={2} dot={false} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Recovery ----------
export function RecoveryTrend({ days, height = 260, metric = 'recovery' }: { days: DayRecord[]; height?: number; metric?: 'recovery' | 'hrv' | 'rhr' }) {
  const c = useColors();
  const meta = {
    recovery: { name: 'Recovery', color: c.recovery, domain: [0, 100] as [number, number], unit: '' },
    hrv: { name: 'HRV', color: c.sleep, domain: [30, 75] as [number, number], unit: ' ms' },
    rhr: { name: 'Resting HR', color: c.activity, domain: [48, 66] as [number, number], unit: ' bpm' },
  }[metric];
  const data = days.map((d) => ({ date: d.date, label: fmtShortDate(d.date), value: d[metric], rest: d.isRest }));
  const avg = Math.round(data.reduce((a, d) => a + d.value, 0) / data.length);
  return (
    <div style={{ height }} role="img" aria-label={`${meta.name} over ${days.length} days. Average ${avg}${meta.unit}.`}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={meta.color} stopOpacity={0.18} /><stop offset="100%" stopColor={meta.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="label" {...axis} interval={Math.max(0, Math.ceil(days.length / 7) - 1)} />
          <YAxis {...axis} domain={meta.domain} />
          <ReferenceLine y={avg} stroke={c.ink3} strokeDasharray="4 4" label={{ value: `avg ${avg}`, position: 'insideTopRight', fill: c.ink3, fontSize: 12 }} />
          <Tooltip cursor={{ stroke: c.lineStrong }} content={<ChartTooltip render={(p) => (
            <div>
              <p className="label">{fmtShortDate(p.date as string)}</p>
              <p className="flex justify-between gap-4"><span className="text-ink-3">{meta.name}</span><strong>{p.value as number}{meta.unit}</strong></p>
              {p.rest ? <p className="text-xs text-ink-3">Rest day</p> : null}
            </div>
          )} />} />
          <Area animationDuration={700} type="monotone" dataKey="value" name={meta.name} stroke={meta.color} strokeWidth={2.5} fill={`url(#fill-${metric})`}
            dot={days.length <= 14 ? { r: 3, fill: meta.color, strokeWidth: 0 } : false} activeDot={{ r: 5, fill: meta.color, stroke: c.card, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RecoveryDistribution({ days }: { days: DayRecord[] }) {
  const c = useColors();
  const buckets = [
    { name: 'Take it easy', range: '0–39', min: 0, max: 39, color: c.sleep },
    { name: 'Steady', range: '40–66', min: 40, max: 66, color: c.activity },
    { name: 'Ready', range: '67–100', min: 67, max: 100, color: c.recovery },
  ].map((b) => ({ ...b, count: days.filter((d) => d.recovery >= b.min && d.recovery <= b.max).length }));
  const total = days.length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-4 rounded-full overflow-hidden gap-[2px]" role="img" aria-label={buckets.map((b) => `${b.name} ${b.count} days`).join(', ')}>
        {buckets.map((b) => b.count > 0 && <div key={b.name} style={{ width: `${(b.count / total) * 100}%`, background: b.color }} />)}
      </div>
      <dl className="grid grid-cols-3 gap-3">
        {buckets.map((b) => (
          <div key={b.name}>
            <dt className="flex items-center gap-1.5 text-xs text-ink-3"><span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} aria-hidden="true" />{b.name}</dt>
            <dd className="metric text-2xl">{b.count}<span className="font-sans text-sm font-normal text-ink-3"> days</span></dd>
            <dd className="text-xs text-ink-3">Score {b.range}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------- Sleep ----------
export function SleepHistory({ days, height = 240, target = 450 }: { days: DayRecord[]; height?: number; target?: number }) {
  const c = useColors();
  const data = days.map((d) => ({ date: d.date, label: days.length <= 7 ? weekdayShort(d.date) : fmtShortDate(d.date), hours: +(d.sleepMin / 60).toFixed(2), sleepMin: d.sleepMin, score: d.sleepScore, today: d.date === TODAY, start: d.sleepStart, wake: d.wakeTime }));
  return (
    <div style={{ height }} role="img" aria-label={`Sleep duration for ${days.length} nights. Target ${fmtDuration(target)}.`}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="label" {...axis} interval={days.length > 10 ? 1 : 0} />
          <YAxis {...axis} domain={[0, 10]} ticks={[0, 4, 8]} tickFormatter={(v) => `${v}h`} />
          <ReferenceLine y={target / 60} stroke={c.ink3} strokeDasharray="4 4" />
          <Tooltip cursor={{ fill: c.sunken, radius: 8 } as never} content={<ChartTooltip render={(p) => (
            <div>
              <p className="label">Night ending {fmtShortDate(p.date as string)}</p>
              <p className="flex justify-between gap-4"><span className="text-ink-3">Asleep</span><strong>{fmtDuration(p.sleepMin as number)}</strong></p>
              <p className="flex justify-between gap-4"><span className="text-ink-3">Sleep score</span><strong>{p.score as number}</strong></p>
            </div>
          )} />} />
          <Bar animationDuration={600} dataKey="hours" name="Sleep" radius={[8, 8, 8, 8]} maxBarSize={28}>
            {data.map((d) => <Cell key={d.date} fill={d.today ? c.sleepDeep : d.sleepMin >= target ? c.sleep : c.sleepLight} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Bedtime and wake time per night, plotted as a floating band. */
export function SleepWindowChart({ days, height = 200 }: { days: DayRecord[]; height?: number }) {
  const c = useColors();
  const toAxis = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); const v = h * 60 + m; return v < 720 ? v + 1440 : v; };
  const data = days.map((d) => ({ label: weekdayShort(d.date), date: d.date, range: [toAxis(d.sleepStart), toAxis(d.wakeTime)], start: d.sleepStart, wake: d.wakeTime }));
  const fmt = (v: number) => { const m = v % 1440; const h = Math.floor(m / 60); return `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'pm' : 'am'}`; };
  return (
    <div style={{ height }} role="img" aria-label="Bedtime and wake time for each night of the week">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} reversed domain={[21.5 * 60, 31.5 * 60]} ticks={[22 * 60, 24 * 60, 26 * 60, 28 * 60, 30 * 60]} tickFormatter={fmt} />
          <Tooltip cursor={{ fill: c.sunken, radius: 8 } as never} content={<ChartTooltip render={(p) => (
            <div><p className="label">{fmtShortDate(p.date as string)}</p><p>{p.start as string} → {p.wake as string}</p></div>
          )} />} />
          <Bar dataKey="range" fill={c.sleep} radius={[8, 8, 8, 8]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Workout detail ----------
export function HeartRateChart({ points, maxHr, height = 240, live = false }: { points: { min: number; hr: number }[]; maxHr?: number; height?: number; live?: boolean }) {
  const c = useColors();
  return (
    <div style={{ height }} role="img" aria-label={`Heart rate chart, ${points.length} readings${maxHr ? `, peak ${maxHr} bpm` : ''}.`}>
      <ResponsiveContainer>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hrfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.activity} stopOpacity={0.22} /><stop offset="100%" stopColor={c.activity} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="min" type="number" domain={['dataMin', 'dataMax']} {...axis} tickFormatter={(v) => `${Math.round(v)}′`} hide={live} />
          <YAxis {...axis} domain={live ? ['dataMin - 12', 'dataMax + 12'] : [70, 190]} ticks={live ? undefined : [90, 130, 170]} hide={live} />
          {!live && <Tooltip cursor={{ stroke: c.lineStrong }} content={<ChartTooltip render={(p) => (
            <div><p className="label">{Math.floor(p.min as number)} min</p><p><strong>{p.hr as number}</strong> bpm</p></div>
          )} />} />}
          <Area type="monotone" dataKey="hr" name="Heart rate" stroke={c.activity} strokeWidth={2.5} fill="url(#hrfill)" dot={false} isAnimationActive={!live} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaceChart({ splits, height = 220 }: { splits: { km: number; pace: number }[]; height?: number }) {
  const c = useColors();
  const best = Math.min(...splits.map((s) => s.pace));
  return (
    <div style={{ height }} role="img" aria-label={`Pace per kilometre for ${splits.length} kilometres. Fastest ${fmtPace(best)} per km.`}>
      <ResponsiveContainer>
        <BarChart data={splits} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="km" {...axis} tickFormatter={(v) => `${v} km`} />
          <YAxis {...axis} reversed domain={[Math.floor((best - 30) / 10) * 10, 'dataMax']} tickFormatter={(v) => fmtPace(v)} width={52} />
          <Tooltip cursor={{ fill: c.sunken, radius: 8 } as never} content={<ChartTooltip render={(p) => (
            <div><p className="label">Kilometre {p.km as number}</p><p><strong>{fmtPace(p.pace as number)}</strong> /km</p></div>
          )} />} />
          <Bar dataKey="pace" radius={[8, 8, 8, 8]} maxBarSize={30}>
            {splits.map((s) => <Cell key={s.km} fill={s.pace === best ? c.ink : c.sleep} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ values, color = 'recovery', height = 36 }: { values: number[]; color?: 'recovery' | 'sleep' | 'activity' | 'ink'; height?: number }) {
  const c = useColors();
  const stroke = { recovery: c.recovery, sleep: c.sleep, activity: c.activity, ink: c.ink }[color];
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }} aria-hidden="true">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} fill="none" dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyTotals({ weeks, height = 220 }: { weeks: { label: string; load: number; sessions: number; minutes: number; current?: boolean }[]; height?: number }) {
  const c = useColors();
  return (
    <div style={{ height }} role="img" aria-label={`Average daily load per week for ${weeks.length} weeks.`}>
      <ResponsiveContainer>
        <BarChart data={weeks} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} domain={[0, 70]} ticks={[0, 35, 70]} />
          <Tooltip cursor={{ fill: c.sunken, radius: 8 } as never} content={<ChartTooltip render={(p) => (
            <div className="flex flex-col gap-0.5">
              <p className="label">Week of {p.label as string}</p>
              <p className="flex justify-between gap-4"><span className="text-ink-3">Avg daily load</span><strong>{p.load as number}</strong></p>
              <p className="flex justify-between gap-4"><span className="text-ink-3">Sessions</span><strong>{p.sessions as number}</strong></p>
              <p className="flex justify-between gap-4"><span className="text-ink-3">Training</span><strong>{fmtDuration(p.minutes as number)}</strong></p>
            </div>
          )} />} />
          <Bar dataKey="load" radius={[8, 8, 8, 8]} maxBarSize={36}>
            {weeks.map((w) => <Cell key={w.label} fill={w.current ? c.ink : c.activity} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function workoutsInRange(days: DayRecord[]): Workout[] {
  return days.flatMap((d) => d.workouts);
}
