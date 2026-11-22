import { TODAY, addDays, history, parseDate } from '../data/mockData';
import type { DayRecord } from '../data/types';
import { fmtDuration, fmtShortDate, mean, stdev } from './format';

export function lastNDays(n: number, end = TODAY): DayRecord[] {
  const idx = history.findIndex((d) => d.date === end);
  return history.slice(Math.max(0, idx - n + 1), idx + 1);
}

export function mondayOf(iso: string) {
  const wd = parseDate(iso).getDay();
  return addDays(iso, -((wd + 6) % 7));
}

export interface WeekSummary {
  start: string;
  label: string;
  days: DayRecord[];
  load: number;
  sessions: number;
  minutes: number;
  avgRecovery: number;
  avgSleep: number;
  avgHrv: number;
  avgRhr: number;
  sleepSd: number;
  restDays: number;
  current: boolean;
}

export function weeks(): WeekSummary[] {
  const map = new Map<string, DayRecord[]>();
  history.forEach((d) => {
    const k = mondayOf(d.date);
    map.set(k, [...(map.get(k) ?? []), d]);
  });
  return [...map.entries()].map(([start, days]) => {
    const training = days.flatMap((d) => d.workouts).filter((w) => !w.title.startsWith('Morning'));
    return {
      start,
      label: fmtShortDate(start),
      days,
      load: Math.round(mean(days.map((d) => d.dailyLoad))),
      sessions: training.length,
      minutes: training.reduce((a, w) => a + w.durationMin, 0),
      avgRecovery: Math.round(mean(days.map((d) => d.recovery))),
      avgSleep: Math.round(mean(days.map((d) => d.sleepMin))),
      avgHrv: Math.round(mean(days.map((d) => d.hrv))),
      avgRhr: +mean(days.map((d) => d.rhr)).toFixed(1),
      sleepSd: Math.round(stdev(days.map((d) => d.sleepMin))),
      restDays: days.filter((d) => d.isRest).length,
      current: start === mondayOf(TODAY),
    };
  });
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  tone: 'recovery' | 'sleep' | 'activity' | 'neutral';
  category: 'Sleep' | 'Recovery' | 'Training' | 'Activity';
}

/** Patterns from the fictional data. Phrased as observations, never as health conclusions. */
export function insights(): Insight[] {
  const ws = weeks().filter((w) => !w.current && w.days.length === 7);
  const last = ws[ws.length - 1];
  const prev = ws[ws.length - 2];
  const longest = last.days.flatMap((d) => d.workouts).sort((a, b) => b.durationMin - a.durationMin)[0];
  const afterRest: number[] = [];
  const afterTraining: number[] = [];
  history.forEach((d, i) => {
    if (i === 0) return;
    (history[i - 1].isRest ? afterRest : afterTraining).push(d.recovery);
  });
  const out: Insight[] = [
    {
      id: 'sleep-consistency', category: 'Sleep', tone: 'sleep',
      title: last.sleepSd < prev.sleepSd ? 'Your sleep duration has been more consistent this week.' : 'Your sleep duration varied a little more this week.',
      body: `Night-to-night variation was about ${last.sleepSd} minutes, compared with ${prev.sleepSd} minutes the week before. Average sleep was ${fmtDuration(last.avgSleep)}.`,
    },
    {
      id: 'rhr', category: 'Recovery', tone: 'recovery',
      title: last.avgRhr <= prev.avgRhr ? 'Your resting heart rate trend is slightly lower than last week.' : 'Your resting heart rate trend is slightly higher than last week.',
      body: `It averaged ${last.avgRhr} bpm, versus ${prev.avgRhr} bpm the previous week. Small week-to-week changes like this are normal.`,
    },
    {
      id: 'longest', category: 'Training', tone: 'activity',
      title: `Your longest workout was on ${parseDate(longest.date).toLocaleDateString('en-GB', { weekday: 'long' })}.`,
      body: `${longest.title}: ${fmtDuration(longest.durationMin)}${longest.distanceKm ? `, ${longest.distanceKm.toFixed(1)} km` : ''}, averaging ${longest.avgHr} bpm.`,
    },
    {
      id: 'count', category: 'Training', tone: 'activity',
      title: `You completed ${last.sessions} workouts last week.`,
      body: `That adds up to ${fmtDuration(last.minutes)} of training across ${7 - last.restDays} active days, with ${last.restDays} rest ${last.restDays === 1 ? 'day' : 'days'}.`,
    },
    {
      id: 'after-rest', category: 'Recovery', tone: 'recovery',
      title: 'Your recovery scores were higher following rest days.',
      body: `Over eight weeks, recovery averaged ${Math.round(mean(afterRest))} the morning after a rest day and ${Math.round(mean(afterTraining))} after a training day.`,
    },
    {
      id: 'heavy-weekend', category: 'Activity', tone: 'neutral',
      title: 'You eased off well after the big weekend of 24–25 October.',
      body: 'After a 98-minute long run and a two-hour ride, the following week had shorter, easier sessions and extra rest. Recovery was back above 70 within two days.',
    },
  ];
  return out;
}

export function trainingConsistency() {
  const ws = weeks().filter((w) => !w.current);
  return ws.map((w) => ({ label: w.label, sessions: w.sessions, minutes: w.minutes, load: w.load, current: w.current }));
}

export { fmtShortDate };
