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

This is Phase 2 (Core Sales) of a 10-phase build — see the roadmap on the Control Tower page, or [`docs/architecture.md`](docs/architecture.md#phased-build-plan). Phase 1 (auth, organizations, RBAC, app shell/navigation, team invites, settings, audit log) is done. Phase 2 adds **Leads & CRM** (pipeline board + list, lead scoring, activity timeline, convert-to-customer) and **Customers** (profile, contacts, sites) end-to-end. The remaining 17 business modules are routed but intentionally show a "coming in Phase N" placeholder rather than fake data.
