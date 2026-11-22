import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import { history } from '../../data/mockData';
import { fmtDate, fmtDuration, fmtShortDate, mean, recoveryStatus } from '../../lib/format';
import { lastNDays } from '../../lib/analytics';
import { useApp, useSimulatedLoad } from '../../state/AppState';
import { Card, CardHeader, Chip, EmptyState, LoadingBlock, ScoreRing, Segmented, Skeleton, cx } from '../../components/ui';
import { RecoveryDistribution, RecoveryTrend, Sparkline } from '../../components/charts';
import { PageHeader } from '../WebLayout';
import { sleepContribution } from './Overview';

export default function Recovery() {
  const { selectedDate } = useApp();
  const [range, setRange] = useState<'7' | '30' | '56'>('30');
  const [metric, setMetric] = useState<'recovery' | 'hrv' | 'rhr'>('recovery');
  const [showAll, setShowAll] = useState(false);
  const [onlyRest, setOnlyRest] = useState(false);
  const loading = useSimulatedLoad(`${selectedDate}-${range}-${metric}`);
  const day = history.find((d) => d.date === selectedDate)!;
  const status = recoveryStatus(day.recovery);
  const days = lastNDays(+range, selectedDate);
  const last7 = lastNDays(7, selectedDate);
  const idx = history.findIndex((d) => d.date === selectedDate);
  const prev7 = history.slice(Math.max(0, idx - 13), Math.max(0, idx - 6));
  const comp = [
    { label: 'Recovery', now: mean(last7.map((d) => d.recovery)), before: mean(prev7.map((d) => d.recovery)), unit: '', higherIsBetter: true },
    { label: 'HRV', now: mean(last7.map((d) => d.hrv)), before: mean(prev7.map((d) => d.hrv)), unit: ' ms', higherIsBetter: true },
    { label: 'Resting HR', now: mean(last7.map((d) => d.rhr)), before: mean(prev7.map((d) => d.rhr)), unit: ' bpm', higherIsBetter: false },
    { label: 'Sleep', now: mean(last7.map((d) => d.sleepMin)), before: mean(prev7.map((d) => d.sleepMin)), unit: 'min', higherIsBetter: true },
  ];
  const table = history.slice(0, idx + 1).reverse().filter((d) => !onlyRest || history[history.indexOf(d) - 1]?.isRest);
  const rows = showAll ? table : table.slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Recovery" subtitle={fmtDate(selectedDate)} />

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <Card className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-8 bg-card" aria-label="Today's recovery score">
          {loading ? <Skeleton className="w-[260px] h-[260px] rounded-full" /> : (
            <ScoreRing value={day.recovery} size={260} stroke={14} tone={status.tone} label="Recovery score" sublabel="Recovery" valueClass="text-[88px]" />
          )}
          <div className="flex flex-col gap-3 max-w-sm">
            <Chip tone={status.tone}>{status.label}</Chip>
            <p className="font-display text-2xl font-semibold leading-8">{status.note}</p>
            <p className="text-ink-2">Your score combines last night's sleep with your heart rate variability and resting heart rate, compared with your own 30-day baseline.</p>
            <p className="text-sm text-ink-3 flex gap-2"><Info size={16} className="shrink-0 mt-0.5" aria-hidden="true" />Recovery is a simplified indicator based on your recent sleep and example heart rate measurements. It is not a medical assessment.</p>
          </div>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
          {[
            { label: 'Heart rate variability', value: day.hrv, unit: 'ms', series: last7.map((d) => d.hrv), color: 'sleep' as const, body: 'The variation in time between heartbeats overnight. Higher than your baseline usually means you are well rested.' },
            { label: 'Resting heart rate', value: day.rhr, unit: 'bpm', series: last7.map((d) => d.rhr), color: 'activity' as const, body: 'Your lowest steady heart rate during sleep. It tends to rise after hard training, poor sleep or stress.' },
            { label: 'Sleep contribution', value: `${sleepContribution(day.sleepScore) >= 0 ? '+' : ''}${sleepContribution(day.sleepScore)}`, unit: 'pts', series: last7.map((d) => d.sleepScore), color: 'recovery' as const, body: `How much last night's sleep (score ${day.sleepScore}, ${fmtDuration(day.sleepMin)}) lifted or lowered today's recovery.` },
          ].map((m) => (
            <Card key={m.label} className="p-5 flex flex-col xl:flex-row xl:items-center gap-4">
              <div className="xl:w-40 shrink-0">
                <p className="label">{m.label}</p>
                <p className="metric text-[32px] leading-10">{m.value}<span className="font-sans text-sm font-medium text-ink-3"> {m.unit}</span></p>
                <div className="w-32"><Sparkline values={m.series} color={m.color} /></div>
              </div>
              <p className="text-sm text-ink-2 leading-6">{m.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <div>
              <h2 className="text-[17px] font-semibold">Recovery trend</h2>
              <p className="text-sm text-ink-3">{fmtShortDate(days[0].date)} – {fmtShortDate(days[days.length - 1].date)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Segmented label="Metric" value={metric} onChange={setMetric} size="sm" options={[{ value: 'recovery', label: 'Score' }, { value: 'hrv', label: 'HRV' }, { value: 'rhr', label: 'Resting HR' }]} />
              <Segmented label="Range" value={range} onChange={setRange} size="sm" options={[{ value: '7', label: '7D' }, { value: '30', label: '30D' }, { value: '56', label: '8W' }]} />
            </div>
          </div>
          {loading ? <Skeleton className="h-[280px]" /> : <RecoveryTrend days={days} metric={metric} height={280} />}
        </Card>
        <Card className="p-6">
          <CardHeader title="Seven-day comparison" subtitle="Last 7 days vs the 7 before" />
          <ul className="flex flex-col divide-y divide-line">
            {comp.map((c) => {
              const d = c.now - c.before;
              const good = c.higherIsBetter ? d >= 0 : d <= 0;
              const fmt = (v: number) => (c.unit === 'min' ? fmtDuration(v) : `${Math.round(v * 10) / 10}${c.unit}`);
              return (
                <li key={c.label} className="flex items-center justify-between py-3.5">
                  <div><p className="text-sm text-ink-3">{c.label}</p><p className="metric text-xl">{fmt(c.now)}</p></div>
                  <div className="text-right">
                    <p className={cx('text-sm font-medium flex items-center gap-1 justify-end', good ? 'text-recovery-ink' : 'text-activity-ink')}>
                      {d >= 0 ? <ArrowUpRight size={15} aria-hidden="true" /> : <ArrowDownRight size={15} aria-hidden="true" />}
                      {c.unit === 'min' ? `${Math.round(Math.abs(d))} min` : `${Math.abs(Math.round(d * 10) / 10)}${c.unit}`}
                    </p>
                    <p className="text-xs text-ink-3">was {fmt(c.before)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6">
          <CardHeader title="Recovery distribution" subtitle={`Last ${days.length} days`} />
          {loading ? <LoadingBlock rows={3} /> : <RecoveryDistribution days={days} />}
          <p className="text-sm text-ink-3 mt-5">Most days landing in “Ready” with a few “Steady” days after hard sessions is a typical training pattern.</p>
        </Card>
        <Card className="lg:col-span-2 p-6">
          <CardHeader title="Historical scores" action={
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyRest} onChange={(e) => setOnlyRest(e.target.checked)} className="w-4 h-4 accent-[rgb(var(--ink))]" />After rest days only</label>
          } />
          {rows.length === 0 ? <EmptyState title="No matching days" body="Try clearing the filter." /> : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[520px]">
                <thead><tr className="text-left text-xs text-ink-3"><th className="font-medium px-2 py-2">Date</th><th className="font-medium px-2">Recovery</th><th className="font-medium px-2">HRV</th><th className="font-medium px-2">Resting HR</th><th className="font-medium px-2">Sleep</th><th className="font-medium px-2">Day before</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {rows.map((d) => {
                    const st = recoveryStatus(d.recovery);
                    const before = history[history.indexOf(d) - 1];
                    return (
                      <tr key={d.date}>
                        <td className="px-2 py-2.5 whitespace-nowrap">{fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                        <td className="px-2"><span className="flex items-center gap-2"><span className={cx('w-2 h-2 rounded-full', st.tone === 'recovery' ? 'bg-recovery' : st.tone === 'activity' ? 'bg-activity' : 'bg-sleep')} aria-hidden="true" /><strong>{d.recovery}</strong><span className="text-ink-3 hidden sm:inline">{st.label}</span></span></td>
                        <td className="px-2">{d.hrv} ms</td><td className="px-2">{d.rhr} bpm</td><td className="px-2">{fmtDuration(d.sleepMin)}</td>
                        <td className="px-2 text-ink-3">{before ? (before.isRest ? 'Rest' : before.workouts.find((w) => w.type !== 'walk')?.title ?? 'Light day') : '–'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {table.length > 10 && <button type="button" className="btn btn-sm mt-4" onClick={() => setShowAll((s) => !s)}>{showAll ? 'Show fewer' : `Show all ${table.length} days`}</button>}
        </Card>
      </section>
    </div>
  );
}
