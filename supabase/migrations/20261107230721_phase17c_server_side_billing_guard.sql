create or replace function private.company_has_billing_access(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select
      not s.enforcement_enabled
      or (s.manual_release_until is not null and s.manual_release_until > now())
      or (
        s.status not in ('suspended', 'canceled')
        and not (
          s.status = 'overdue'
          or (
            s.next_due_date is not null
            and current_date > s.next_due_date + p.grace_days
          )
        )
      )
    from public.company_subscriptions s
    join public.billing_plans p on p.id = s.plan_id
    where s.company_id = p_company_id
  ), true);
$$;

revoke all on function private.company_has_billing_access(uuid)
from public, anon;

grant execute on function private.company_has_billing_access(uuid)
to authenticated, service_role;

do $$
declare
  v_table text;
  v_policy text;
begin
  foreach v_table in array array[
    'company_members',
    'customers',
    'financial_categories',
    'financial_transactions',
    'inventory_movements',
    'product_categories',
    'products',
    'purchase_items',
    'purchases',
    'sale_items',
    'sales',
    'suppliers',
    'system_settings'
  ]
  loop
    v_policy := v_table || '_billing_insert_guard';
    execute format('drop policy if exists %I on public.%I', v_policy, v_table);
    execute format(
      'create policy %I on public.%I as restrictive for insert to authenticated with check (private.company_has_billing_access(company_id))',
      v_policy,
      v_table
    );

    v_policy := v_table || '_billing_update_guard';
    execute format('drop policy if exists %I on public.%I', v_policy, v_table);
    execute format(
      'create policy %I on public.%I as restrictive for update to authenticated using (private.company_has_billing_access(company_id)) with check (private.company_has_billing_access(company_id))',
      v_policy,
      v_table
    );

    v_policy := v_table || '_billing_delete_guard';
    execute format('drop policy if exists %I on public.%I', v_policy, v_table);
    execute format(
      'create policy %I on public.%I as restrictive for delete to authenticated using (private.company_has_billing_access(company_id))',
      v_policy,
      v_table
    );
  end loop;

  drop policy if exists companies_billing_update_guard on public.companies;
  create policy companies_billing_update_guard
  on public.companies as restrictive for update to authenticated
  using (private.company_has_billing_access(id))
  with check (private.company_has_billing_access(id));
end
$$;
