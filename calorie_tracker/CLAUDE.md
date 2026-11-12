@AGENTS.md

# Calorie Tracker

A single-page calorie and macro tracker. No login, no accounts: everything is stored
in a local SQLite file on the machine running the app.

## What it does

- **Search and add foods.** 30 common foods (chicken, rice, eggs, banana, …) are seeded
  with calories, protein, carbs, fat, and a serving size. Type to filter, click a
  category chip to narrow, click a row (or press Enter for the top match) to log one serving.
- **Daily log.** Shows what you ate on the selected day. Each line has −/+ buttons
  (half-serving steps) and a remove button. Logging a food that is already in the day's
  log increases its servings instead of adding a duplicate line.
- **Totals at the top.** A "nutrition facts" style label shows total calories, progress
  against a daily goal (editable, default 2,000), grams of each macro, and each macro's
  share of calories.
- **Day navigation.** Step back through earlier days; you can't move past today.
- **Persistence.** The log, the food list, and the goal live in `data/calorie-tracker.db`
  and survive page refreshes and server restarts.

## How to run

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts: `npm run build` (production build + type check), `npm start`,
`npm run lint`.

The database file is created, migrated, and seeded automatically on the first API
request. To start fresh, stop the server and delete the `data/` folder.
Set `DATABASE_PATH` to store the file somewhere else.

`better-sqlite3` ships prebuilt binaries; its `node-gyp` fallback install script is
denied in `package.json` (`allowScripts`). If you're on a platform with no prebuilt
binary, run `npm install-scripts approve better-sqlite3` and reinstall.

## Tech stack

| Layer      | Choice                                                         |
| ---------- | -------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack, Cache Components enabled)    |
| Language   | TypeScript (strict)                                            |
| Styling    | Tailwind CSS v4 with CSS-variable design tokens in `globals.css` |
| Database   | SQLite via `better-sqlite3` (synchronous, server-only)         |
| Font       | Archivo (variable, width axis) via `next/font/google`          |
| Runtime    | Node.js 20+ (developed on Node 24)                             |

## Folder structure

```
app/
  layout.tsx              Root layout, font, metadata
  page.tsx                Renders <CalorieTracker />
  globals.css             Design tokens (light + dark), label type, highlight animation
  api/
    foods/route.ts        GET    all foods
    log/route.ts          GET ?date=YYYY-MM-DD, POST { date, foodId, servings? }
    log/[id]/route.ts     PATCH { servings }, DELETE
    settings/route.ts     GET, PUT { calorieGoal }
components/
  calorie-tracker.tsx     Client root: page state, data loading, mutations, status toast
  daily-label.tsx         Nutrition-facts style totals + goal editor
  food-search.tsx         Search box, category chips, food list
  food-log.tsx            The day's entries with servings steppers
  date-switcher.tsx       Previous / next day, back to today
  icons.tsx               Inline SVG icons
lib/
  db.ts                   SQLite connection, migrations (PRAGMA user_version), seeding
  repository.ts           All SQL queries; maps rows to camelCase types
  seed-foods.ts           Starter food list (per-serving values, USDA-derived)
  types.ts                Food, LogEntry, Nutrients, Settings
  nutrition.ts            Totals, macro energy split, number formatting
  date.ts                 Local-calendar YYYY-MM-DD helpers
  validation.ts           Request validation + JSON error responses
  api-client.ts           Typed fetch wrappers used by components
data/                     SQLite database (git-ignored, created at runtime)
docs/                     Decision logs, one file per build session
```

## Data model

- `foods`: id, name (unique), category, serving_size, calories, protein, carbs, fat
- `log_entries`: id, date (`YYYY-MM-DD`), food_id → foods (nullable), servings,
  **snapshot** of name/serving_size/nutrients per serving, created_at
- `settings`: key/value (`calorie_goal`)

Log entries copy the food's nutrition values when logged, so changing a food later
never alters past days. Totals are always `per-serving value × servings`.

## Conventions

- **All SQL goes in `lib/repository.ts`.** Route handlers validate input, call a
  repository function, and return JSON. Components never import `lib/db.ts`.
- **Mutations return the whole day's log** (`{ entries }`) so the client replaces its
  list with server truth, with no client-side merging.
- **Dates are local-calendar strings** chosen by the browser. The server never computes
  "today", so time zones can't shift entries between days.
- **Schema changes:** append a new SQL string to `MIGRATIONS` in `lib/db.ts`; never edit
  an existing one. `user_version` tracks what has run.
- **New seed foods:** add to `lib/seed-foods.ts`; `INSERT OR IGNORE` by name adds them
  to existing databases on next start.
- **Cache Components is on.** DB-reading `GET` handlers without request input call
  `await connection()` so they're never prerendered at build time.
- **Styling:** use the token classes (`bg-surface`, `text-muted`, `border-ink`,
  `bg-protein`, …), not raw hex. The label's condensed numbers use `.label-type`.
- **Copy:** sentence case, plain verbs; buttons say what they do ("Save goal",
  "Back to today").
- Errors from the API are `{ error: string }` with 400/404 status; the UI shows them
  in the status toast.

## Verifying changes

```bash
npx tsc --noEmit && npm run lint && npm run build
```
There is no automated test suite yet. For API changes, exercise the routes with curl
against `npm run dev` (see the decision log for example calls).

## What's coming next

- Custom foods: add/edit/delete your own foods (API + form)
- Gram-based logging (enter "150 g" instead of servings)
- Meal grouping (breakfast / lunch / dinner / snacks)
- Macro goals (protein/carbs/fat targets), not just calories
- Weekly history view with a calories-per-day chart
- Larger food database (e.g. USDA FoodData Central search)
- Tests: Vitest for `lib/` (nutrition, date, repository against a temp DB),
  Playwright for the add → log → refresh flow
- Export / import the log as CSV
