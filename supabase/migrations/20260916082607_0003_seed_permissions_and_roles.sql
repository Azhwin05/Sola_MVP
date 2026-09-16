-- Seed global permission catalog (module-level view/manage per nav module) --
insert into public.permissions (key, module, description) values
  ('control_tower.view','control_tower','View Control Tower dashboard'),
  ('leads.view','leads','View leads and CRM pipeline'),
  ('leads.manage','leads','Create/edit leads, activities, stage changes'),
  ('customers.view','customers','View customer records'),
  ('customers.manage','customers','Create/edit customer records'),
  ('surveys.view','surveys','View site surveys'),
  ('surveys.manage','surveys','Create/edit/submit/approve site surveys'),
  ('engineering.view','engineering','View engineering records, EB bills, BOM'),
  ('engineering.manage','engineering','Edit capacity calculations and BOM'),
  ('proposals.view','proposals','View proposals'),
  ('proposals.manage','proposals','Create/edit/send/approve proposals'),
  ('projects.view','projects','View project passport'),
  ('projects.manage','projects','Edit project status, tasks, milestones'),
  ('procurement.view','procurement','View RFQs, vendor quotes, POs'),
  ('procurement.manage','procurement','Create/approve RFQs and POs'),
  ('inventory.view','inventory','View inventory and stock movements'),
  ('inventory.manage','inventory','Record GRNs, issues, transfers, adjustments'),
  ('finance.view','finance','View invoices and payments'),
  ('finance.view_margin','finance','View project cost and margin data'),
  ('finance.manage','finance','Create invoices, record payments'),
  ('installation.view','installation','View installation milestones'),
  ('installation.manage','installation','Update installation progress and evidence'),
  ('qa.view','qa','View QA inspections and defects'),
  ('qa.manage','qa','Run inspections, raise/verify defects'),
  ('commissioning.view','commissioning','View commissioning records'),
  ('commissioning.manage','commissioning','Complete commissioning checklist'),
  ('monitoring.view','monitoring','View plant monitoring and telemetry'),
  ('om.view','om','View service tickets and AMC'),
  ('om.manage','om','Manage service tickets, AMC, warranty'),
  ('customer_portal.view','customer_portal','Customer self-service portal access'),
  ('documents.view','documents','View documents'),
  ('documents.manage','documents','Upload/version/manage documents'),
  ('communications.view','communications','View communication timeline'),
  ('communications.manage','communications','Send communications, manage templates'),
  ('reports.view','reports','View reports and analytics'),
  ('team.view','team','View team directory'),
  ('team.manage','team','Manage users and role assignments'),
  ('vendors.view','vendors','View vendor directory'),
  ('vendors.manage','vendors','Create/edit vendors'),
  ('settings.manage','settings','Manage organization settings'),
  ('audit_log.view','audit_log','View audit log')
;

