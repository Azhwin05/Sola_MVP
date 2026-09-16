# Database

Supabase project: `viryasys-solar-os` (`smnnvcsopumhsamypmnh`, region `ap-south-1`).

Schema is managed entirely through Supabase migrations (applied via the Supabase MCP `apply_migration` tool during development — mirror these as files under `supabase/migrations/` if you set up the Supabase CLI locally for future phases).

## Tables (Phase 1)

| Table | Purpose |
|---|---|
| `organizations` | Tenant root. Name, GSTIN, billing address, branding. |
| `profiles` | One row per `auth.users`, scoped to an `organization_id`. |
| `roles` | Per-organization RBAC roles (seeded from a 13-role template). |
| `permissions` | Global catalog of `module.view` / `module.manage` keys. |
| `role_permissions` | Join table: which permissions a role grants. |
| `user_roles` | Join table: which roles a profile holds. |
| `organization_invites` | One-time join links (token, role, optional email, expiry). |
| `audit_logs` | Append-only action log (actor, action, entity, before/after). |
| `system_settings` | One row per org: numbering formats, tax config, workflow config, notification config. |
| `numbering_sequences` | Concurrency-safe per-org/entity/year counters backing `next_number()`. |

## Tables (Phase 2)

| Table | Purpose |
|---|---|
| `lead_sources` | Org-editable lookup (Referral, Website, Cold Call, …), seeded on bootstrap. |
| `customers` | Customer profile: name, type, GSTIN, billing address. |
| `customer_contacts` | Multiple contacts per customer, one flagged `is_primary`. |
| `customer_sites` | Site addresses per customer — reused by Survey/Project modules later. |
| `leads` | Pipeline record with its own contact/company fields (doesn't require a `customers` row to exist yet), optional `customer_id`/`site_id` links, `lead_number` auto-generated via `next_number('lead')`. |
| `lead_activities` | CRM communication/history log (call/email/meeting/whatsapp/site_visit/stage_change/note) — distinct from `audit_logs`, which is the system-level change record. |

## Tables (Phase 3)

| Table | Purpose |
|---|---|
| `survey_photo_categories` | Org-editable photo categories for surveys, each optionally `is_mandatory`. |
| `site_surveys` | One row per survey — site/measurements/electrical/shadow/notes fields, `survey_number` auto-generated via `next_number('survey')`, `status` workflow. |
| `survey_photos` | Uploaded photo metadata (category, GPS, uploader) — the actual file lives in the `project-files` Storage bucket at `storage_path`. |
| `eb_bills` | One row per customer per billing month (`unique(customer_id, billing_month)`) — units consumed, demand, tariff, amount, paid status. |
| `engineering_studies` | One row per lead (`unique(organization_id, lead_id)`) — the container a lead's engineering work hangs off. |
| `engineering_revisions` | Versioned capacity calculations: `inputs`/`outputs` jsonb, `revision_number` assigned server-side (never client-computed) to avoid a race between concurrent recalculations. |
| `bom_headers` / `bom_items` | Versioned bill of materials generated from a specific `engineering_revisions` row. `bom_items.final_quantity` and `.estimated_amount` are Postgres **generated columns** (`quantity * (1 + wastage%) * rate`), not values the app computes and could drift from. |

## Tables (Phase 4)

| Table | Purpose |
|---|---|
| `proposal_versions` | Versioned proposal per lead (`unique(lead_id, version)`), linked to a specific `engineering_revisions`/`bom_headers` pair rather than duplicating equipment line items. `subtotal`/`tax_amount`/`total_amount` are Postgres generated columns. Direct `UPDATE`/`DELETE` only allowed while `status = 'draft'` — see RLS note below. |
| `projects` | The Project Passport. One row per project, `project_number` via `next_number('project')`, `status` workflow, `capacity_kwp`/`contract_value` carried over from the accepted proposal (or entered manually). |
| `project_milestones` | The 11 standard installation milestones, seeded automatically by `accept_proposal()` or `create_project()` via the shared `seed_default_project_milestones()` helper. |
| `project_tasks` | Task board items — `owner_id` and `created_by` are separate FKs to `profiles`, so embeds need `profiles!project_tasks_owner_id_fkey` to disambiguate. |
| `project_risks` | Open/mitigated/closed risks with impact/probability — open high-impact risks drive a project's health to `blocked`. |
| `project_events` | Project-scoped narrative timeline ("Status changed to Installation", "Project created from accepted proposal…") — distinct from `audit_logs`, same distinction as `lead_activities` vs `audit_logs` in Phase 2. |

## Tables (Phase 5, in progress — Vendors + RFQs only; POs/GRN/Inventory not yet built)

| Table | Purpose |
|---|---|
| `vendors` / `vendor_contacts` | Vendor directory, same shape as `customers`/`customer_contacts`. `vendor_number` via `next_number('vendor')`. |
| `rfqs` | Request-for-quote header, `rfq_number` via `next_number('rfq')`. Optionally linked to a `projects` row and a source `bom_headers` row. `status` workflow: `draft → sent → quotes_received → awarded \| cancelled`. |
| `rfq_items` | A **snapshot** of the source BOM's items at RFQ-creation time (`bom_item_id` kept only for traceability, `on delete set null`) — so a later BOM edit can't retroactively change what a vendor already quoted against. |
| `rfq_vendors` | Which vendors were invited to a given RFQ and their response status (`invited/quoted/declined`). |
| `rfq_vendor_quotes` | One quote per vendor per RFQ (manual entry by an internal user — no vendor portal yet, same "honest manual entry" pattern as `eb_bills`). Status-conditional RLS mirrors `proposal_versions`: only editable while the parent RFQ is `sent`/`quotes_received`. |
| `rfq_vendor_quote_items` | Per-item quoted rate; `quoted_amount` is a Postgres generated column (`quantity * quoted_rate`). |

A quote's total can't be a generated column (Postgres generated columns can't aggregate child rows), so `rfq_vendor_quote_totals` is a `security_invoker` **view** that sums `quoted_amount` fresh on every read — same "never let a displayed number drift from its source" rule as the generated columns elsewhere, just applied via a view instead.

- `create_rfq(title, project_id, bom_header_id, due_date, notes, vendor_ids[])` — creates the RFQ, snapshots the BOM's items into `rfq_items`, and invites the given vendors, all in one transaction.
- `send_rfq(rfq_id)` / `cancel_rfq(rfq_id, reason)` — status transitions.
- `submit_vendor_quote(rfq_id, vendor_id, ...)` — upserts a vendor's quote and its line items (manual entry).
- `award_rfq(rfq_id, quote_id)` — marks one quote `selected`, the rest `rejected` for that RFQ, freezes it as `awarded`, and logs a `project_events` entry when the RFQ is linked to a project.

## Storage

One private bucket, `project-files` (created via `insert into storage.buckets`, since no dedicated MCP tool provisions buckets — see migration `0016`). Path convention: `{organization_id}/...`. RLS on `storage.objects` mirrors the table-level pattern: `(storage.foldername(name))[1] = current_org_id()` plus a `has_permission()` check, so a photo/document is exactly as protected as the row that references it.

## Key functions

- `bootstrap_organization(org_name, org_slug, full_name)` — first-run org + owner setup (also seeds default lead sources and survey photo categories).
- `seed_default_roles(org_id)` / `seed_default_lead_sources(org_id)` / `seed_default_survey_photo_categories(org_id)` — internal helpers, not directly callable over the API.
- `create_invite(role_key, email?)` / `get_invite_preview(token)` / `accept_invite(token, full_name)` — invite lifecycle.
- `convert_lead_to_customer(lead_id)` — atomically creates a `customers` row + primary `customer_contacts` row from a lead's contact info and links `leads.customer_id`, in one transaction.
- `get_or_create_engineering_study(lead_id)` — idempotent: returns the existing study for a lead or creates one.
- `create_engineering_revision(study_id, inputs, outputs)` — appends a new revision with a server-assigned `revision_number`.
- `create_bom_from_revision(revision_id, items)` — creates a new `bom_headers` (server-assigned `version`) plus all its `bom_items` in one call.
- `create_proposal_version(lead_id, ...)` — creates a new draft version; `proposal_number` reused across a lead's versions, `version` assigned server-side.
- `send_proposal(version_id)` / `reject_proposal(version_id, reason)` / `archive_proposal(version_id)` — status transitions; only these RPCs (not direct client `UPDATE`) can move a proposal out of `draft`.
- `accept_proposal(version_id)` — idempotent: creates the `projects` row + 11 milestones + a `project_events` entry + bumps the lead to `won`, or returns the existing project if one's already there.
- `create_project(customer_id, ...)` — manual project creation (outside the proposal-accepted path), seeding the same 11 milestones via the shared `seed_default_project_milestones()` helper.
- `next_number(entity_type, format?)` — generates `PROP-2026-0001`-style numbers per the org's configured format.
- `current_org_id()`, `has_permission(key)`, `is_org_owner()` — RLS helper functions, called from both policies and the client.

## Multi-tenancy & RLS

RLS is enabled on every table above, and on `storage.objects` for the `project-files` bucket. Every policy scopes rows to `organization_id = current_org_id()`; management operations additionally require `is_org_owner()` or a specific `has_permission()` check. `anon` has no access to any table, any RPC except `get_invite_preview` (needed so an unauthenticated invitee can preview an invite before signing up), or any storage object.

`proposal_versions` is the one table with status-conditional RLS: `proposal_versions_update_draft`/`_delete_draft` only permit direct writes while `status = 'draft'`. Once sent/accepted/rejected/archived, a version is immutable from the client — only `send_proposal()`/`accept_proposal()`/`reject_proposal()`/`archive_proposal()` (`SECURITY DEFINER`, and none of them touch the commercial fields) can change its status. This is the "never overwrite a historical version" product rule enforced structurally, not just by UI convention.

## Regenerating TypeScript types

```bash
# via Supabase CLI, once linked:
supabase gen types typescript --project-id smnnvcsopumhsamypmnh > src/lib/types/database.ts
```

During this session types were generated via the Supabase MCP `generate_typescript_types` tool and pasted into `src/lib/types/database.ts` — keep that file in sync after every schema migration.
