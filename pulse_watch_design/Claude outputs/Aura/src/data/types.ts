export type WorkoutType = 'run' | 'walk' | 'cycle' | 'strength' | 'mobility';
export type Intensity = 'Low' | 'Low to moderate' | 'Moderate' | 'High';

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  type: WorkoutType;
  title: string;
  durationMin: number;
  distanceKm?: number;
  avgHr: number;
  maxHr: number;
  load: number; // load contribution, 0–100 scale
  intensity: Intensity;
  paceSecPerKm?: number; // running and walking
  calories: number;
  notes?: string;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  weekday: number; // 0 Sun … 6 Sat
  recovery: number; // 0–100
  hrv: number; // ms
  rhr: number; // bpm
  sleepMin: number; // minutes asleep
  awakeMin: number; // minutes awake during the night
  sleepScore: number; // 0–100
  sleepStart: string; // HH:MM, the evening before
  wakeTime: string; // HH:MM
  consistency: number; // %
  dailyLoad: number; // 0–100
  weeklyLoad: number; // 0–100, rolling 7 days
  steps: number;
  activeMin: number;
  isRest: boolean;
  workouts: Workout[];
}

export type StageName = 'Awake' | 'Light' | 'Deep' | 'REM';
export interface SleepSegment {
  stage: StageName;
  startMin: number; // minutes after sleep start
  durationMin: number;
}

export type PlanStatus = 'planned' | 'completed' | 'skipped';
export interface PlanSession {
  id: string;
  date: string;
  weekday: string;
  type: WorkoutType | 'rest';
  title: string;
  durationMin: number;
  intensity: Intensity | 'Rest';
  goal: string;
  description: string;
  status: PlanStatus;
  adjusted: boolean;
}

export interface Member {
  name: string;
  firstName: string;
  age: number;
  goal: string;
  experience: string;
  preferredActivities: string[];
  trainingDays: string[];
  heightCm: number;
  weightKg: number;
  maxHr: number;
}

export interface Device {
  name: string;
  serial: string;
  colour: string;
  connected: boolean;
  battery: number;
  lastSync: string;
  firmware: string;
}