-- Seed a default role template for a given organization ----------------------
create or replace function public.seed_default_roles(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role record;
  v_role_id uuid;
begin
  for v_role in
    select * from (values
      ('owner','Owner / Super Admin','Full access to every module', true),
      ('management','Management','Control Tower, projects, finance, procurement, analytics, customer visibility', false),
      ('sales_manager','Sales Manager','Leads, customers, proposals, sales analytics', false),
      ('sales_executive','Sales Executive','Assigned leads, follow-ups, customer communication, proposals', false),
      ('project_manager','Project Manager','Projects, surveys, tasks, procurement visibility, installation, QA, documents', false),
      ('site_engineer','Site Engineer / Field Engineer','Assigned surveys and site tasks, photos, checklists, installation updates', false),
      ('design_engineer','Design Engineer','Engineering, capacity calculations, layouts, BOM, technical documents', false),
      ('procurement_manager','Procurement Manager','Vendors, RFQs, purchase orders, GRNs, material allocation', false),
      ('store_warehouse','Store / Warehouse','Inventory, stock movements, GRN, issue/return', false),
      ('finance','Finance','Invoices, payments, GST, project costs, collections', false),
      ('qa_qc','QA/QC','Inspections, checklists, defects, approvals', false),
      ('om_engineer','O&M Engineer','Service tickets, monitoring, AMC, warranty', false),
      ('customer','Customer','Customer portal only', false)
    ) as t(key, name, description, is_owner)
  loop
    insert into public.roles (organization_id, key, name, description, is_system)
    values (p_org_id, v_role.key, v_role.name, v_role.description, true)
    on conflict (organization_id, key) do nothing
    returning id into v_role_id;

    if v_role_id is null then
      select id into v_role_id from public.roles where organization_id = p_org_id and key = v_role.key;
    end if;

    if v_role.is_owner then
      insert into public.role_permissions (role_id, permission_id)
      select v_role_id, id from public.permissions
      on conflict do nothing;
    end if;

    v_role_id := null;
  end loop;

  -- Management: view everything, manage nothing destructive by default
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'management'
    and (p.key like '%.view' or p.key = 'finance.view_margin')
  on conflict do nothing;

  -- Sales manager
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'sales_manager'
    and p.key in ('control_tower.view','leads.view','leads.manage','customers.view','customers.manage',
                  'proposals.view','proposals.manage','surveys.view','reports.view','documents.view','communications.view','communications.manage')
  on conflict do nothing;

  -- Sales executive
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'sales_executive'
    and p.key in ('control_tower.view','leads.view','leads.manage','customers.view','proposals.view','proposals.manage',
                  'documents.view','communications.view','communications.manage')
  on conflict do nothing;

  -- Project manager
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'project_manager'
    and p.key in ('control_tower.view','projects.view','projects.manage','surveys.view','surveys.manage',
                  'procurement.view','installation.view','installation.manage','qa.view','qa.manage',
                  'documents.view','documents.manage','communications.view','communications.manage','reports.view')
  on conflict do nothing;

  -- Site / field engineer
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'site_engineer'
    and p.key in ('surveys.view','surveys.manage','installation.view','installation.manage',
                  'qa.view','documents.view')
  on conflict do nothing;

  -- Design engineer
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'design_engineer'
    and p.key in ('engineering.view','engineering.manage','proposals.view','documents.view','documents.manage')
  on conflict do nothing;

  -- Procurement manager
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'procurement_manager'
    and p.key in ('control_tower.view','procurement.view','procurement.manage','vendors.view','vendors.manage',
                  'inventory.view','projects.view','documents.view','reports.view')
  on conflict do nothing;

  -- Store / warehouse
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'store_warehouse'
    and p.key in ('inventory.view','inventory.manage','procurement.view','documents.view')
  on conflict do nothing;

  -- Finance
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'finance'
    and p.key in ('control_tower.view','finance.view','finance.view_margin','finance.manage',
                  'projects.view','customers.view','reports.view','documents.view')
  on conflict do nothing;

  -- QA/QC
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'qa_qc'
    and p.key in ('qa.view','qa.manage','projects.view','documents.view')
  on conflict do nothing;

  -- O&M engineer
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'om_engineer'
    and p.key in ('om.view','om.manage','monitoring.view','customers.view','documents.view')
  on conflict do nothing;

  -- Customer (portal only)
  insert into public.role_permissions (role_id, permission_id)
  select r.id, p.id from public.roles r, public.permissions p
  where r.organization_id = p_org_id and r.key = 'customer'
    and p.key in ('customer_portal.view')
  on conflict do nothing;
end;
$$;

-- Bootstrap a brand-new organization + owner profile for the calling user ----
create or replace function public.bootstrap_organization(p_org_name text, p_org_slug text, p_full_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_owner_role_id uuid;
  v_uid uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'User already belongs to an organization';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.organizations (name, slug)
  values (p_org_name, p_org_slug)
  returning id into v_org_id;

  insert into public.profiles (id, organization_id, full_name, email)
  values (v_uid, v_org_id, p_full_name, coalesce(v_email, ''));

  insert into public.system_settings (organization_id) values (v_org_id);

  perform public.seed_default_roles(v_org_id);

  select id into v_owner_role_id from public.roles where organization_id = v_org_id and key = 'owner';

  insert into public.user_roles (user_id, role_id, organization_id)
  values (v_uid, v_owner_role_id, v_org_id);

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, after)
  values (v_org_id, v_uid, 'created', 'organization', v_org_id, jsonb_build_object('name', p_org_name));

  return v_org_id;
end;
$$;

-- Concurrency-safe numbering: PROP-2026-0001 style -----------------------
create or replace function public.next_number(p_entity_type text, p_format text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_year int := extract(year from now());
  v_seq int;
  v_format text := p_format;
begin
  if v_org_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_format is null then
    select numbering_formats->>p_entity_type into v_format
    from public.system_settings where organization_id = v_org_id;
  end if;

  if v_format is null then
    v_format := upper(left(p_entity_type, 4)) || '-{YYYY}-{SEQ:4}';
  end if;

  insert into public.numbering_sequences (organization_id, entity_type, year, last_value)
  values (v_org_id, p_entity_type, v_year, 1)
  on conflict (organization_id, entity_type, year)
  do update set last_value = public.numbering_sequences.last_value + 1
  returning last_value into v_seq;

  return replace(
    replace(v_format, '{YYYY}', v_year::text),
    '{SEQ:4}', lpad(v_seq::text, 4, '0')
  );
end;
$$;
