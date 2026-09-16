# Architecture

Solar Business OS — Phase 3 (Survey + Engineering) in progress, Phases 1-2 complete.

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

Built end-to-end (real data, real RLS, real auth): organization bootstrap, invites, team directory, role overview, organization profile settings, numbering-format settings, audit log, **Leads & CRM**, **Customers**, **Site Surveys**, **EB Bill Intelligence**, **Engineering (capacity + BOM)**.

Scaffolded (routed, but showing an honest "coming in Phase N" state, not fake data): Proposals, Projects, Procurement, Inventory, Finance, Installation, QA/QC, Commissioning, Monitoring, O&M, Customer Portal, Documents, Communications, Reports, Vendors.

## Leads & Customers (Phase 2)

- **Data model**: `leads` (own contact/company fields, so a lead can exist before any formal customer record), optionally linked to `customers` via `customer_id`. `customers` own `customer_contacts` (multiple contacts, one marked primary) and `customer_sites` (site addresses, reused by future Survey/Project modules). `lead_sources` is an org-editable lookup table, seeded with 8 defaults on org bootstrap. `lead_activities` is an append-style CRM log (calls/emails/meetings/notes/stage changes), distinct from `audit_logs` (system-level record of who-changed-what).
- **Numbering**: `leads.lead_number` defaults to `next_number('lead')` — generated automatically on insert, no client-side call needed.
- **Convert to Customer**: `convert_lead_to_customer(lead_id)` RPC does the customer + primary-contact creation and the `leads.customer_id` link atomically in one transaction, rather than as sequential client-side inserts, so a partial failure can't leave an orphaned customer record.
- **Lead scoring**: `src/lib/leads/scoring.ts` is a deterministic, explainable 0–100 score (deal value, system size, project type, timeline urgency, data completeness) — every point traces to a real field and is shown to the user as a breakdown, never as a bare AI-flavored number, per the product spec's "explain factors, don't claim certainty" rule.
- **Kanban + list views**: `/leads` toggles between a stage-column board (quick stage-move dropdown per card) and a filterable/searchable table; both operate on the same client-fetched dataset (no server-side pagination yet — fine at current data volumes, worth revisiting if lead counts grow into the thousands).

## Survey + Engineering (Phase 3)

- **Site Surveys**: `site_surveys` is a wide, mostly-flat table (site/measurements/electrical/shadow/notes sections as columns, `obstructions` as jsonb) rather than one child table per section — it's strictly 1:1 per survey, so normalizing further would just be extra joins with no real benefit. A survey always starts from a lead that's already linked to a customer (so a `site_id` — a `customer_sites` row — can be required); `/surveys/new` only lists leads with `customer_id` set, with the lead detail page pointing users to "Convert to Customer" first. Lifecycle: `draft → scheduled → assigned → in_progress → submitted → reviewed → approved | rework`, enforced only in the UI (see `survey-status-bar.tsx`) — the underlying `status` check constraint allows any listed value, so a future pass could push the transition rules into a Postgres function if stricter server-side enforcement is needed.
- **Photos**: real uploads to a private Supabase Storage bucket (`project-files`), not a stub. Path convention `{organization_id}/leads/{leadId}/surveys/{surveyId}/photos/...`; `storage.objects` RLS policies check `(storage.foldername(name))[1] = current_org_id()` plus `has_permission('surveys.*')`, mirroring the table-level policies. Categories (`survey_photo_categories`) are org-editable and each can be flagged mandatory; the UI shows which mandatory categories are still missing rather than blocking submission outright.
- **EB Bill Intelligence**: `eb_bills` is one row per customer per billing month (unique constraint), entered manually. No OCR/extraction provider is wired up — `extraction_confidence` and `source_document_path` exist in the schema for when one is, but today the dialog says so explicitly rather than faking a confidence score.
- **Engineering**: one `engineering_studies` row per lead (`unique(organization_id, lead_id)`), with versioned `engineering_revisions` (jsonb `inputs`/`outputs`, monotonically increasing `revision_number` assigned server-side by `create_engineering_revision()` — never computed client-side, to avoid a race between two people recalculating at once). The capacity math itself is a pure, unit-tested TypeScript function (`src/lib/engineering/capacity.ts` / `capacity.test.ts`) — deterministic, no model or AI involved, and every assumption it used is returned in an `assumptions: string[]` array that the UI renders verbatim rather than hiding.
- **BOM**: `generateDefaultBom()` (`src/lib/engineering/bom.ts`) turns a capacity result into a starting bill of materials — panel/inverter counts are exact, but cabling and connector quantities are heuristic (documented as "auto-estimated" in each item's specification) since there's no layout/takeoff tool yet. Rates default to ₹0: no vendor pricing is assumed. `bom_items.final_quantity` and `.estimated_amount` are Postgres generated columns (`quantity * (1 + wastage%) * rate`), so the arithmetic can't drift from what's displayed. `create_bom_from_revision()` assigns the next `version` server-side, same race-avoidance reasoning as revisions.

## Phased build plan

See `src/components/shared/phase-roadmap.tsx` for the same list rendered in-app on the Control Tower. Phase 3 (Survey + Engineering) is in progress; each subsequent phase adds one or more of the remaining modules with its own migrations, RLS policies and UI.
