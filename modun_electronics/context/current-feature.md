# Current Feature

Database: Prisma 7 + Neon PostgreSQL setup

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Goals

- Install and configure Prisma 7 with Neon serverless PostgreSQL
- Create the initial `prisma/schema.prisma` from the data models in `context/project-overview.md` (catalog, cart, wishlist, orders, payments, shipments, discounts, reviews, webhook events). The schema will evolve.
- Include the Auth.js models: `Account`, `Session`, `VerificationToken` (plus `User`)
- Add the indexes and cascade deletes from the data model
- Add `prisma.config.ts` (Prisma 7 keeps the connection URL there, read from `DATABASE_URL`)
- Create the first migration with `prisma migrate dev` against the development branch
- Add a shared Prisma client module in `lib/` for server code

## Notes

- Use Prisma 7, which has breaking changes. Read the full upgrade guide before starting: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7. Setup guide: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres
- Neon has two branches: development (the one in `DATABASE_URL`) and production. ALWAYS create migrations. Never use `prisma db push` unless told to.
- Run `prisma migrate status` before committing to check that migrations are in sync.
- The project has no `src/` folder, so the generator `output` in project-overview.md (`../src/generated/prisma`) must change to a root-level path such as `../generated/prisma`. Add that folder to `.gitignore`.
- Out of scope: swapping the storefront off the mock catalog (`mock_data/`, queried via `lib/data/products.ts`) and seed data. Both are follow-up tasks.
- `DATABASE_URL` goes in `.env`, which must not be committed.

## History

<!-- Keep this updated. Earliest to latest -->

- **Storefront screens** (branch `feature/storefront-screens`): Home, Products (category filter), Product Detail (gallery, variant picker, stock badge, specs), Search, Sign in / Sign up (Zod + Server Actions, no real accounts yet), shared header and footer. The screens read typed mock data from `mock_data/` through `lib/data/products.ts`. Status: in progress, not merged yet.
