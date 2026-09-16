# Architecture

Solar Business OS — Phase 1 (Foundation).

## Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4, shadcn/ui (base-ui primitives)
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security). No separate API server — the browser talks to Supabase directly via RLS-scoped queries, or via `SECURITY DEFINER` RPCs for operations that need cross-row logic (bootstrap, invites, numbering).
- **Deployment target**: Vercel (web) + Supabase managed backend (not yet deployed).

## Multi-tenancy

Every business table carries `organization_id`. The security boundary is enforced in Postgres via Row Level Security, not in application code:

- `public.current_org_id()` — resolves the caller's organization from `profiles` via `auth.uid()`.
- `public.has_permission(key)` / `public.is_org_owner()` — resolve RBAC checks used inside RLS policies.

All three are `SECURITY DEFINER` (to read `profiles`/`roles` without recursive RLS issues) but are locked down to the `authenticated` role only — `anon` cannot call them (see `supabase/README.md` advisory notes).

## Auth flow

1. **Sign up** (`/signup`) → Supabase Auth creates `auth.users` row → confirmation email sent → user clicks link → `/auth/callback` exchanges the code for a session → redirects to `/onboarding`.
2. **Onboarding** (`/onboarding`) → collects org name + full name → calls `bootstrap_organization()` RPC, which atomically creates the organization, the caller's profile, seeds the default 13-role RBAC template, and assigns the caller the `owner` role.
3. **Invites** (`/join/[token]`) → an org owner (or anyone with `team.manage`) generates a one-time link via `create_invite()`. The invitee signs up (or signs in), then calls `accept_invite()` to attach their profile to the inviting organization with the assigned role — no email-sending provider required.
4. **Middleware** (`src/proxy.ts`, Next 16's renamed middleware convention) refreshes the Supabase session on every request and redirects unauthenticated users to `/login`.

## Authorization model

- 23 nav modules, each gated by a `module.view` (and often `module.manage`) permission key — see `src/lib/nav.ts`.
- 13 default roles seeded per organization (`public.seed_default_roles`), matching the roles in the product spec (Owner, Management, Sales Manager, Sales Executive, Project Manager, Site Engineer, Design Engineer, Procurement Manager, Store/Warehouse, Finance, QA/QC, O&M Engineer, Customer).
- The sidebar, command palette and `+ Create` menu all filter by the signed-in user's flattened permission set (`getSessionContext()` in `src/lib/auth/session.ts`), but that's a UX convenience — the real enforcement is RLS.

## What's built vs. scaffolded

Built end-to-end (real data, real RLS, real auth): organization bootstrap, invites, team directory, role overview, organization profile settings, numbering-format settings, audit log.

Scaffolded (routed, but showing an honest "coming in Phase N" state, not fake data): Leads, Customers, Surveys, Engineering, Proposals, Projects, Procurement, Inventory, Finance, Installation, QA/QC, Commissioning, Monitoring, O&M, Customer Portal, Documents, Communications, Reports, Vendors.

## Phased build plan

See `src/components/shared/phase-roadmap.tsx` for the same list rendered in-app on the Control Tower. Phase 1 (Foundation) is in progress; each subsequent phase adds one or more of the modules above with its own migrations, RLS policies and UI.
