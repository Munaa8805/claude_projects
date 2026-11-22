/**
 * Shared fictional data for every Aura screen (web and mobile).
 *
 * Everything here is illustrative product-design data for a fictional member.
 * It is generated deterministically from a fixed seed, so every page, chart
 * and insight reads from the same eight weeks of history.
 */
import type { DayRecord, Device, Intensity, Member, PlanSession, SleepSegment, Workout, WorkoutType } from './types';

/** The demo "today": a Monday, so the plan's first session is today's suggestion. */
export const TODAY = '2026-11-16';
export const HISTORY_DAYS = 56;

export const member: Member = {
  name: 'Maya Okoro',
  firstName: 'Maya',
  age: 34,
  goal: 'Prepare for a half marathon',
  experience: 'Intermediate runner',
  preferredActivities: ['Running', 'Walking', 'Strength training'],
  trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday', 'Sunday'],
  heightCm: 168,
  weightKg: 61,
  maxHr: 188,
};

export const device: Device = {
  name: 'AURA Band',
  serial: 'AB-7F2C-0934',
  colour: 'Soft sand',
  connected: true,
  battery: 78,
  lastSync: 'Today, 7:12 am',
  firmware: '2.4.1',
};

export const suggestedWorkout = {
  title: 'Easy aerobic run',
  type: 'run' as WorkoutType,
  durationMin: 35,
  intensity: 'Low to moderate' as Intensity,
  message: '35 minutes at a comfortable pace. Keep your effort relaxed today.',
  coach: "You're building consistency. Keep today's session relaxed and focus on steady effort.",
  hrZone: '128–145 bpm',
};

// ---------- helpers ----------
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round = Math.round;

