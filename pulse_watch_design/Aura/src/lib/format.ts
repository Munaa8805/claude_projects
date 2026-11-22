import { parseDate } from '../data/mockData';

export function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
export function fmtMinutes(min: number) {
  return min >= 60 ? fmtDuration(min) : `${Math.round(min)} min`;
}
export function fmtClock(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`;
}
export function fmtPace(secPerKm?: number) {
  if (!secPerKm || !isFinite(secPerKm)) return '–';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function fmtTime12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}
export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) {
  return parseDate(iso).toLocaleDateString('en-GB', opts);
}
export function fmtShortDate(iso: string) {
  return parseDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
export function weekdayShort(iso: string) {
  return parseDate(iso).toLocaleDateString('en-GB', { weekday: 'short' });
}
export function fmtNumber(n: number) {
  return n.toLocaleString('en-US');
}

export type RecoveryBand = { label: string; tone: 'recovery' | 'activity' | 'sleep'; note: string };
export function recoveryStatus(score: number): RecoveryBand {
  if (score >= 67) return { label: 'Ready', tone: 'recovery', note: 'A good day for your planned session.' };
  if (score >= 40) return { label: 'Steady', tone: 'activity', note: 'Keep effort moderate and listen to your body.' };
  return { label: 'Take it easy', tone: 'sleep', note: 'Favour rest, mobility or an easy walk.' };
}

export function diffLabel(now: number, before: number, unit = '', invert = false) {
  const d = Math.round((now - before) * 10) / 10;
  if (d === 0) return { text: 'Same as yesterday', dir: 0 as const };
  const better = invert ? d < 0 : d > 0;
  return { text: `${d > 0 ? '+' : ''}${d}${unit} vs yesterday`, dir: (better ? 1 : -1) as 1 | -1 };
}

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const stdev = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};
