# 2026-11-11: Initial build

## Summary

First version of the calorie tracker: a single-page Next.js app with a searchable
list of 30 common foods, a per-day food log, a daily calorie goal, and a
nutrition-facts style totals panel. All data is stored in a local SQLite database.

## Requirements

| Requirement                                   | Delivered by                                     |
| --------------------------------------------- | ------------------------------------------------ |
| Single page, no login                         | `app/page.tsx` → `components/calorie-tracker.tsx` |
| Search bar + 20+ quick-add foods              | `components/food-search.tsx`, 30 foods in `lib/seed-foods.ts` |
| Calories, protein, carbs, fat, serving size   | `foods` table, `Food` type                       |
| Daily log with calorie total at the top       | `components/daily-label.tsx`, `components/food-log.tsx` |
| Persists across refreshes in a local database | SQLite file `data/calorie-tracker.db`            |
| Runs with `npm run dev`                       | Next.js dev server on port 3000                  |

## Architecture

```
Browser (client components)
  CalorieTracker ── state: selected date, foods, day log, goal
    ├─ DailyLabel     (totals + goal editor)
    ├─ FoodSearch     (client-side filtering of the food list)
    └─ FoodLog        (entries, servings −/+, remove)
        │  lib/api-client.ts (fetch)
        ▼
Next.js route handlers (app/api/*)  ── validate input (lib/validation.ts)
        ▼
lib/repository.ts  ── all SQL
        ▼
lib/db.ts  ── better-sqlite3 connection, migrations, seed  →  data/calorie-tracker.db
```

### UI flow

1. The page loads, then the client reads the browser's local date and fetches foods,
   settings, and that day's log in parallel.
2. Typing filters the food list instantly; Enter adds the top match.
3. Adding a food sends `POST /api/log`; the server returns the day's full log, the
   label totals recompute, the changed row flashes, and a status toast confirms
   ("Added Banana to today.").
4. −/+ change servings in 0.5 steps (`PATCH`); × removes the line (`DELETE`).
5. The date switcher loads other days; responses for a day no longer on screen are dropped.

## Technical decisions

### SQLite via `better-sqlite3` for the "local database"
- **Why:** A real database file on disk, with no separate server to install or run.
  It survives refreshes, browser changes, and server restarts. The synchronous
  API keeps the repository code short, and the package is on Next.js's default
  `serverExternalPackages` list, so no bundler configuration is needed.
- **Alternatives considered:**
  - *localStorage / IndexedDB:* simpler, but the data would be tied to one browser
    profile and isn't really a "database" the app owns.
  - *Prisma / Drizzle + SQLite:* adds codegen and migration tooling that a schema of
    three tables doesn't need.
  - *Node's built-in `node:sqlite`:* no native dependency, but still flagged
    experimental and less battle-tested with Next.js bundling.
- **Trade-off:** It needs a Node server, so the app can't be deployed as-is to
  serverless hosting with an ephemeral filesystem. That's fine for a personal local app.
- **Install note:** npm 11 blocks dependency install scripts by default.
  `better-sqlite3` includes prebuilt binaries, so its `node-gyp` fallback is recorded
  as denied in `package.json` → `allowScripts` and the install stays clean.

### Route handlers + client fetching (instead of Server Components/Actions)
- "Today" depends on the user's clock and time zone, so the client picks the date. A
  client-driven page with a small JSON API keeps that simple and makes the API easy to
  test with curl.
- Every mutation returns the **whole day's log**. The client just replaces its list,
  so no optimistic merge logic can drift out of sync. (The plan originally called for
  optimistic updates; with a local SQLite call taking a few milliseconds, they weren't
  worth the complexity, so they were dropped.)
- Next.js 16 enables **Cache Components** by default, under which a `GET` handler
  that reads no request data can be prerendered at build time. `GET /api/foods` and
  `GET /api/settings` call `await connection()` to force request-time execution.
  The build output confirms that all `/api/*` routes are dynamic (ƒ).

