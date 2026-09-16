create or replace function public.convert_lead_to_customer(p_lead_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid := public.current_org_id();
  v_lead public.leads;
  v_customer_id uuid;
begin
  if v_org_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.has_permission('customers.manage') then
    raise exception 'Not authorized to create customers';
  end if;

  select * into v_lead from public.leads where id = p_lead_id and organization_id = v_org_id;
  if v_lead.id is null then
    raise exception 'Lead not found';
  end if;
  if v_lead.customer_id is not null then
    raise exception 'Lead is already linked to a customer';
  end if;

  insert into public.customers (organization_id, name, customer_type, created_by)
  values (v_org_id, coalesce(nullif(v_lead.company_name, ''), v_lead.contact_name), v_lead.project_type, auth.uid())
  returning id into v_customer_id;

  insert into public.customer_contacts (organization_id, customer_id, name, phone, email, is_primary)
  values (v_org_id, v_customer_id, v_lead.contact_name, v_lead.contact_phone, v_lead.contact_email, true);

  update public.leads set customer_id = v_customer_id where id = p_lead_id;

  insert into public.audit_logs (organization_id, actor_id, action, entity_type, entity_id, after)
  values (v_org_id, auth.uid(), 'converted', 'lead', p_lead_id, jsonb_build_object('customer_id', v_customer_id));

  return v_customer_id;
end;
$$;

revoke all on function public.convert_lead_to_customer(uuid) from public, anon;
grant execute on function public.convert_lead_to_customer(uuid) to authenticated;
