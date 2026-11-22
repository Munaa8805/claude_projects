import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Footprints, Play, Timer } from 'lucide-react';
import { TODAY, dayByDate, history, sleepStages, stageTotals, suggestedWorkout } from '../../data/mockData';
import { diffLabel, fmtDate, fmtDuration, fmtNumber, recoveryStatus } from '../../lib/format';
import { lastNDays, weeks } from '../../lib/analytics';
import { useApp, useSimulatedLoad } from '../../state/AppState';
import { Card, CardHeader, Chip, LoadingBlock, Metric, Progress, ScoreRing, Segmented, Skeleton, WorkoutIcon, cx, workoutTone } from '../../components/ui';
import { LoadChart, WeeklyTotals } from '../../components/charts';
import { WorkoutRow } from '../../components/domain';

export function sleepContribution(score: number) {
  return Math.round((score - 70) / 2);
}

export default function Overview() {
  const { selectedDate, setSelectedDate, member } = useApp();
  const loading = useSimulatedLoad(selectedDate);
  const day = dayByDate(selectedDate)!;
  const idx = history.findIndex((d) => d.date === selectedDate);
  const prev = history[Math.max(0, idx - 1)];
  const isToday = selectedDate === TODAY;
  const status = recoveryStatus(day.recovery);
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const week = lastNDays(7, selectedDate);
  const prevWeek = lastNDays(7, history[Math.max(0, idx - 7)].date);
  const weekLoad = week.reduce((a, d) => a + d.dailyLoad, 0);
  const prevWeekLoad = prevWeek.reduce((a, d) => a + d.dailyLoad, 0);
  const trend = Math.round(((weekLoad - prevWeekLoad) / prevWeekLoad) * 100);
  const recent = history.slice(0, idx + 1).flatMap((d) => d.workouts).reverse().slice(0, 5);
  const totals = stageTotals(sleepStages(day));
  const nightTotal = totals.Awake + totals.Light + totals.Deep + totals.REM;
  const navigate = useNavigate();
  const hrvD = diffLabel(day.hrv, prev.hrv, ' ms');
  const rhrD = diffLabel(day.rhr, prev.rhr, ' bpm', true);
  const recD = diffLabel(day.recovery, prev.recovery);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-ink-3">{fmtDate(selectedDate)}</p>
          <h1 className="font-display text-[30px] sm:text-[40px] leading-tight font-semibold tracking-tight">
            {isToday ? `Good morning, ${member.firstName}.` : `Your day, ${fmtDate(selectedDate, { day: 'numeric', month: 'long' })}`}
          </h1>
        </div>
        {!isToday && <button type="button" className="btn btn-sm" onClick={() => setSelectedDate(TODAY)}>Back to today</button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recovery: the hero */}
        <Card className="lg:col-span-7 p-6 sm:p-8" aria-labelledby="rec-h">
          <div className="flex items-center justify-between mb-2">
            <h2 id="rec-h" className="text-[17px] font-semibold">Recovery</h2>
            <Link to="/recovery" className="text-sm font-medium flex items-center gap-1 hover:underline underline-offset-4">Details<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {loading ? (
            <div className="flex flex-col sm:flex-row gap-8 items-center py-4"><Skeleton className="w-[220px] h-[220px] rounded-full" /><LoadingBlock rows={4} className="flex-1 w-full" /></div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center">
              <ScoreRing value={day.recovery} size={228} stroke={12} tone={status.tone} label="Recovery score" sublabel="of 100" valueClass="text-[76px]" />
              <div className="flex-1 w-full flex flex-col gap-5">
                <div>
                  <Chip tone={status.tone}>{status.label}</Chip>
                  <p className="mt-3 text-lg leading-7 text-ink-2">{status.note}</p>
                  <p className={cx('text-sm mt-1 flex items-center gap-1', recD.dir > 0 ? 'text-recovery-ink' : recD.dir < 0 ? 'text-activity-ink' : 'text-ink-3')}>
                    {recD.dir > 0 ? <ArrowUpRight size={15} aria-hidden="true" /> : recD.dir < 0 ? <ArrowDownRight size={15} aria-hidden="true" /> : null}{recD.text}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-5 border-t border-line">
                  <Metric label="HRV" value={day.hrv} unit="ms" foot={hrvD.text.replace(' vs yesterday', '')} footTone={hrvD.dir > 0 ? 'up' : hrvD.dir < 0 ? 'down' : 'none'} />
                  <Metric label="Resting HR" value={day.rhr} unit="bpm" foot={rhrD.text.replace(' vs yesterday', '')} footTone={rhrD.dir > 0 ? 'up' : rhrD.dir < 0 ? 'down' : 'none'} />
                  <Metric label="Sleep contribution" value={`${sleepContribution(day.sleepScore) >= 0 ? '+' : ''}${sleepContribution(day.sleepScore)}`} unit="pts" foot={`Sleep score ${day.sleepScore}`} />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Suggested training */}
        <Card className="lg:col-span-5 p-6 sm:p-8 flex flex-col" aria-labelledby="sug-h">
          {isToday ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 id="sug-h" className="text-[17px] font-semibold">Suggested training</h2>
                <span className={cx('w-11 h-11 rounded-[14px] flex items-center justify-center', workoutTone.run)}><WorkoutIcon type="run" /></span>
              </div>
              <p className="font-display text-[28px] leading-9 font-semibold tracking-tight">{suggestedWorkout.title}</p>
              <p className="text-ink-2 mt-2 text-[17px] leading-7">{suggestedWorkout.message}</p>
              <dl className="grid grid-cols-3 gap-3 my-6">
                <div className="bg-sunken rounded-md p-3"><dt className="label">Type</dt><dd className="font-semibold mt-0.5">Running</dd></div>
                <div className="bg-sunken rounded-md p-3"><dt className="label">Duration</dt><dd className="font-semibold mt-0.5">{suggestedWorkout.durationMin} min</dd></div>
                <div className="bg-sunken rounded-md p-3"><dt className="label">Intensity</dt><dd className="font-semibold mt-0.5">Low–mod</dd></div>
              </dl>
              <div className="mt-auto flex flex-wrap items-center gap-3">
                <button type="button" className="btn-primary" onClick={() => navigate('/m/workout/live')}><Play size={17} aria-hidden="true" />Start workout</button>
                <Link to="/plan" className="btn-ghost underline underline-offset-4">View training plan</Link>
              </div>
            </>
          ) : (
            <>
              <CardHeader title="Training on this day" id="sug-h" />
              {day.workouts.length ? day.workouts.map((w) => <WorkoutRow key={w.id} w={w} to={`/workouts/${w.id}`} />) : (
                <p className="text-ink-2">A rest day. Recovery the next morning was {history[idx + 1]?.recovery ?? '–'}.</p>
              )}
            </>
          )}
        </Card>

        {/* Weekly load */}
        <Card className="lg:col-span-8 p-6" aria-labelledby="load-h">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 id="load-h" className="text-[17px] font-semibold">{view === 'daily' ? 'Weekly load' : 'Load by week'}</h2>
              <p className={cx('text-sm flex items-center gap-1 mt-0.5', trend >= 0 ? 'text-activity-ink' : 'text-recovery-ink')}>
                {trend >= 0 ? <ArrowUpRight size={15} aria-hidden="true" /> : <ArrowDownRight size={15} aria-hidden="true" />}
                {Math.abs(trend)}% {trend >= 0 ? 'more' : 'less'} load than the previous 7 days
              </p>
            </div>
            <Segmented label="Chart view" value={view} onChange={setView} size="sm" options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }]} />
          </div>
          {loading ? <Skeleton className="h-[240px]" /> : view === 'daily' ? <LoadChart days={week} /> : <WeeklyTotals weeks={weeks().map((w) => ({ label: w.label, load: w.load, sessions: w.sessions, minutes: w.minutes, current: w.current }))} height={240} />}
          {view === 'daily' && (
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-ink-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-activity" aria-hidden="true" />Workout day</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-activity-light" aria-hidden="true" />Rest day</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px] bg-ink" aria-hidden="true" />{isToday ? 'Today' : 'Selected day'}</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-ink-3" aria-hidden="true" />Weekly load</span>
            </div>
          )}
        </Card>

        {/* Sleep */}
        <Card className="lg:col-span-4 p-6 flex flex-col gap-5" aria-labelledby="sleep-h">
          <div className="flex items-center justify-between">
            <h2 id="sleep-h" className="text-[17px] font-semibold">Sleep</h2>
            <Link to="/sleep" className="text-sm font-medium flex items-center gap-1 hover:underline underline-offset-4">Details<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {loading ? <LoadingBlock rows={4} /> : (
            <>
              <div className="flex items-center gap-5">
                <ScoreRing value={day.sleepScore} size={104} stroke={9} tone="sleep" label="Sleep score" valueClass="text-[34px]" />
                <div>
                  <p className="label">Total sleep</p>
                  <p className="metric text-[32px] leading-10">{fmtDuration(day.sleepMin)}</p>
                  <p className="text-sm text-ink-3">Score {day.sleepScore} of 100</p>
                </div>
              </div>
              <div>
                <div className="flex h-3 rounded-full overflow-hidden gap-[2px]" role="img" aria-label={`Awake ${totals.Awake} minutes, light ${totals.Light}, deep ${totals.Deep}, REM ${totals.REM}`}>
                  <div className="bg-line-strong" style={{ width: `${(totals.Awake / nightTotal) * 100}%` }} />
                  <div className="bg-sleep-light" style={{ width: `${(totals.Light / nightTotal) * 100}%` }} />
                  <div className="bg-sleep-deep" style={{ width: `${(totals.Deep / nightTotal) * 100}%` }} />
                  <div className="bg-sleep" style={{ width: `${(totals.REM / nightTotal) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-ink-3 mt-1.5"><span>Awake · Light · Deep · REM</span><span>{fmtDuration(nightTotal)} in bed</span></div>
              </div>
              <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-line">
                <div><dt className="label">Consistency</dt><dd className="metric text-2xl">{day.consistency}%</dd></div>
                <div><dt className="label">Time awake</dt><dd className="metric text-2xl">{day.awakeMin}<span className="font-sans text-sm font-medium text-ink-3"> min</span></dd></div>
              </dl>
            </>
          )}
        </Card>

        {/* Activity */}
        <Card className="lg:col-span-4 p-6 flex flex-col gap-5" aria-labelledby="act-h">
          <div className="flex items-center justify-between">
            <h2 id="act-h" className="text-[17px] font-semibold">Activity</h2>
            <Link to="/activity" className="text-sm font-medium flex items-center gap-1 hover:underline underline-offset-4">Details<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          {loading ? <LoadingBlock rows={5} /> : (
            <>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-baseline mb-1.5"><span className="text-sm font-medium">{isToday ? "Today's Load" : 'Daily Load'}</span><span className="metric text-2xl">{day.dailyLoad}<span className="font-sans text-sm text-ink-3 font-medium">/100</span></span></div>
                  <Progress value={day.dailyLoad} tone="activity" label="Daily load" />
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1.5"><span className="text-sm font-medium">Weekly Load</span><span className="metric text-2xl">{day.weeklyLoad}<span className="font-sans text-sm text-ink-3 font-medium">/100</span></span></div>
                  <Progress value={day.weeklyLoad} tone="neutral" label="Weekly load" />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-line">
                <div><dt className="label flex items-center gap-1"><Timer size={13} aria-hidden="true" />Active minutes</dt><dd className="metric text-2xl">{day.activeMin}</dd></div>
                <div><dt className="label flex items-center gap-1"><Footprints size={13} aria-hidden="true" />Steps</dt><dd className="metric text-2xl">{fmtNumber(day.steps)}</dd></div>
              </dl>
              {day.workouts[0] && (
                <Link to={`/workouts/${day.workouts[0].id}`} className="flex items-center gap-3 bg-sunken rounded-md p-3 hover:bg-line">
                  <span className={cx('w-9 h-9 rounded-[12px] flex items-center justify-center', workoutTone[day.workouts[0].type])}><WorkoutIcon type={day.workouts[0].type} size={18} /></span>
                  <span className="flex-1 min-w-0"><span className="block text-sm font-medium truncate">{day.workouts[0].title}</span><span className="block text-xs text-ink-3">Recent activity · {fmtDuration(day.workouts[0].durationMin)}</span></span>
                  <ArrowRight size={16} aria-hidden="true" className="text-ink-3" />
                </Link>
              )}
            </>
          )}
        </Card>

        {/* Recent workouts */}
        <Card className="lg:col-span-8 p-6" aria-labelledby="recent-h">
          <CardHeader title="Recent workouts" id="recent-h" action={<Link to="/workouts" className="text-sm font-medium flex items-center gap-1 hover:underline underline-offset-4">All workouts<ArrowRight size={15} aria-hidden="true" /></Link>} />
          <div className="hidden sm:grid grid-cols-[1fr_auto_56px] gap-4 px-2 pb-2 text-xs text-ink-3 border-b border-line" aria-hidden="true"><span>Workout</span><span>Heart rate</span><span className="text-right">Load</span></div>
          {loading ? <LoadingBlock rows={5} className="pt-3" /> : <div className="divide-y divide-line">{recent.map((w) => <WorkoutRow key={w.id} w={w} to={`/workouts/${w.id}`} />)}</div>}
        </Card>
      </div>
    </div>
  );
}