export function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}
export function isoDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function addDays(iso: string, n: number) {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}
function hhmm(totalMin: number) {
  const m = ((round(totalMin) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// ---------- the eight-week story ----------
// Weekly pattern: Mon easy run · Tue strength · Wed recovery walk · Thu quality run ·
// Fri rest · Sat long run · Sun mobility or easy ride. Long runs build gradually.
// Heavy weekend: Sat 24 Oct (long run) + Sun 25 Oct (long ride). The week after
// is lighter: shorter, easier sessions and two extra rest days.
const HEAVY_SAT = '2026-10-24';
const HEAVY_SUN = '2026-10-25';
const LIGHT_WEEK_START = '2026-10-26';
const LIGHT_WEEK_END = '2026-11-01';

interface Spec { type: WorkoutType; title: string; dur: number; intensity: Intensity; start: number }

function sessionFor(date: string, weekIndex: number, rnd: () => number): Spec | null {
  const wd = parseDate(date).getDay();
  if (date === HEAVY_SAT) return { type: 'run', title: 'Long run', dur: 98, intensity: 'High', start: 8 * 60 + 10 };
  if (date === HEAVY_SUN) return { type: 'cycle', title: 'Long ride', dur: 125, intensity: 'Moderate', start: 9 * 60 };
  if (date >= LIGHT_WEEK_START && date <= LIGHT_WEEK_END) {
    switch (wd) {
      case 2: return { type: 'walk', title: 'Recovery walk', dur: 30, intensity: 'Low', start: 12 * 60 + 15 };
      case 4: return { type: 'run', title: 'Easy run', dur: 25, intensity: 'Low', start: 7 * 60 };
      case 6: return { type: 'run', title: 'Easy run', dur: 40, intensity: 'Low to moderate', start: 8 * 60 + 30 };
      case 0: return { type: 'mobility', title: 'Mobility', dur: 20, intensity: 'Low', start: 18 * 60 };
      default: return null; // Mon, Wed, Fri: rest
    }
  }
  const jitter = (n: number) => round(n + (rnd() - 0.5) * 6);
  switch (wd) {
    case 1: return { type: 'run', title: 'Easy run', dur: jitter(34), intensity: 'Low to moderate', start: 6 * 60 + 40 };
    case 2: return { type: 'strength', title: 'Strength training', dur: jitter(30), intensity: 'Moderate', start: 18 * 60 + 5 };
    case 3: return rnd() < 0.8 ? { type: 'walk', title: 'Recovery walk', dur: jitter(26), intensity: 'Low', start: 12 * 60 + 20 } : null;
    case 4: return weekIndex % 2 === 0
      ? { type: 'run', title: 'Tempo run', dur: jitter(40), intensity: 'High', start: 6 * 60 + 35 }
      : { type: 'run', title: 'Interval run', dur: jitter(38), intensity: 'High', start: 6 * 60 + 35 };
    case 5: return null;
    case 6: return { type: 'run', title: 'Long run', dur: 46 + weekIndex * 2 + round(rnd() * 4), intensity: 'Moderate', start: 8 * 60 + 15 };
    case 0: return weekIndex % 3 === 1
      ? { type: 'cycle', title: 'Easy ride', dur: jitter(45), intensity: 'Low to moderate', start: 10 * 60 }
      : { type: 'mobility', title: 'Mobility', dur: jitter(20), intensity: 'Low', start: 18 * 60 + 30 };
    default: return null;
  }
}

const intensityFactor: Record<Intensity, number> = { Low: 0.45, 'Low to moderate': 0.65, Moderate: 0.85, High: 1.1 };
const baseHr: Record<WorkoutType, number> = { run: 142, walk: 104, cycle: 128, strength: 118, mobility: 92 };

function buildWorkout(date: string, s: Spec, rnd: () => number, idx: number): Workout {
  const f = intensityFactor[s.intensity];
  const avgHr = round(baseHr[s.type] + (f - 0.65) * 30 + (rnd() - 0.5) * 6);
  const maxHr = round(Math.min(member.maxHr - 4, avgHr + 14 + f * 14 + rnd() * 6));
  let distanceKm: number | undefined;
  let pace: number | undefined;
  if (s.type === 'run') {
    pace = round((s.intensity === 'High' ? 318 : s.intensity === 'Moderate' ? 348 : 372) + (rnd() - 0.5) * 16);
    distanceKm = +(s.dur * 60 / pace).toFixed(2);
  } else if (s.type === 'walk') {
    pace = round(640 + (rnd() - 0.5) * 40);
    distanceKm = +(s.dur * 60 / pace).toFixed(2);
  } else if (s.type === 'cycle') {
    distanceKm = +(s.dur / 60 * (s.intensity === 'Moderate' ? 26 : 22) + rnd()).toFixed(1);
  }
  const load = round(clamp(s.dur * f * 0.62 + (rnd() - 0.5) * 4, 4, 70));
  return {
    id: `w-${date}-${idx}`,
    date,
    startTime: hhmm(s.start),
    type: s.type,
    title: s.title,
    durationMin: s.dur,
    distanceKm,
    avgHr,
    maxHr,
    load,
    intensity: s.intensity,
    paceSecPerKm: pace,
    calories: round(s.dur * (s.type === 'run' ? 10.5 : s.type === 'cycle' ? 8.5 : s.type === 'strength' ? 7 : 4.5) * (0.8 + f * 0.3)),
  };
}

function generate(): DayRecord[] {
  const rnd = mulberry32(20261116);
  const start = addDays(TODAY, -(HISTORY_DAYS - 1));
  const days: DayRecord[] = [];
  let prevLoad = 40;
  let prevPrevLoad = 40;
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const date = addDays(start, i);
    const wd = parseDate(date).getDay();
    const weekIndex = Math.floor(i / 7);
    const isToday = date === TODAY;
    const spec = isToday ? null : sessionFor(date, weekIndex, rnd);
    const workouts: Workout[] = [];
    if (spec) workouts.push(buildWorkout(date, spec, rnd, 0));
    if (isToday) workouts.push(buildWorkout(date, { type: 'walk', title: 'Morning walk', dur: 32, intensity: 'Low', start: 6 * 60 + 50 }, rnd, 0));

    const fitness = i / HISTORY_DAYS; // gentle improvement over the eight weeks
    // Sleep (the night before this morning)
    const heavyBefore = prevLoad > 55;
    const sleepMin = round(clamp(448 + (rnd() - 0.5) * 70 + (heavyBefore ? 18 : 0) + (wd === 6 || wd === 0 ? 14 : 0) + fitness * 10, 372, 528));
    const awakeMin = round(clamp(26 + (rnd() - 0.5) * 22 - fitness * 6, 12, 58));
    const consistency = round(clamp(76 + fitness * 12 + (rnd() - 0.5) * 12, 62, 95));
    const startMin = 23 * 60 + round((rnd() - 0.5) * 50 + (wd === 6 || wd === 0 ? 20 : 0) - fitness * 10) - 1440;
    const sleepScore = round(clamp(48 + (sleepMin - 380) * 0.28 - awakeMin * 0.35 + consistency * 0.18 + (rnd() - 0.5) * 6, 48, 96));

    // Recovery responds to the previous two days' load and last night's sleep
    const recovery = round(clamp(
      66 + fitness * 6 - (prevLoad - 40) * 0.55 - (prevPrevLoad - 40) * 0.2 + (sleepScore - 78) * 0.45 + (rnd() - 0.5) * 12,
      28, 92,
    ));
    const hrv = round(clamp(38 + recovery * 0.22 + fitness * 3 + (rnd() - 0.5) * 6, 32, 72));
    const rhr = round(clamp(64 - recovery * 0.1 - fitness * 2 + (rnd() - 0.5) * 3, 50, 64));

    const workoutLoad = workouts.reduce((a, w) => a + w.load, 0);
    const workoutMin = workouts.reduce((a, w) => a + w.durationMin, 0);
    const steps = round(clamp(5200 + rnd() * 3800 + workouts.reduce((a, w) => a + (w.distanceKm && w.type !== 'cycle' ? w.distanceKm * 1350 : 0), 0), 3100, 26000));
    const activeMin = round(workoutMin + 12 + rnd() * 18);
    const dailyLoad = round(clamp(12 + workoutLoad + steps / 1400 + (rnd() - 0.5) * 4, 8, 96));

    days.push({
      date, weekday: wd, recovery, hrv, rhr, sleepMin, awakeMin, sleepScore,
      sleepStart: hhmm(startMin), wakeTime: hhmm(startMin + sleepMin + awakeMin),
      consistency, dailyLoad, weeklyLoad: 0, steps, activeMin,
      isRest: workouts.filter((w) => w.type !== 'walk' && w.type !== 'mobility').length === 0,
      workouts,
    });
    prevPrevLoad = prevLoad;
    prevLoad = dailyLoad;
  }
  // Rolling weekly load (7-day mean, scaled to 0–100)
  days.forEach((d, i) => {
    const win = days.slice(Math.max(0, i - 6), i + 1);
    d.weeklyLoad = round(clamp(win.reduce((a, x) => a + x.dailyLoad, 0) / win.length * 1.6, 0, 100));
  });

  // Today's published metrics (spec section 7)
  const t = days[days.length - 1];
  Object.assign(t, {
    recovery: 72, hrv: 54, rhr: 56, sleepMin: 458, awakeMin: 32, sleepScore: 84, consistency: 86,
    dailyLoad: 58, weeklyLoad: 62, steps: 8420, activeMin: 54, sleepStart: '22:52', wakeTime: '06:42', isRest: false,
  });
  return days;
}

export const history: DayRecord[] = generate();
export const today: DayRecord = history[history.length - 1];
export const yesterday: DayRecord = history[history.length - 2];
export const allWorkouts: Workout[] = history.flatMap((d) => d.workouts).reverse(); // newest first

export function dayByDate(date: string) {
  return history.find((d) => d.date === date);
}
export function workoutById(id: string) {
  return allWorkouts.find((w) => w.id === id);
}

// ---------- derived series ----------
function seeded(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return mulberry32(h >>> 0);
}

/** Sleep stages for the night ending on `date`. Deep sleep comes early, REM later. */
export function sleepStages(day: DayRecord): SleepSegment[] {
  const rnd = seeded(`sleep-${day.date}`);
  const total = day.sleepMin + day.awakeMin;
  const segments: SleepSegment[] = [];
  let t = 0;
  let awakeLeft = day.awakeMin;
  const push = (stage: SleepSegment['stage'], dur: number) => {
    dur = Math.max(2, round(dur));
    const last = segments[segments.length - 1];
    if (last && last.stage === stage) last.durationMin += dur;
    else segments.push({ stage, startMin: t, durationMin: dur });
    t += dur;
  };
  push('Awake', Math.min(9, awakeLeft * 0.3));
  awakeLeft -= segments[0].durationMin;
  let cycle = 0;
  while (t < total - 8) {
    const early = 1 - cycle / 5;
    push('Light', 28 + rnd() * 16);
    push('Deep', clamp(8 + early * 20 + (rnd() - 0.5) * 6, 3, 32));
    push('Light', 10 + rnd() * 10);
    push('REM', clamp(10 + cycle * 7 + (rnd() - 0.5) * 6, 6, 42));
    if (awakeLeft > 2 && rnd() < 0.6) {
      const a = Math.min(awakeLeft, 3 + rnd() * 6);
      push('Awake', a);
      awakeLeft -= a;
    }
    cycle++;
  }
  // scale to the exact night length
  const scale = total / t;
  let acc = 0;
  segments.forEach((s) => {
    s.startMin = round(acc);
    s.durationMin = Math.max(1, round(s.durationMin * scale));
    acc += s.durationMin * 1;
  });
  return segments;
}

export function stageTotals(segs: SleepSegment[]) {
  const totals = { Awake: 0, Light: 0, Deep: 0, REM: 0 };
  segs.forEach((s) => (totals[s.stage] += s.durationMin));
  return totals;
}

/** Heart rate through a workout, one point per 30 seconds. */
export function heartRateSeries(w: Workout) {
  const rnd = seeded(w.id);
  const points: { min: number; hr: number }[] = [];
  const n = w.durationMin * 2;
  const isIntervals = w.title.includes('Interval');
  const isTempo = w.title.includes('Tempo');
  for (let i = 0; i <= n; i++) {
    const min = i / 2;
    const p = min / w.durationMin;
    let target = w.avgHr;
    if (p < 0.12) target = w.avgHr - 30 + (p / 0.12) * 30; // warm-up
    else if (p > 0.92) target = w.avgHr - ((p - 0.92) / 0.08) * 22; // cool-down
    if (isIntervals && p > 0.15 && p < 0.85) target += Math.sin(min * 1.6) > 0 ? 12 : -8;
    if (isTempo && p > 0.3 && p < 0.8) target += 8;
    target += p * 5; // cardiac drift
    const hr = round(clamp(target + (rnd() - 0.5) * 5, 70, w.maxHr));
    points.push({ min, hr });
  }
  return points;
}

/** Split pace per kilometre for runs. */
export function paceSplits(w: Workout) {
  if (!w.distanceKm || !w.paceSecPerKm) return [];
  const rnd = seeded(`pace-${w.id}`);
  const km = Math.floor(w.distanceKm);
  return Array.from({ length: km }, (_, i) => {
    const fade = i / Math.max(1, km) * 8;
    const tempo = w.title.includes('Tempo') && i > 0 && i < km - 1 ? -18 : 0;
    return { km: i + 1, pace: round(w.paceSecPerKm! + (rnd() - 0.5) * 14 + fade + tempo) };
  });
}

// ---------- training plan (week of today) ----------
export function initialPlan(): PlanSession[] {
  const base: Omit<PlanSession, 'date' | 'weekday' | 'id'>[] = [
    { type: 'run', title: 'Easy Run', durationMin: 35, intensity: 'Low to moderate', goal: 'Aerobic base', description: 'Conversational pace, 128–145 bpm. Stay relaxed and smooth.', status: 'planned', adjusted: false },
    { type: 'strength', title: 'Strength Training', durationMin: 30, intensity: 'Moderate', goal: 'Injury resilience', description: 'Squats, split squats, calf raises, glute bridges and core. 3 rounds.', status: 'planned', adjusted: false },
    { type: 'walk', title: 'Recovery Walk', durationMin: 25, intensity: 'Low', goal: 'Active recovery', description: 'An easy outdoor walk to loosen up between harder days.', status: 'planned', adjusted: false },
    { type: 'run', title: 'Tempo Run', durationMin: 40, intensity: 'High', goal: 'Half-marathon pace', description: '10 min easy, 20 min at comfortably hard effort, 10 min easy.', status: 'planned', adjusted: false },
    { type: 'rest', title: 'Rest', durationMin: 0, intensity: 'Rest', goal: 'Recovery', description: 'A full rest day. Light stretching is fine.', status: 'planned', adjusted: false },
    { type: 'run', title: 'Long Run', durationMin: 60, intensity: 'Moderate', goal: 'Endurance', description: 'Steady effort. Practise fuelling at 40 minutes.', status: 'planned', adjusted: false },
    { type: 'mobility', title: 'Mobility', durationMin: 20, intensity: 'Low', goal: 'Range of motion', description: 'Hips, hamstrings, ankles and thoracic spine.', status: 'planned', adjusted: false },
  ];
  const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return base.map((b, i) => ({ ...b, id: `p-${i}`, date: addDays(TODAY, i), weekday: names[i] }));
}

export const workoutTypeLabel: Record<WorkoutType, string> = {
  run: 'Running', walk: 'Walking', cycle: 'Cycling', strength: 'Strength training', mobility: 'Mobility',
};