### Data model: snapshot nutrition onto log entries
- `log_entries` copies name, serving size, and per-serving nutrients from `foods`.
  Editing or deleting a food later (a planned feature) won't rewrite history.
  `food_id` uses `ON DELETE SET NULL` for the same reason.
- Logging a food already in the day's log **merges** into that line (servings += 1),
  so repeated quick-adds read as "Egg ×2" rather than two identical rows.
- Servings are a real number (0 < servings ≤ 50), stepped by 0.5 in the UI.

### Dates as local `YYYY-MM-DD` strings
- The browser sends the date it considers "today". The server only validates the
  format (rejects impossible dates like 2026-02-31). This avoids UTC midnight bugs
  where a late-evening meal lands on tomorrow.
- The date-dependent UI renders only after hydration (`useSyncExternalStore`), so the
  server-rendered HTML can't mismatch the client's clock.

### Migrations with `PRAGMA user_version`
- `lib/db.ts` holds an append-only array of SQL migrations; each one runs in a
  transaction and bumps `user_version`. It's lighter than a migration tool and safe
  to run on every start.
- Seed foods are inserted with `INSERT OR IGNORE` (unique name), so new starter
  foods reach existing databases without duplicates.

### Search on the client
- With 30 foods, sending the full list once and filtering in memory is instant and
  avoids a request per keystroke. Matching requires every typed word to appear in the
  name or category ("rice brown" finds "Brown rice, cooked"). When the list grows
  large (USDA import), move search to a `GET /api/foods?q=` with SQLite `LIKE`/FTS5.

### Nutrition values
- Per-serving numbers are rounded from USDA FoodData Central reference entries and
  use familiar serving sizes ("1 medium (118 g)", "1 cup (158 g)"). They're
  estimates for everyday tracking, not lab values.

### Design
- **Concept:** the daily total is drawn as a printed nutrition facts panel (heavy
  black rules, condensed black numerals), the most recognisable artefact in this
  subject. The rest of the page stays quiet so the label carries the identity.
- **Type:** one family, Archivo, using its width axis: 62% width / 900 weight for the
  label (`.label-type`), normal width for everything else. Tabular figures on
  for aligned numbers.
- **Colour:** cool sage paper `#EEF1EC` (deliberately not the usual cream), white label
  surface, pure black ink, garden green `#2F6B3A` reserved for add actions, and one
  muted colour per macro (protein blue, carb gold, fat plum). Full dark-mode token set
  via `prefers-color-scheme`.
- **Motion:** only in response to actions. A changed log row flashes once (disabled
  under `prefers-reduced-motion`), and the calorie meter animates its width.
- **Layout:** desktop puts the label and log in a 380px left column with the food finder
  on the right; mobile stacks label → finder → log so adding stays near the top.
- **Accessibility:** labelled search input, `aria-pressed` filter chips, a `meter` role
  for goal progress, descriptive `aria-label`s on icon buttons ("Remove Banana from
  the log"), an `aria-live` status toast, and visible `:focus-visible` outlines.

## Verification performed

- `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass.
- API exercised with curl against `npm run dev`:
  - `GET /api/foods` → 30 foods; `GET /api/settings` → `{ calorieGoal: 2000 }`
  - `POST /api/log` twice with the same food → one entry with `servings: 2`
  - `PATCH` servings to 1.5, `DELETE` → list updates correctly
  - Invalid date `2026-02-31`, unknown food/entry ids, out-of-range goal, and
    non-JSON body → 400/404 with a readable `{ error }` message
- Screenshots reviewed at 1280px (light and dark) and 390px (mobile, no horizontal
  overflow).
- Test data was cleared afterwards by deleting `data/`.

## Known limitations

- No automated tests yet (see "What's coming next" in `CLAUDE.md`).
- Foods are fixed to the seed list; there's no UI to add custom foods yet.
- Single user per database file by design.
