import { useState } from 'react';
import { BedDouble, Clock, Moon, Sunrise } from 'lucide-react';
import { history, sleepStages, stageTotals } from '../../data/mockData';
import { fmtDate, fmtDuration, fmtTime12, mean, stdev } from '../../lib/format';
import { lastNDays } from '../../lib/analytics';
import { useApp, useSimulatedLoad } from '../../state/AppState';
import { Card, CardHeader, LoadingBlock, Progress, ScoreRing, Segmented, Skeleton } from '../../components/ui';
import { SleepHistory, SleepWindowChart } from '../../components/charts';
import { SleepTimeline, StageLegend } from '../../components/domain';
import { PageHeader } from '../WebLayout';

const TARGET = 450;

export default function Sleep() {
  const { selectedDate, settings } = useApp();
  const [range, setRange] = useState<'7' | '14'>('14');
  const loading = useSimulatedLoad(`${selectedDate}-${range}`);
  const day = history.find((d) => d.date === selectedDate)!;
  const segs = sleepStages(day);
  const totals = stageTotals(segs);
  const nights = lastNDays(+range, selectedDate);
  const week = lastNDays(7, selectedDate);
  const bedMins = week.map((d) => { const [h, m] = d.sleepStart.split(':').map(Number); return h < 12 ? h * 60 + m + 1440 : h * 60 + m; });
  const avgBed = Math.round(mean(bedMins));
  const avgBedStr = `${String(Math.floor(avgBed / 60) % 24).padStart(2, '0')}:${String(avgBed % 60).padStart(2, '0')}`;
  const bedSpread = Math.round(stdev(bedMins));
  const onTarget = week.filter((d) => d.sleepMin >= TARGET).length;

  const stats = [
    { icon: Clock, label: 'Total sleep', value: fmtDuration(day.sleepMin) },
    { icon: Moon, label: 'Fell asleep', value: fmtTime12(day.sleepStart) },
    { icon: Sunrise, label: 'Woke up', value: fmtTime12(day.wakeTime) },
    { icon: BedDouble, label: 'Time awake', value: `${day.awakeMin} min` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sleep" subtitle={`Night ending ${fmtDate(selectedDate)}`} />

      <Card className="p-6 sm:p-8">
        {loading ? <div className="flex gap-8 items-center"><Skeleton className="w-[150px] h-[150px] rounded-full" /><LoadingBlock rows={3} className="flex-1" /></div> : (
          <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
            <div className="flex items-center gap-6">
              <ScoreRing value={day.sleepScore} size={156} stroke={11} tone="sleep" label="Sleep score" sublabel="Sleep score" valueClass="text-[52px]" />
              <div className="lg:hidden">
                <p className="metric text-4xl">{fmtDuration(day.sleepMin)}</p>
                <p className="text-ink-3">{Math.round((day.sleepMin / TARGET) * 100)}% of your {fmtDuration(TARGET)} target</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="label flex items-center gap-1.5"><Icon size={14} aria-hidden="true" />{label}</dt>
                  <dd className="metric text-[28px] leading-9">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="lg:w-56 bg-sleep-soft rounded-md p-4">
              <p className="text-sm text-sleep-ink font-medium">Sleep consistency</p>
              <p className="metric text-3xl my-1">{day.consistency}%</p>
              <Progress value={day.consistency} tone="sleep" label="Sleep consistency" />
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <CardHeader title="Sleep timeline" subtitle="Hover a block to see the stage and time" />
        {loading ? <Skeleton className="h-[130px]" /> : (
          <>
            <SleepTimeline segments={segs} start={day.sleepStart} end={day.wakeTime} />
            <div className="mt-6 pt-5 border-t border-line"><StageLegend totals={totals} /></div>
          </>
        )}
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-wrap justify-between gap-3 mb-4">
            <div><h2 className="text-[17px] font-semibold">Sleep duration history</h2><p className="text-sm text-ink-3">Last {range} nights · darker bars met your 7h 30m target (dashed line)</p></div>
            <Segmented label="Range" value={range} onChange={setRange} size="sm" options={[{ value: '7', label: '7 nights' }, { value: '14', label: '14 nights' }]} />
          </div>
          {loading ? <Skeleton className="h-[260px]" /> : <SleepHistory days={nights} height={260} target={TARGET} />}
        </Card>
        <Card className="p-6 flex flex-col">
          <CardHeader title="This week" subtitle="Weekly sleep summary" />
          <dl className="grid grid-cols-2 gap-5">
            <div><dt className="label">Average sleep</dt><dd className="metric text-2xl">{fmtDuration(mean(week.map((d) => d.sleepMin)))}</dd></div>
            <div><dt className="label">Average score</dt><dd className="metric text-2xl">{Math.round(mean(week.map((d) => d.sleepScore)))}</dd></div>
            <div><dt className="label">Nights on target</dt><dd className="metric text-2xl">{onTarget}<span className="font-sans text-sm text-ink-3 font-medium"> of 7</span></dd></div>
            <div><dt className="label">Average bedtime</dt><dd className="metric text-2xl">{fmtTime12(avgBedStr)}</dd></div>
          </dl>
          <p className="text-sm text-ink-2 mt-6 bg-sunken rounded-md p-4">
            Your bedtime moved by about {bedSpread} minutes night to night. Your bedtime goal is {fmtTime12(settings.bedtimeTarget)}.
          </p>
        </Card>
      </section>

      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 items-center">
          <div>
            <h2 className="text-[17px] font-semibold">Sleep consistency</h2>
            <p className="text-ink-2 mt-2 leading-7">Consistency compares when you fall asleep and wake up with your usual pattern. Going to bed and waking at similar times each day tends to make sleep feel more predictable.</p>
            <p className="text-sm text-ink-3 mt-3">Each bar shows one night, from falling asleep (top) to waking (bottom).</p>
          </div>
          {loading ? <Skeleton className="h-[220px]" /> : <SleepWindowChart days={week} height={220} />}
        </div>
      </Card>
    </div>
  );
}
