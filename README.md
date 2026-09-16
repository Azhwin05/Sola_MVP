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

This is Phase 4 (Proposal + Project) of a 10-phase build — see the roadmap on the Control Tower page, or [`docs/architecture.md`](docs/architecture.md#phased-build-plan). Phases 1-3 (auth/RBAC/app shell, Leads & CRM, Customers, Site Surveys, EB Bills, Engineering) are done. Phase 4 adds a **Proposal Engine** (versioned, immutable once sent — pulls its equipment list live from the linked BOM instead of duplicating it, branded print/PDF preview, GST computed from editable rate + inter-state flag) and the **Project Passport** (auto-created when a proposal is accepted — 11 seeded milestones, task board, risk register, computed health with reasons shown, timeline). Run `npm test` for the Vitest suite (capacity calculation + project health, 18 tests). The remaining 12 business modules are routed but intentionally show a "coming in Phase N" placeholder rather than fake data.
