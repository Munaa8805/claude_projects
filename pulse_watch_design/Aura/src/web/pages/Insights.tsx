import { useState } from 'react';
import { Info } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { history } from '../../data/mockData';
import { fmtDuration, mean } from '../../lib/format';
import { insights, weeks } from '../../lib/analytics';
import { Card, CardHeader, Chip, ChartTooltip, cx } from '../../components/ui';
import { WeeklyTotals, useColors } from '../../components/charts';
import { PageHeader } from '../WebLayout';

export function WeekdayPattern() {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const order = [1, 2, 3, 4, 5, 6, 0];
  const avgs = order.map((wd) => Math.round(mean(history.filter((d) => d.weekday === wd).map((d) => d.dailyLoad))));
  const max = Math.max(...avgs);
  return (
    <div className="grid grid-cols-7 gap-2" role="img" aria-label={`Average daily load by weekday: ${names.map((n, i) => `${n} ${avgs[i]}`).join(', ')}`}>
      {avgs.map((v, i) => (
        <div key={names[i]} className="flex flex-col items-center gap-2">
          <div className="w-full aspect-square rounded-[12px] flex items-center justify-center text-sm font-semibold"
            style={{ background: `rgb(var(--activity) / ${0.12 + (v / max) * 0.78})`, color: v / max > 0.6 ? '#fff' : 'rgb(var(--ink))' }}>{v}</div>
          <span className="text-xs text-ink-3">{names[i]}</span>
        </div>
      ))}
    </div>
  );
}

function SleepConsistencyChart() {
  const c = useColors();
  const data = weeks().filter((w) => !w.current).map((w) => ({ label: w.label, sd: w.sleepSd, avg: +(w.avgSleep / 60).toFixed(1) }));
  return (
    <div style={{ height: 200 }} role="img" aria-label="Night-to-night sleep variation by week">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.line} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} domain={[0, 50]} tickFormatter={(v) => `${v}m`} />
          <Tooltip content={<ChartTooltip render={(p) => (
            <div><p className="label">Week of {p.label as string}</p><p>Varied by <strong>{p.sd as number} min</strong></p><p className="text-ink-3">Average {p.avg as number}h</p></div>
          )} />} />
          <Line dataKey="sd" stroke={c.sleep} strokeWidth={2.5} dot={{ r: 4, fill: c.sleep, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Insights() {
  const all = weeks().filter((w) => w.days.length === 7);
  const [weekIdx, setWeekIdx] = useState(all.length - 1);
  const w = all[weekIdx];
  const list = insights();
  const [cat, setCat] = useState<'All' | 'Sleep' | 'Recovery' | 'Training' | 'Activity'>('All');
  const shown = list.filter((i) => cat === 'All' || i.category === cat);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Insights" subtitle="Patterns from your last eight weeks"
        actions={
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-3">Week of</span>
            <select value={weekIdx} onChange={(e) => setWeekIdx(+e.target.value)} className="h-10 rounded-full border border-line bg-card px-4 font-medium">
              {all.map((x, i) => <option key={x.start} value={i}>{x.label}</option>)}
            </select>
          </label>
        } />

      <Card className="p-6 sm:p-8 bg-ink text-ground border-ink">
        <p className="text-sm text-ground/70">Weekly summary · week of {w.label}</p>
        <dl className="grid grid-cols-2 lg:grid-cols-5 gap-6 mt-4">
          <div><dt className="text-sm text-ground/70">Workouts</dt><dd className="metric text-4xl">{w.sessions}</dd></div>
          <div><dt className="text-sm text-ground/70">Training time</dt><dd className="metric text-4xl">{fmtDuration(w.minutes)}</dd></div>
          <div><dt className="text-sm text-ground/70">Average sleep</dt><dd className="metric text-4xl">{fmtDuration(w.avgSleep)}</dd></div>
          <div><dt className="text-sm text-ground/70">Average recovery</dt><dd className="metric text-4xl">{w.avgRecovery}</dd></div>
          <div><dt className="text-sm text-ground/70">Rest days</dt><dd className="metric text-4xl text-lime">{w.restDays}</dd></div>
        </dl>
      </Card>

      <section aria-labelledby="pat-h">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 id="pat-h" className="font-display text-xl font-semibold">What we noticed</h2>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter insights">
            {(['All', 'Sleep', 'Recovery', 'Training', 'Activity'] as const).map((c) => (
              <button key={c} type="button" role="radio" aria-checked={cat === c} onClick={() => setCat(c)}
                className={cx('h-9 px-4 rounded-full text-sm font-medium border', cat === c ? 'bg-ink text-ground border-ink' : 'bg-card border-line hover:border-line-strong')}>{c}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shown.map((i, n) => (
            <article key={i.id} className={cx('rounded-lg p-6 flex flex-col gap-3 border', n === 0 && cat === 'All' ? 'bg-mint border-mint text-on-accent md:col-span-2' : 'bg-card border-line')}>
              <div><Chip tone={i.tone}>{i.category}</Chip></div>
              <h3 className={cx('font-display font-semibold tracking-tight', n === 0 && cat === 'All' ? 'text-[26px] leading-8' : 'text-xl leading-7')}>{i.title}</h3>
              <p className={cx(n === 0 && cat === 'All' ? 'text-mint-ink' : 'text-ink-2')}>{i.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <CardHeader title="Training consistency" subtitle="Average daily load per week · tap a bar for details" />
          <WeeklyTotals weeks={weeks().map((x) => ({ label: x.label, load: x.load, sessions: x.sessions, minutes: x.minutes, current: x.current }))} />
        </Card>
        <Card className="p-6">
          <CardHeader title="Sleep consistency" subtitle="How much sleep duration varied night to night, by week" />
          <SleepConsistencyChart />
        </Card>
        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Activity patterns" subtitle="Average daily load by weekday, eight weeks" />
          <WeekdayPattern />
          <p className="text-sm text-ink-3 mt-4">Thursdays and Saturdays carry your hardest sessions; Fridays are your most consistent rest day.</p>
        </Card>
      </section>

      <p className="text-sm text-ink-3 flex gap-2"><Info size={16} className="shrink-0 mt-0.5" aria-hidden="true" />Insights describe patterns in fictional example data. They are not medical advice and don't predict health or performance outcomes.</p>
    </div>
  );
}
