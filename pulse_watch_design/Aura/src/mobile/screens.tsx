import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Footprints, LayoutDashboard, Moon, Play, RotateCcw, Timer } from 'lucide-react';
import { TODAY, allWorkouts, heartRateSeries, sleepStages, stageTotals, suggestedWorkout, today, workoutById } from '../data/mockData';
import { fmtDate, fmtDuration, fmtNumber, fmtPace, fmtShortDate, fmtTime12, recoveryStatus, weekdayShort } from '../lib/format';
import { lastNDays } from '../lib/analytics';
import { useApp } from '../state/AppState';
import { Chip, Metric, Progress, ScoreRing, Segmented, Toggle, WorkoutIcon, cx, workoutTone } from '../components/ui';
import { HeartRateChart, LoadChart, SleepHistory } from '../components/charts';
import { BatteryGauge, DeviceStatus, PlanSessionCard, PlanSessionDialog, SleepTimeline, StageLegend } from '../components/domain';
import { sleepContribution } from '../web/pages/Overview';
import { MHeader } from './MobileShell';

const card = 'bg-card border border-line rounded-lg p-5';

// ---------- Today ----------
export function Today() {
  const { member } = useApp();
  const navigate = useNavigate();
  const status = recoveryStatus(today.recovery);
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 pt-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink-3">{fmtDate(TODAY, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          <Link to="/m/profile" aria-label="Band status and profile"><DeviceStatus compact /></Link>
        </div>
        <h1 className="font-display text-[28px] leading-9 font-semibold tracking-tight">Good morning, {member.firstName}</h1>
      </header>

      <Link to="/m/recovery" className={cx(card, 'flex flex-col gap-4 hover:border-line-strong')} aria-label={`Recovery ${today.recovery}, ${status.label}. Open recovery details`}>
        <div className="flex items-center justify-between"><span className="font-semibold">Recovery</span><ChevronRight size={18} className="text-ink-3" aria-hidden="true" /></div>
        <div className="flex items-center gap-5">
          <ScoreRing value={today.recovery} size={150} stroke={11} tone={status.tone} label="Recovery" valueClass="text-[56px]" />
          <div className="flex flex-col gap-2">
            <span className="font-display text-[26px] font-semibold leading-tight">{status.label}</span>
            <p className="text-sm text-ink-2 leading-5">{status.note}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-line">
          <Metric label="HRV" value={today.hrv} unit="ms" />
          <Metric label="Resting HR" value={today.rhr} unit="bpm" />
          <Metric label="Sleep" value={`${Math.floor(today.sleepMin / 60)}:${String(today.sleepMin % 60).padStart(2, '0')}`} unit="h" />
        </div>
      </Link>

      <section className={cx(card, 'flex flex-col gap-3')} aria-labelledby="ms-h">
        <div className="flex items-center justify-between">
          <span id="ms-h" className="text-sm font-medium text-ink-3">Suggested session</span>
          <span className={cx('w-9 h-9 rounded-[12px] flex items-center justify-center', workoutTone.run)}><WorkoutIcon type="run" size={18} /></span>
        </div>
        <p className="font-display text-[24px] font-semibold leading-8">{suggestedWorkout.title}</p>
        <p className="text-ink-2 leading-6">{suggestedWorkout.message}</p>
        <div className="flex gap-2"><span className="chip"><Timer size={14} aria-hidden="true" />35 min</span><Chip tone="recovery">Low to moderate</Chip></div>
        <button type="button" className="btn-primary h-12 mt-1 w-full" onClick={() => navigate('/m/workout/live')}><Play size={18} aria-hidden="true" />Start workout</button>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/m/sleep" className={cx(card, 'p-4 flex flex-col gap-2 hover:border-line-strong')}>
          <span className="flex items-center gap-1.5 text-sm text-ink-3"><Moon size={15} aria-hidden="true" />Sleep</span>
          <span className="metric text-[26px] leading-8">{fmtDuration(today.sleepMin)}</span>
          <span className="text-sm">Score <strong>{today.sleepScore}</strong></span>
          <Progress value={today.consistency} tone="sleep" label="Sleep consistency" />
          <span className="text-xs text-ink-3">{today.consistency}% consistent</span>
        </Link>
        <Link to="/m/activity" className={cx(card, 'p-4 flex flex-col gap-2 hover:border-line-strong')}>
          <span className="flex items-center gap-1.5 text-sm text-ink-3"><Footprints size={15} aria-hidden="true" />Activity</span>
          <span className="metric text-[26px] leading-8">{today.dailyLoad}<span className="font-sans text-sm text-ink-3 font-medium"> load</span></span>
          <span className="text-sm">Weekly <strong>{today.weeklyLoad}</strong></span>
          <Progress value={today.dailyLoad} tone="activity" label="Today's load" />
          <span className="text-xs text-ink-3">{today.activeMin} active min</span>
        </Link>
      </div>

      <section className="bg-mint text-on-accent rounded-lg p-5" aria-label="Coach insight">
        <p className="text-sm font-medium text-mint-ink">Coach insight</p>
        <p className="font-display text-[19px] leading-7 font-semibold mt-1">{suggestedWorkout.coach}</p>
      </section>
    </div>
  );
}

