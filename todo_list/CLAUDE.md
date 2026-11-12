@AGENTS.md

# To do

A single-page to-do list. No login or accounts: everything is stored in a local
SQLite file on the machine running the app.

## What it does

- **Add tasks.** Type and press Enter. You can set a due date and a priority (High, Medium or Low, default Medium). New tasks go to the top.
- **Finish, edit, delete.** Tick the box to finish a task, which draws a marker stroke through it. Double-click a task (or use the pencil button) to edit its title, date and priority inline. Enter saves and Escape cancels.
- **Filter and sort.** Show All, To do or Done tasks, each with a count. Sort by My order, Due date or Priority. Overdue dates show in red, and "Due today" and "Due tomorrow" are highlighted.
- **Reorder.** In "My order", drag a task by its grip, or focus the grip and press ↑/↓. The order is saved.
- **Clear finished tasks** deletes every completed task, after a confirmation.

## How to run

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts: `npm run build` (production build and type check), `npm start`, `npm run lint`.

The database (`data/todo.db`) is created and migrated on the first API request.
To start fresh, stop the server and delete `data/`. Set `DATABASE_PATH` to store the file somewhere else.

## Layout

- `app/api/todos/…`: route handlers. Every mutating route returns the full updated list.
- `lib/db.ts` (connection and migrations), `lib/repository.ts` (queries), `lib/validation.ts`, `lib/api-client.ts` (browser fetch wrappers).
- `components/todo-app.tsx` holds page state (filter, sort, optimistic updates, drag and drop). Rows are in `todo-item.tsx`.
