# Architecture

Solar Business OS — Phase 4 (Proposal + Project) in progress, Phases 1-3 complete.

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

Built end-to-end (real data, real RLS, real auth): organization bootstrap, invites, team directory, role overview, organization profile settings, numbering-format settings, audit log, **Leads & CRM**, **Customers**, **Site Surveys**, **EB Bill Intelligence**, **Engineering (capacity + BOM)**, **Proposals**, **Projects**.

Scaffolded (routed, but showing an honest "coming in Phase N" state, not fake data): Procurement, Inventory, Installation execution, QA/QC, Finance, Monitoring, O&M, Customer Portal, Documents, Communications, Reports, Vendors.

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

## Proposal + Project (Phase 4)

- **Proposals reuse the BOM, not re-enter it**: `proposal_versions` links to a specific `engineering_revisions` row and `bom_headers` row rather than copying equipment line items into a `proposal_items` table — the equipment list shown in the preview and PDF is read live from the linked BOM. This is the "single source of truth" rule applied directly: the same numbers a design engineer computed can't silently drift from what a customer sees.
- **Versioning with real immutability**: all commercial fields (`equipment_cost`, `installation_cost`, `discount`, `tax_rate_percent`, …) plus `subtotal`/`tax_amount`/`total_amount` as Postgres generated columns. `proposal_number` is shared across a lead's versions; `version` is assigned server-side. RLS enforces the "never overwrite a historical version" rule structurally, not just by convention: `proposal_versions_update_draft` only allows direct `UPDATE`/`DELETE` while `status = 'draft'` — once a version is `sent`, `accepted`, `rejected` or `archived`, the only way to change its status is through the matching `SECURITY DEFINER` RPC (`send_proposal` / `accept_proposal` / `reject_proposal` / `archive_proposal`), and none of those RPCs touch the commercial fields.
- **GST, computed not hardcoded**: `tax_rate_percent` and `is_interstate` are per-proposal fields (default 18%, editable), not a constant baked into a calculation — CGST+SGST vs IGST labeling is derived from `is_interstate` at render time in `proposal-preview.tsx`, matching the spec's "don't hardcode tax calculations throughout the app" rule.
- **PDF via print, not a new dependency**: "Generate PDF" is a styled, branded HTML document (`proposal-preview.tsx`) with a print stylesheet, exported via the browser's native print-to-PDF (`window.print()`). This keeps the bundle lean and is a standard, real technique — not a fake button, since the document itself pulls live data (org branding, capacity output, BOM equipment summary, commercial terms).
- **Accept → Project automation**: `accept_proposal()` is idempotent (returns the existing project if one already exists for that lead rather than creating a duplicate), bumps the lead to `stage = 'won'`, creates the `projects` row, and seeds the 11 standard installation milestones via the shared `seed_default_project_milestones()` helper — the same helper `create_project()` uses for manually-created projects, so both paths produce identical milestone sets.
- **Project health is computed, not stored**: `src/lib/projects/health.ts` (unit-tested, `health.test.ts`) derives `healthy | at_risk | delayed | blocked` from real signals only — open high-impact risks (blocking), an elapsed target COD on a non-terminal project (delayed), overdue tasks or an imminent COD while still in an early status (at risk). Every result includes a `reasons: string[]` so a health badge is never just a color with no explanation, per the spec's "No Surprise" rule.
- **Timeline vs. Audit Log**: `project_events` is a project-scoped narrative ("Project created from accepted proposal…", "Status changed to Installation") shown on the Timeline tab, distinct from `audit_logs` (system-level before/after record) shown on the Audit tab — same distinction already established between `lead_activities` and `audit_logs` in Phase 2.
- **Tasks**: a Kanban board only (list/calendar views aren't built) — `project_tasks` has `owner_id` and `created_by` as two separate FKs to `profiles`, so embedded queries need `profiles!project_tasks_owner_id_fkey` to disambiguate which relationship PostgREST should follow.

## Phased build plan

See `src/components/shared/phase-roadmap.tsx` for the same list rendered in-app on the Control Tower. Phase 4 (Proposal + Project) is in progress; each subsequent phase adds one or more of the remaining modules with its own migrations, RLS policies and UI.