// ---------- Recovery ----------
export function MRecovery() {
  const week = lastNDays(7);
  const [sel, setSel] = useState(TODAY);
  const d = week.find((x) => x.date === sel)!;
  const status = recoveryStatus(today.recovery);
  return (
    <div className="flex flex-col gap-4">
      <MHeader title="Recovery" />
      <section className={cx(card, 'flex flex-col items-center gap-3 text-center')}>
        <ScoreRing value={today.recovery} size={200} stroke={13} tone={status.tone} label="Recovery" sublabel="of 100" valueClass="text-[72px]" />
        <Chip tone={status.tone}>{status.label}</Chip>
        <p className="text-ink-2">{status.note}</p>
      </section>
      <div className="grid grid-cols-3 gap-3">
        {[['HRV', `${today.hrv}`, 'ms'], ['Resting HR', `${today.rhr}`, 'bpm'], ['Sleep', `+${sleepContribution(today.sleepScore)}`, 'pts']].map(([l, v, u]) => (
          <div key={l} className={cx(card, 'p-4')}><Metric label={l} value={v} unit={u} /></div>
        ))}
      </div>
      <section className={card} aria-labelledby="mr7">
        <h2 id="mr7" className="font-semibold">Last seven days</h2>
        <p className="text-sm text-ink-3 mb-4">Tap a day to see its details</p>
        <div className="grid grid-cols-7 gap-1.5 items-end h-[150px]" role="radiogroup" aria-label="Choose a day">
          {week.map((x) => {
            const on = x.date === sel;
            const st = recoveryStatus(x.recovery);
            return (
              <button key={x.date} type="button" role="radio" aria-checked={on} aria-label={`${fmtDate(x.date, { weekday: 'long' })}, recovery ${x.recovery}`} onClick={() => setSel(x.date)}
                className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className={cx('text-xs font-semibold', !on && 'text-ink-3')}>{x.recovery}</span>
                <span className={cx('w-full rounded-[8px] transition-all', st.tone === 'recovery' ? 'bg-recovery' : st.tone === 'activity' ? 'bg-activity' : 'bg-sleep', !on && 'opacity-40')} style={{ height: `${x.recovery * 0.95}px` }} />
                <span className={cx('text-xs', on ? 'font-semibold' : 'text-ink-3')}>{weekdayShort(x.date).slice(0, 2)}</span>
              </button>
            );
          })}
        </div>
        <dl className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-line text-sm" aria-live="polite">
          <div><dt className="text-ink-3">HRV</dt><dd className="font-semibold">{d.hrv} ms</dd></div>
          <div><dt className="text-ink-3">Resting HR</dt><dd className="font-semibold">{d.rhr} bpm</dd></div>
          <div><dt className="text-ink-3">Sleep</dt><dd className="font-semibold">{fmtDuration(d.sleepMin)}</dd></div>
        </dl>
      </section>
      <section className="bg-sunken rounded-lg p-5">
        <h2 className="font-semibold">How recovery works</h2>
        <p className="text-sm text-ink-2 mt-2 leading-6">Aura compares last night's heart rate variability, resting heart rate and sleep with your own recent baseline. Higher scores suggest you're ready for harder training.</p>
        <p className="text-xs text-ink-3 mt-3">Recovery is a simplified indicator based on example data. It is not a medical assessment.</p>
      </section>
    </div>
  );
}

// ---------- Sleep ----------
export function MSleep() {
  const segs = sleepStages(today);
  const totals = stageTotals(segs);
  return (
    <div className="flex flex-col gap-4">
      <MHeader title="Sleep" />
      <section className={cx(card, 'flex items-center gap-5')}>
        <ScoreRing value={today.sleepScore} size={112} stroke={10} tone="sleep" label="Sleep score" valueClass="text-[38px]" />
        <div><p className="text-sm text-ink-3">Total sleep</p><p className="metric text-[34px] leading-10">{fmtDuration(today.sleepMin)}</p><p className="text-sm text-ink-3">Sleep score {today.sleepScore}</p></div>
      </section>
      <dl className="grid grid-cols-2 gap-3">
        {[['Sleep start', fmtTime12(today.sleepStart)], ['Wake-up', fmtTime12(today.wakeTime)], ['Time awake', `${today.awakeMin} min`], ['Consistency', `${today.consistency}%`]].map(([l, v]) => (
          <div key={l} className={cx(card, 'p-4')}><dt className="label">{l}</dt><dd className="metric text-2xl">{v}</dd></div>
        ))}
      </dl>
      <section className={card}>
        <h2 className="font-semibold mb-4">Sleep timeline</h2>
        <SleepTimeline segments={segs} start={today.sleepStart} end={today.wakeTime} compact />
        <div className="mt-5"><StageLegend totals={totals} /></div>
      </section>
      <section className={card}>
        <h2 className="font-semibold">This week</h2>
        <p className="text-sm text-ink-3 mb-3">Hours asleep each night</p>
        <SleepHistory days={lastNDays(7)} height={190} />
      </section>
    </div>
  );
}

