# Aura — web dashboard and mobile app prototype

A clickable prototype of the fictional Aura ecosystem: a screenless recovery band, a responsive web analytics dashboard and a mobile companion app. Everything uses fictional data and simulated interactions; nothing connects to real hardware.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
```

- Web dashboard: `/#/`
- Mobile app: `/#/m` (shown in a phone frame on desktop, full screen on a phone)

## Stack

React 18 · TypeScript · Tailwind CSS · Recharts · Lucide icons · React Router (hash routing, so the build works on any static host).

## Structure

```
src/
  data/
    types.ts        Shared data types (DayRecord, Workout, PlanSession…)
    mockData.ts     Maya Okoro's profile, device, and 8 weeks of seeded history
  lib/
    format.ts       Formatting helpers and recovery status bands
    analytics.ts    Weekly summaries and computed insights
  state/AppState.tsx  Theme, selected date, plan edits, device, settings, toasts
  components/
    ui.tsx          Logo, ScoreRing, Metric, Chip, Segmented, Toggle, Dialog, states
    charts.tsx      Load, recovery, sleep, heart-rate and pace charts (Recharts)
    domain.tsx      Sleep timeline, workout cards, device status/pairing, plan cards
  web/              Sidebar layout + Overview, Recovery, Sleep, Activity, Workouts,
                    Workout detail, Training plan, Insights, Settings
  mobile/           Phone shell + Onboarding, Today, Recovery, Sleep, Activity,
                    Live workout, Workout summary, Plan, Profile
```

## About the data

- "Today" is fixed at **Monday 16 November 2026** so the first plan session (Easy Run, 35 min) is today's suggested workout. Change `TODAY` in `src/data/mockData.ts` to move it.
- Today's metrics match the spec exactly (recovery 72, HRV 54 ms, RHR 56 bpm, sleep 7h 38m, sleep score 84, loads 58/62, 8,420 steps, battery 78%).
- The 56 days of history are generated from a fixed seed, so every page and chart agrees. Recovery responds to the previous days' load and sleep.
- The weekend of 24–25 October is a heavy one (98-minute long run plus a two-hour ride). The following week is lighter, with shorter sessions and extra rest days, and recovery dips and then rebounds.
- Insights are computed from the same data and worded as observations, not health claims.

## Design system

Colours, type and radii follow the Aura design system v1: off-white ground, white cards with hairline borders, lime used sparingly for primary actions, mint for insights, green/lavender/orange for recovery/sleep/activity data, Manrope for scores and headings and Inter for text. Light theme by default; dark theme via the moon button or Settings › Theme. Tokens live as CSS variables in `src/index.css` and are mapped in `tailwind.config.js`.

## Things to try

- Web: step through days with the date selector, switch chart ranges and metrics, hover charts for tooltips, mark/skip/adjust plan sessions, disconnect and re-pair the band in Settings (tick "simulate a pairing problem" to see the error state), and toggle the theme.
- Mobile: run onboarding (`/#/m/onboarding`), then start a workout from Today. Use "Speed up demo", pause, resume and end it, then save it. The saved run appears under recent workouts and completes today's plan session.
