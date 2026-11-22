import { useState } from 'react';
import { Flag, Target } from 'lucide-react';
import { TODAY, parseDate } from '../../data/mockData';
import { fmtDate, fmtDuration } from '../../lib/format';
import { useApp } from '../../state/AppState';
import { Card, CardHeader, Progress } from '../../components/ui';
import { PlanSessionCard, PlanSessionDialog } from '../../components/domain';
import { PageHeader } from '../WebLayout';

export function usePlanSummary() {
  const { plan, settings } = useApp();
  const sessions = plan.filter((s) => s.type !== 'rest');
  const active = sessions.filter((s) => s.status !== 'skipped');
  const done = sessions.filter((s) => s.status === 'completed');
  const minutes = active.reduce((a, s) => a + s.durationMin, 0);
  const doneMin = done.reduce((a, s) => a + s.durationMin, 0);
  const weeksToRace = Math.round((parseDate(settings.raceDate).getTime() - parseDate(TODAY).getTime()) / (7 * 864e5));
  const mix = {
    Low: active.filter((s) => s.intensity === 'Low' || s.intensity === 'Low to moderate').reduce((a, s) => a + s.durationMin, 0),
    Moderate: active.filter((s) => s.intensity === 'Moderate').reduce((a, s) => a + s.durationMin, 0),
    High: active.filter((s) => s.intensity === 'High').reduce((a, s) => a + s.durationMin, 0),
  };
  return { sessions, active, done, minutes, doneMin, weeksToRace, mix, adjusted: plan.filter((s) => s.adjusted).length, skipped: sessions.length - active.length };
}

export default function Plan() {
  const { plan, member, settings } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const s = usePlanSummary();
  const mixTotal = s.mix.Low + s.mix.Moderate + s.mix.High || 1;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Training plan" subtitle={`Week of ${fmtDate(TODAY, { day: 'numeric', month: 'long' })} · built around ${member.trainingDays.length} training days`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-3">
        {plan.map((p) => <PlanSessionCard key={p.id} s={p} onOpen={() => setOpen(p.id)} />)}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Weekly summary" subtitle={`${s.done.length} of ${s.active.length} sessions done${s.skipped ? ` · ${s.skipped} skipped` : ''}${s.adjusted ? ` · ${s.adjusted} adjusted` : ''}`} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="label">Planned training</p>
              <p className="metric text-3xl">{fmtDuration(s.minutes)}</p>
              <Progress value={(s.doneMin / (s.minutes || 1)) * 100} tone="recovery" label="Training completed" className="mt-3" />
              <p className="text-xs text-ink-3 mt-1.5">{fmtDuration(s.doneMin)} completed</p>
            </div>
            <div className="sm:col-span-2">
              <p className="label mb-2">Intensity mix</p>
              <div className="flex h-4 rounded-full overflow-hidden gap-[2px]" role="img" aria-label={`Low ${s.mix.Low} minutes, moderate ${s.mix.Moderate}, high ${s.mix.High}`}>
                <div className="bg-recovery" style={{ width: `${(s.mix.Low / mixTotal) * 100}%` }} />
                <div className="bg-activity-light" style={{ width: `${(s.mix.Moderate / mixTotal) * 100}%` }} />
                <div className="bg-activity" style={{ width: `${(s.mix.High / mixTotal) * 100}%` }} />
              </div>
              <dl className="grid grid-cols-3 gap-3 mt-3 text-sm">
                <div><dt className="text-ink-3">Low</dt><dd className="font-semibold">{s.mix.Low} min</dd></div>
                <div><dt className="text-ink-3">Moderate</dt><dd className="font-semibold">{s.mix.Moderate} min</dd></div>
                <div><dt className="text-ink-3">High</dt><dd className="font-semibold">{s.mix.High} min</dd></div>
              </dl>
              <p className="text-sm text-ink-2 mt-4">Most of this week is easy aerobic work, with one tempo run and one long run to build toward race pace.</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Training goals" />
          <ul className="flex flex-col gap-4">
            <li className="flex gap-3"><span className="w-10 h-10 rounded-[12px] bg-lime text-on-accent flex items-center justify-center shrink-0"><Flag size={18} aria-hidden="true" /></span>
              <div><p className="font-medium">{member.goal}</p><p className="text-sm text-ink-3">Race day {fmtDate(settings.raceDate, { day: 'numeric', month: 'long', year: 'numeric' })} · {s.weeksToRace} weeks to go</p></div></li>
            <li className="flex gap-3"><span className="w-10 h-10 rounded-[12px] bg-sunken flex items-center justify-center shrink-0"><Target size={18} aria-hidden="true" /></span>
              <div><p className="font-medium">{settings.weeklyGoal} sessions a week</p><p className="text-sm text-ink-3">Build consistency before adding volume</p></div></li>
            <li className="flex gap-3"><span className="w-10 h-10 rounded-[12px] bg-sunken flex items-center justify-center shrink-0"><Target size={18} aria-hidden="true" /></span>
              <div><p className="font-medium">Long run to 90 minutes</p><p className="text-sm text-ink-3">Currently 60 minutes, adding about 5 a week</p></div></li>
          </ul>
        </Card>
      </section>
      <PlanSessionDialog s={plan.find((p) => p.id === open) ?? null} onClose={() => setOpen(null)} />
    </div>
  );
}
