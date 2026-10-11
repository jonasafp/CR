-- Fase 12: separa leitura e escrita por papel, mantendo o isolamento por empresa.

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
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
    execute format(
      'drop policy if exists %I on public.%I',
      v_table || '_member_access',
      v_table
    );

    execute format(
      'drop policy if exists %I on public.%I',
      v_table || '_member_select',
      v_table
    );

    execute format(
      'create policy %I on public.%I for select to authenticated using (
        exists (
          select 1 from public.company_members cm
          where cm.company_id = %I.company_id
            and cm.user_id = (select auth.uid())
            and cm.active
        )
      )',
      v_table || '_member_select',
      v_table,
      v_table
    );
  end loop;
end;
$$;

-- Cadastros e configurações: somente gestão.
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'customers',
    'product_categories',
    'purchase_items',
    'purchases',
    'suppliers',
    'system_settings'
  ]
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      v_table || '_manager_write',
      v_table
    );

    execute format(
      'create policy %I on public.%I for all to authenticated using (
        exists (
          select 1 from public.company_members cm
          where cm.company_id = %I.company_id
            and cm.user_id = (select auth.uid())
            and cm.active
            and cm.role in (''owner'', ''admin'', ''manager'')
        )
      ) with check (
        exists (
          select 1 from public.company_members cm
          where cm.company_id = %I.company_id
            and cm.user_id = (select auth.uid())
            and cm.active
            and cm.role in (''owner'', ''admin'', ''manager'')
        )
      )',
      v_table || '_manager_write',
      v_table,
      v_table,
      v_table
    );
  end loop;
end;
$$;

-- Operação de caixa: permite as gravações necessárias para concluir uma venda.
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'financial_categories',
    'financial_transactions',
    'inventory_movements',
    'products',
    'sale_items',
    'sales'
  ]
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      v_table || '_operator_write',
      v_table
    );

    execute format(
      'create policy %I on public.%I for all to authenticated using (
        exists (
          select 1 from public.company_members cm
          where cm.company_id = %I.company_id
            and cm.user_id = (select auth.uid())
            and cm.active
            and cm.role in (''owner'', ''admin'', ''manager'', ''cashier'')
        )
      ) with check (
        exists (
          select 1 from public.company_members cm
          where cm.company_id = %I.company_id
            and cm.user_id = (select auth.uid())
            and cm.active
            and cm.role in (''owner'', ''admin'', ''manager'', ''cashier'')
        )
      )',
      v_table || '_operator_write',
      v_table,
      v_table,
      v_table
    );
  end loop;
end;
$$;

-- As funções RPC nunca devem ser executáveis pela chave pública sem sessão.
revoke execute on function public.bootstrap_company(text, text, text)
  from public, anon;
revoke execute on function public.record_inventory_movement(
  uuid, uuid, public.inventory_movement_type, numeric, numeric,
  text, numeric, text, boolean, uuid, uuid
) from public, anon;
revoke execute on function public.complete_sale(
  uuid, public.payment_method, uuid, text, numeric, text, jsonb
) from public, anon;
revoke execute on function public.cancel_sale(uuid, uuid, text)
  from public, anon;
revoke execute on function public.save_purchase(
  uuid, uuid, uuid, text, date, jsonb, numeric, numeric, numeric, text
) from public, anon;
revoke execute on function public.complete_purchase(uuid, uuid, boolean)
  from public, anon;
revoke execute on function public.cancel_purchase(uuid, uuid, text)
  from public, anon;
revoke execute on function public.save_system_settings(uuid, jsonb)
  from public, anon;

grant execute on function public.bootstrap_company(text, text, text)
  to authenticated;
grant execute on function public.record_inventory_movement(
  uuid, uuid, public.inventory_movement_type, numeric, numeric,
  text, numeric, text, boolean, uuid, uuid
) to authenticated;
grant execute on function public.complete_sale(
  uuid, public.payment_method, uuid, text, numeric, text, jsonb
) to authenticated;
grant execute on function public.cancel_sale(uuid, uuid, text)
  to authenticated;
grant execute on function public.save_purchase(
  uuid, uuid, uuid, text, date, jsonb, numeric, numeric, numeric, text
) to authenticated;
grant execute on function public.complete_purchase(uuid, uuid, boolean)
  to authenticated;
grant execute on function public.cancel_purchase(uuid, uuid, text)
  to authenticated;
grant execute on function public.save_system_settings(uuid, jsonb)
  to authenticated;
