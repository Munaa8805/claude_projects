import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { TODAY, device as initialDevice, initialPlan, member as initialMember } from '../data/mockData';
import type { Device, Member, PlanSession, Workout } from '../data/types';

export type Theme = 'light' | 'dark';
export type Units = 'metric' | 'imperial';

export interface Settings {
  units: Units;
  notifications: { morningReadiness: boolean; workoutReminders: boolean; weeklySummary: boolean; batteryLow: boolean; bedtime: boolean };
  privacy: { shareAnonymised: boolean; showProfileToCoach: boolean };
  bedtimeTarget: string;
  weeklyGoal: number; // sessions per week
  raceDate: string;
  preferredTime: 'Morning' | 'Lunchtime' | 'Evening';
}

export interface Toast { id: number; message: string }

interface AppStateValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  member: Member;
  updateMember: (patch: Partial<Member>) => void;
  device: Device;
  setDevice: (patch: Partial<Device>) => void;
  plan: PlanSession[];
  completeSession: (id: string) => void;
  skipSession: (id: string) => void;
  resetSession: (id: string) => void;
  adjustSession: (id: string, patch: Partial<Pick<PlanSession, 'durationMin' | 'intensity' | 'title'>>) => void;
  savedWorkouts: Workout[];
  saveWorkout: (w: Workout) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  toasts: Toast[];
  toast: (message: string) => void;
}

const Ctx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('aura-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* storage unavailable */ }
    return 'light';
  });
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [member, setMember] = useState(initialMember);
  const [device, setDeviceState] = useState(initialDevice);
  const [plan, setPlan] = useState(initialPlan);
  const [savedWorkouts, setSaved] = useState<Workout[]>([]);
  const [onboarded, setOnboarded] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const [settings, setSettings] = useState<Settings>({
    units: 'metric',
    notifications: { morningReadiness: true, workoutReminders: true, weeklySummary: true, batteryLow: true, bedtime: false },
    privacy: { shareAnonymised: false, showProfileToCoach: true },
    bedtimeTarget: '22:45',
    weeklyGoal: 5,
    raceDate: '2027-03-14',
    preferredTime: 'Morning',
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#15171C' : '#F7F8FA');
    try { localStorage.setItem('aura-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toast = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const patchSession = (id: string, patch: Partial<PlanSession>) =>
    setPlan((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const value = useMemo<AppStateValue>(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    selectedDate,
    setSelectedDate,
    member,
    updateMember: (patch) => setMember((m) => ({ ...m, ...patch })),
    device,
    setDevice: (patch) => setDeviceState((d) => ({ ...d, ...patch })),
    plan,
    completeSession: (id) => { patchSession(id, { status: 'completed' }); toast('Session marked as completed'); },
    skipSession: (id) => { patchSession(id, { status: 'skipped' }); toast('Session skipped'); },
    resetSession: (id) => patchSession(id, { status: 'planned' }),
    adjustSession: (id, patch) => { patchSession(id, { ...patch, adjusted: true }); toast('Session adjusted'); },
    savedWorkouts,
    saveWorkout: (w) => setSaved((s) => [w, ...s]),
    settings,
    updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
    onboarded,
    setOnboarded,
    toasts,
    toast,
  }), [theme, selectedDate, member, device, plan, savedWorkouts, settings, onboarded, toasts, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppStateProvider');
  return v;
}

/** Simulates a short fetch whenever `key` changes, so pages can show loading states. */
export function useSimulatedLoad(key: unknown, ms = 380) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [key, ms]);
  return loading;
}
