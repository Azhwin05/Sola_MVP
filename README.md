# Solar Business OS

Solar Business Operating System for Viryasys Technologies — lead to lifetime operations, one connected Project Passport per install. See [`docs/architecture.md`](docs/architecture.md) for the system design and [`docs/database.md`](docs/database.md) for the schema.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres, Auth, RLS)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First run redirects to `/signup` — create an account, confirm the email, then you'll be walked through creating your organization.

Environment variables are documented in [`.env.example`](.env.example); `.env.local` (gitignored) already points at the `viryasys-solar-os` Supabase project.

## Project status

This is Phase 3 (Survey + Engineering) of a 10-phase build — see the roadmap on the Control Tower page, or [`docs/architecture.md`](docs/architecture.md#phased-build-plan). Phases 1-2 (auth/RBAC/app shell, Leads & CRM, Customers) are done. Phase 3 adds **Site Surveys** (mobile-ish form across site/measurements/electrical/shadow sections, real photo uploads, draft→approved workflow), **EB Bill Intelligence** (12-month consumption history), and **Engineering** (deterministic, unit-tested capacity calculation with every assumption shown, versioned revisions, and a generated editable BOM). Run `npm test` to run the capacity-calculation unit tests. The remaining 14 business modules are routed but intentionally show a "coming in Phase N" placeholder rather than fake data.
