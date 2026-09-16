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

## Key functions

- `bootstrap_organization(org_name, org_slug, full_name)` — first-run org + owner setup (also seeds default lead sources).
- `seed_default_roles(org_id)` / `seed_default_lead_sources(org_id)` — internal helpers, not directly callable over the API.
- `create_invite(role_key, email?)` / `get_invite_preview(token)` / `accept_invite(token, full_name)` — invite lifecycle.
- `convert_lead_to_customer(lead_id)` — atomically creates a `customers` row + primary `customer_contacts` row from a lead's contact info and links `leads.customer_id`, in one transaction.
- `next_number(entity_type, format?)` — generates `PROP-2026-0001`-style numbers per the org's configured format.
- `current_org_id()`, `has_permission(key)`, `is_org_owner()` — RLS helper functions, called from both policies and the client.

## Multi-tenancy & RLS

RLS is enabled on every table above. Every policy scopes rows to `organization_id = current_org_id()`; management operations additionally require `is_org_owner()` or a specific `has_permission()` check. `anon` has no access to any table or to any RPC except `get_invite_preview` (needed so an unauthenticated invitee can preview an invite before signing up).

## Regenerating TypeScript types

```bash
# via Supabase CLI, once linked:
supabase gen types typescript --project-id smnnvcsopumhsamypmnh > src/lib/types/database.ts
```

During this session types were generated via the Supabase MCP `generate_typescript_types` tool and pasted into `src/lib/types/database.ts` — keep that file in sync after every schema migration.
