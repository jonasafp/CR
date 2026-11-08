create or replace function private.ensure_company_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan_id uuid;
begin
  select id into v_plan_id
  from public.billing_plans
  where code = 'gestor_facil_essencial'
  limit 1;

  if v_plan_id is not null then
    insert into public.company_subscriptions(
      company_id,
      plan_id,
      status,
      enforcement_enabled
    )
    values (
      new.id,
      v_plan_id,
      'active',
      false
    )
    on conflict (company_id) do nothing;
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'companies_ensure_subscription'
      and tgrelid = 'public.companies'::regclass
  ) then
    create trigger companies_ensure_subscription
    after insert on public.companies
    for each row execute function private.ensure_company_subscription();
  end if;
end
$$;

create or replace function public.control_write_billing_audit(
  p_company_id uuid,
  p_actor_user_id uuid,
  p_action text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_control_admin_user(p_actor_user_id) then
    raise exception 'Acesso administrativo inválido.';
  end if;

  insert into private.billing_audit_logs(
    company_id,
    actor_user_id,
    action,
    details
  )
  values (
    p_company_id,
    p_actor_user_id,
    p_action,
    coalesce(p_details, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.control_write_billing_audit(uuid,uuid,text,jsonb)
from public, anon, authenticated;

grant execute on function public.control_write_billing_audit(uuid,uuid,text,jsonb)
to service_role;