// ---------- Activity ----------
export function MActivity() {
  const { savedWorkouts } = useApp();
  const recent = [...savedWorkouts, ...allWorkouts].slice(0, 6);
  return (
    <div className="flex flex-col gap-4">
      <MHeader title="Activity" back={false} />
      <div className="grid grid-cols-2 gap-3">
        <div className={cx(card, 'p-4')}><Metric label="Daily Load" value={today.dailyLoad} unit="/100" /><Progress value={today.dailyLoad} tone="activity" label="Daily load" className="mt-2" /></div>
        <div className={cx(card, 'p-4')}><Metric label="Weekly Load" value={today.weeklyLoad} unit="/100" /><Progress value={today.weeklyLoad} tone="neutral" label="Weekly load" className="mt-2" /></div>
        <div className={cx(card, 'p-4')}><Metric label="Steps" value={fmtNumber(today.steps)} /></div>
        <div className={cx(card, 'p-4')}><Metric label="Active minutes" value={today.activeMin} unit="min" /></div>
      </div>
      <section className={card}>
        <h2 className="font-semibold">Seven days</h2>
        <p className="text-sm text-ink-3 mb-3">Daily load · tap a bar</p>
        <LoadChart days={lastNDays(7)} height={200} showTrend={false} />
      </section>
      <section className={card}>
        <h2 className="font-semibold mb-1">Recent workouts</h2>
        <ul className="divide-y divide-line">
          {recent.map((w) => (
            <li key={w.id}>
              <Link to={`/m/workout/${w.id}`} className="flex items-center gap-3 py-3">
                <span className={cx('w-10 h-10 rounded-[12px] flex items-center justify-center', workoutTone[w.type])}><WorkoutIcon type={w.type} size={18} /></span>
                <span className="flex-1 min-w-0"><span className="block font-medium truncate">{w.title}</span><span className="block text-sm text-ink-3">{fmtShortDate(w.date)} · {fmtDuration(w.durationMin)}</span></span>
                <span className="text-sm font-semibold">+{w.load}</span>
                <ChevronRight size={16} className="text-ink-3" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function MWorkoutDetail() {
  const { id } = useParams();
  const { savedWorkouts } = useApp();
  const w = savedWorkouts.find((x) => x.id === id) ?? workoutById(id ?? '');
  if (!w) return <div><MHeader title="Workout" /><p className="text-ink-2">We couldn't find that workout.</p></div>;
  return (
    <div className="flex flex-col gap-4">
      <MHeader title={w.title} />
      <p className="text-ink-3 -mt-3">{fmtDate(w.date)} · {fmtTime12(w.startTime)}</p>
      <dl className="grid grid-cols-2 gap-3">
        {[['Duration', fmtDuration(w.durationMin)], ['Distance', w.distanceKm ? `${w.distanceKm.toFixed(2)} km` : '–'], ['Avg HR', `${w.avgHr} bpm`], ['Max HR', `${w.maxHr} bpm`], ['Load', `+${w.load}`], ['Pace', w.paceSecPerKm ? `${fmtPace(w.paceSecPerKm)} /km` : '–']].map(([l, v]) => (
          <div key={l} className={cx(card, 'p-4')}><dt className="label">{l}</dt><dd className="metric text-2xl">{v}</dd></div>
        ))}
      </dl>
      <section className={card}><h2 className="font-semibold mb-3">Heart rate</h2><HeartRateChart points={heartRateSeries(w)} height={180} /></section>
    </div>
  );
}

// ---------- Plan ----------
export function MPlan() {
  const { plan } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [sel, setSel] = useState(plan[0].id);
  const done = plan.filter((p) => p.status === 'completed').length;
  const total = plan.filter((p) => p.type !== 'rest').length;
  return (
    <div className="flex flex-col gap-4">
      <MHeader title="Training plan" back={false} right={<span className="text-sm text-ink-3">{done}/{total} done</span>} />
      <div className="grid grid-cols-7 gap-1" role="tablist" aria-label="Days this week">
        {plan.map((p) => {
          const on = p.id === sel;
          return (
            <button key={p.id} type="button" role="tab" aria-selected={on} onClick={() => { setSel(p.id); document.getElementById(`mp-${p.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
              className={cx('flex flex-col items-center gap-1 py-2 rounded-full', on ? 'bg-ink text-ground' : 'text-ink-2')}>
              <span className="text-[11px] font-medium">{p.weekday.slice(0, 1)}</span>
              <span className="text-[15px] font-semibold">{Number(p.date.slice(-2))}</span>
              <span className={cx('w-1.5 h-1.5 rounded-full', p.type === 'rest' ? 'bg-transparent' : p.status === 'completed' ? 'bg-recovery' : p.status === 'skipped' ? 'bg-line-strong' : on ? 'bg-lime' : 'bg-activity')} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-3">
        {plan.map((p) => <div key={p.id} id={`mp-${p.id}`}><PlanSessionCard s={p} onOpen={() => setOpen(p.id)} /></div>)}
      </div>
      <PlanSessionDialog s={plan.find((p) => p.id === open) ?? null} onClose={() => setOpen(null)} />
    </div>
  );
}

// ---------- Profile ----------
export function Profile() {
  const { member, device, setDevice, theme, setTheme, settings, updateSettings, setOnboarded, toast } = useApp();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <MHeader title="Profile" back={false} />
      <section className={cx(card, 'flex items-center gap-4')}>
        <span className="w-16 h-16 rounded-full bg-mint text-on-accent font-display font-bold text-xl flex items-center justify-center" aria-hidden="true">MO</span>
        <div><p className="font-semibold text-lg">{member.name}</p><p className="text-sm text-ink-3">{member.age} · {member.experience}</p></div>
      </section>
      <section className={card}>
        <h2 className="font-semibold mb-3">Goals and preferences</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-ink-3">Fitness goal</dt><dd className="font-medium text-right">{member.goal}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-ink-3">Activities</dt><dd className="font-medium text-right">{member.preferredActivities.join(', ')}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-ink-3">Training days</dt><dd className="font-medium text-right">{member.trainingDays.map((d) => d.slice(0, 3)).join(', ')}</dd></div>
        </dl>
      </section>
      <section className={card} aria-labelledby="dev-h">
        <div className="flex justify-between items-start">
          <div><h2 id="dev-h" className="font-semibold">AURA Band</h2>
            <p className="text-sm text-ink-3 flex items-center gap-1.5 mt-0.5"><span className={cx('w-2 h-2 rounded-full', device.connected ? 'bg-recovery' : 'bg-line-strong')} aria-hidden="true" />{device.connected ? 'Connected' : 'Disconnected'} · last sync {device.lastSync.toLowerCase()}</p></div>
          <BatteryGauge value={device.battery} />
        </div>
        <div className="flex gap-2 mt-4">
          {device.connected ? (
            <>
              <button type="button" className="btn btn-sm" disabled={syncing} onClick={() => { setSyncing(true); setTimeout(() => { setSyncing(false); setDevice({ lastSync: 'Just now' }); toast('Band synced'); }, 1400); }}>{syncing ? 'Syncing…' : 'Sync now'}</button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setDevice({ connected: false })}>Disconnect</button>
            </>
          ) : <button type="button" className="btn-primary btn-sm" onClick={() => navigate('/m/onboarding?step=5')}>Pair band</button>}
        </div>
      </section>
      <section className={cx(card, 'py-2')}>
        <h2 className="font-semibold pt-3">Notifications</h2>
        <div className="divide-y divide-line">
          <Toggle label="Morning readiness" checked={settings.notifications.morningReadiness} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, morningReadiness: v } })} />
          <Toggle label="Workout reminders" checked={settings.notifications.workoutReminders} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, workoutReminders: v } })} />
          <Toggle label="Weekly summary" checked={settings.notifications.weeklySummary} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, weeklySummary: v } })} />
        </div>
      </section>
      <section className={cx(card, 'flex flex-col gap-4')}>
        <h2 className="font-semibold">Settings</h2>
        <div className="flex items-center justify-between gap-3"><span className="text-[15px] font-medium">Theme</span><Segmented label="Theme" size="sm" value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div>
        <div className="flex items-center justify-between gap-3"><span className="text-[15px] font-medium">Units</span><Segmented label="Units" size="sm" value={settings.units} onChange={(v) => updateSettings({ units: v })} options={[{ value: 'metric', label: 'km' }, { value: 'imperial', label: 'mi' }]} /></div>
        <button type="button" className="btn justify-start" onClick={() => { setOnboarded(false); navigate('/m/onboarding'); }}><RotateCcw size={16} aria-hidden="true" />Replay onboarding</button>
        <Link to="/" className="btn justify-start"><LayoutDashboard size={16} aria-hidden="true" />Open web dashboard</Link>
      </section>
    </div>
  );
}

