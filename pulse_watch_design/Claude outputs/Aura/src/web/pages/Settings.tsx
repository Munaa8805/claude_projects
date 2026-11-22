import { useState, type ReactNode } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useApp } from '../../state/AppState';
import { Card, Dialog, Segmented, Toggle, cx } from '../../components/ui';
import { BatteryGauge, DevicePairing } from '../../components/domain';
import { PageHeader, Avatar } from '../WebLayout';

const sections = [
  ['profile', 'Personal profile'], ['training', 'Training preferences'], ['goals', 'Goals'], ['notifications', 'Notifications'],
  ['device', 'Device'], ['units', 'Units'], ['privacy', 'Privacy'], ['theme', 'Theme'], ['account', 'Account'],
] as const;

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <Card as="section" id={id} aria-labelledby={`${id}-h`} className="p-6 sm:p-8 scroll-mt-24">
      <h2 id={`${id}-h`} className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="text-sm text-ink-3 mt-1">{description}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

const field = 'w-full h-11 rounded-md border border-line-strong bg-card px-3.5 text-[15px] focus:outline-none focus:border-ink';
const ACTIVITIES = ['Running', 'Walking', 'Cycling', 'Strength training', 'Yoga', 'Swimming'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Settings() {
  const { member, updateMember, settings, updateSettings, device, setDevice, theme, setTheme, toast } = useApp();
  const [name, setName] = useState(member.name);
  const [age, setAge] = useState(String(member.age));
  const [syncing, setSyncing] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const ageNum = Number(age);
  const ageError = !Number.isInteger(ageNum) || ageNum < 13 || ageNum > 100 ? 'Enter an age between 13 and 100.' : '';
  const nameError = name.trim().length < 2 ? 'Enter your name.' : '';

  const sync = () => {
    setSyncing(true);
    window.setTimeout(() => { setSyncing(false); setDevice({ lastSync: 'Just now' }); toast('Band synced'); }, 1500);
  };
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" />
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-start">
        <nav aria-label="Settings sections" className="hidden lg:block sticky top-28">
          <ul className="flex flex-col gap-0.5">
            {sections.map(([id, label]) => <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} className="block rounded-full px-4 py-2 text-sm font-medium text-ink-3 hover:text-ink hover:bg-sunken">{label}</a></li>)}
          </ul>
        </nav>

        <div className="flex flex-col gap-5 min-w-0">
          <Section id="profile" title="Personal profile">
            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); if (!nameError && !ageError) { updateMember({ name: name.trim(), firstName: name.trim().split(' ')[0], age: ageNum }); toast('Profile saved'); } }}>
              <div className="flex items-center gap-4"><Avatar size={64} /><div><p className="font-semibold text-lg">{member.name}</p><p className="text-sm text-ink-3">{member.experience}</p></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium block mb-1.5">Full name</label>
                  <input id="name" className={cx(field, nameError && 'border-danger')} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!nameError} aria-describedby="name-err" />
                  {nameError && <p id="name-err" className="text-sm text-danger mt-1">{nameError}</p>}
                </div>
                <div>
                  <label htmlFor="age" className="text-sm font-medium block mb-1.5">Age</label>
                  <input id="age" inputMode="numeric" className={cx(field, ageError && 'border-danger')} value={age} onChange={(e) => setAge(e.target.value)} aria-invalid={!!ageError} aria-describedby="age-err" />
                  {ageError && <p id="age-err" className="text-sm text-danger mt-1">{ageError}</p>}
                </div>
                <div>
                  <label htmlFor="exp" className="text-sm font-medium block mb-1.5">Experience</label>
                  <select id="exp" className={field} value={member.experience} onChange={(e) => updateMember({ experience: e.target.value })}>
                    <option>Beginner</option><option>Intermediate runner</option><option>Advanced runner</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-dark self-start" disabled={!!nameError || !!ageError}>Save profile</button>
            </form>
          </Section>

          <Section id="training" title="Training preferences" description="Aura uses these to shape your weekly plan.">
            <fieldset>
              <legend className="text-sm font-medium mb-2">Preferred activities</legend>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((a) => {
                  const on = member.preferredActivities.includes(a);
                  return <button key={a} type="button" aria-pressed={on} onClick={() => updateMember({ preferredActivities: toggleIn(member.preferredActivities, a) })}
                    className={cx('h-10 px-4 rounded-full border text-sm font-medium', on ? 'bg-ink text-ground border-ink' : 'bg-card border-line-strong')}>{a}</button>;
                })}
              </div>
            </fieldset>
            <fieldset className="mt-6">
              <legend className="text-sm font-medium mb-2">Training days</legend>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const on = member.trainingDays.includes(d);
                  return <button key={d} type="button" aria-pressed={on} aria-label={d} onClick={() => updateMember({ trainingDays: toggleIn(member.trainingDays, d) })}
                    className={cx('w-12 h-12 rounded-full border text-sm font-semibold', on ? 'bg-lime text-on-accent border-lime' : 'bg-card border-line-strong text-ink-3')}>{d.slice(0, 2)}</button>;
                })}
              </div>
            </fieldset>
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Preferred time</p>
              <Segmented label="Preferred training time" value={settings.preferredTime} onChange={(v) => updateSettings({ preferredTime: v })}
                options={[{ value: 'Morning', label: 'Morning' }, { value: 'Lunchtime', label: 'Lunchtime' }, { value: 'Evening', label: 'Evening' }]} />
            </div>
          </Section>

          <Section id="goals" title="Goals">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="goal" className="text-sm font-medium block mb-1.5">Main goal</label>
                <select id="goal" className={field} value={member.goal} onChange={(e) => updateMember({ goal: e.target.value })}>
                  <option>Prepare for a half marathon</option><option>Improve fitness</option><option>Improve consistency</option><option>Improve sleep habits</option><option>Stay active</option>
                </select>
              </div>
              <div>
                <label htmlFor="race" className="text-sm font-medium block mb-1.5">Race date</label>
                <input id="race" type="date" className={field} value={settings.raceDate} onChange={(e) => updateSettings({ raceDate: e.target.value })} />
              </div>
              <div>
                <span className="text-sm font-medium block mb-1.5" id="wg">Sessions per week</span>
                <div className="flex items-center gap-2" role="group" aria-labelledby="wg">
                  <button type="button" className="icon-btn" aria-label="Fewer sessions" onClick={() => updateSettings({ weeklyGoal: Math.max(1, settings.weeklyGoal - 1) })}>−</button>
                  <span className="metric text-2xl w-10 text-center" aria-live="polite">{settings.weeklyGoal}</span>
                  <button type="button" className="icon-btn" aria-label="More sessions" onClick={() => updateSettings({ weeklyGoal: Math.min(7, settings.weeklyGoal + 1) })}>+</button>
                </div>
              </div>
            </div>
          </Section>

          <Section id="notifications" title="Notifications">
            <div className="divide-y divide-line">
              <Toggle label="Morning readiness" description="Your recovery score when you wake up" checked={settings.notifications.morningReadiness} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, morningReadiness: v } })} />
              <Toggle label="Workout reminders" description="A nudge before planned sessions" checked={settings.notifications.workoutReminders} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, workoutReminders: v } })} />
              <Toggle label="Weekly summary" description="Every Monday morning" checked={settings.notifications.weeklySummary} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, weeklySummary: v } })} />
              <Toggle label="Bedtime reminder" description={`30 minutes before ${settings.bedtimeTarget}`} checked={settings.notifications.bedtime} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, bedtime: v } })} />
              <Toggle label="Low battery" description="When your band drops below 20%" checked={settings.notifications.batteryLow} onChange={(v) => updateSettings({ notifications: { ...settings.notifications, batteryLow: v } })} />
            </div>
          </Section>

          <Section id="device" title="Device management" description="Connection and syncing are simulated in this prototype.">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-[24px] bg-[#DCCBAE] flex items-center justify-center" aria-hidden="true">
                  <div className="w-9 h-12 rounded-[14px] bg-[#C8B596] border border-black/10" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{device.name}</p>
                  <p className="text-sm text-ink-3">{device.colour} · Firmware {device.firmware} · {device.serial}</p>
                  <p className="text-sm mt-1 flex items-center gap-2" role="status">
                    <span className={cx('w-2 h-2 rounded-full', device.connected ? 'bg-recovery' : 'bg-line-strong')} aria-hidden="true" />
                    {device.connected ? `Connected · last sync ${device.lastSync.toLowerCase()}` : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div><p className="label mb-1">Band battery</p><BatteryGauge value={device.battery} /></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {device.connected ? (
                <>
                  <button type="button" className="btn" onClick={sync} disabled={syncing}>{syncing ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />}{syncing ? 'Syncing…' : 'Sync now'}</button>
                  <button type="button" className="btn-ghost" onClick={() => { setDevice({ connected: false }); toast('Band disconnected'); }}>Disconnect</button>
                </>
              ) : (
                <button type="button" className="btn-primary" onClick={() => setPairOpen(true)}>Reconnect band</button>
              )}
            </div>
          </Section>

          <Section id="units" title="Units">
            <Segmented label="Units" value={settings.units} onChange={(v) => { updateSettings({ units: v }); toast(v === 'metric' ? 'Using kilometres and kilograms' : 'Using miles and pounds'); }}
              options={[{ value: 'metric', label: 'Metric (km, kg)' }, { value: 'imperial', label: 'Imperial (mi, lb)' }]} />
          </Section>

          <Section id="privacy" title="Privacy">
            <div className="divide-y divide-line">
              <Toggle label="Share anonymised data for research" checked={settings.privacy.shareAnonymised} onChange={(v) => updateSettings({ privacy: { ...settings.privacy, shareAnonymised: v } })} />
              <Toggle label="Let my coach see my profile" checked={settings.privacy.showProfileToCoach} onChange={(v) => updateSettings({ privacy: { ...settings.privacy, showProfileToCoach: v } })} />
            </div>
            <button type="button" className="btn mt-4" onClick={() => toast('Your export is being prepared (demo)')}>Export my data</button>
          </Section>

          <Section id="theme" title="Theme">
            <Segmented label="Theme" value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
          </Section>

          <Section id="account" title="Account">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-ink-3">Email</dt><dd className="font-medium">maya.okoro@example.com</dd></div>
              <div><dt className="text-ink-3">Membership</dt><dd className="font-medium">Aura Plus · renews 2 Feb 2027</dd></div>
            </dl>
            <div className="flex flex-wrap gap-2 mt-5">
              <button type="button" className="btn" onClick={() => toast('Signed out (demo)')}>Sign out</button>
              <button type="button" className="btn-ghost text-danger" onClick={() => setDeleteOpen(true)}>Delete account</button>
            </div>
          </Section>
        </div>
      </div>

      <Dialog open={pairOpen} onClose={() => setPairOpen(false)} title="Reconnect your band">
        <DevicePairing onDone={() => { setPairOpen(false); toast('Band connected'); }} />
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account?">
        <p className="text-ink-2">This would permanently remove your profile and history. In this prototype nothing is deleted.</p>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" className="btn" onClick={() => setDeleteOpen(false)}>Cancel</button>
          <button type="button" className="btn bg-danger border-danger text-white hover:bg-danger hover:opacity-90" onClick={() => { setDeleteOpen(false); toast('Nothing was deleted (demo)'); }}>Delete</button>
        </div>
      </Dialog>
    </div>
  );
}
