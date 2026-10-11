alter table public.sale_items
  add column if not exists product_code text,
  add column if not exists unit_cost numeric(14, 4) not null default 0;

create or replace function public.complete_sale(
  p_company_id uuid,
  p_payment_method public.payment_method,
  p_customer_id uuid default null,
  p_customer_name text default null,
  p_discount numeric default 0,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns public.sales
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_sale public.sales%rowtype;
  v_quantity numeric;
  v_unit_price numeric;
  v_item_discount numeric;
  v_gross_total numeric;
  v_item_total numeric;
  v_subtotal numeric := 0;
  v_item_discounts numeric := 0;
  v_total numeric;
  v_customer_name text;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if not exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = (select auth.uid())
      and cm.active
  ) then
    raise exception 'Usuário sem acesso à empresa informada.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Adicione pelo menos um produto à venda.';
  end if;

  if p_discount < 0 then
    raise exception 'O desconto geral não pode ser negativo.';
  end if;

  if (
    select count(*)
    from jsonb_array_elements(p_items)
  ) <> (
    select count(distinct (item->>'product_id'))
    from jsonb_array_elements(p_items) as item
  ) then
    raise exception 'O mesmo produto não pode aparecer mais de uma vez na venda.';
  end if;

  perform 1
  from public.products p
  where p.company_id = p_company_id
    and p.id in (
      select (item->>'product_id')::uuid
      from jsonb_array_elements(p_items) as item
    )
  order by p.id
  for update;

  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    select p.*
    into v_product
    from public.products p
    where p.company_id = p_company_id
      and p.id = (v_item->>'product_id')::uuid;

    if not found then
      raise exception 'Um dos produtos selecionados não existe ou está sem permissão de acesso.';
    end if;

    if v_product.status <> 'active' then
      raise exception 'O produto “%” está inativo.', v_product.name;
    end if;

    v_quantity := (v_item->>'quantity')::numeric;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_item_discount := coalesce((v_item->>'discount')::numeric, 0);

    if v_quantity <= 0 then
      raise exception 'A quantidade de “%” deve ser maior que zero.', v_product.name;
    end if;

    if v_unit_price <= 0 then
      raise exception 'O preço de venda de “%” deve ser maior que zero.', v_product.name;
    end if;

    v_gross_total := round(v_quantity * v_unit_price, 2);

    if v_item_discount < 0 or v_item_discount > v_gross_total then
      raise exception 'O desconto de “%” é inválido.', v_product.name;
    end if;

    if v_product.stock_quantity - v_quantity < 0
      and not v_product.allow_negative_stock then
      raise exception 'Estoque insuficiente para “%”.', v_product.name;
    end if;

    v_subtotal := v_subtotal + v_gross_total;
    v_item_discounts := v_item_discounts + v_item_discount;
  end loop;

  if p_discount > v_subtotal - v_item_discounts then
    raise exception 'O desconto geral é maior que o valor disponível da venda.';
  end if;

  v_total := round(v_subtotal - v_item_discounts - p_discount, 2);

  if p_customer_id is not null then
    select c.name
    into v_customer_name
    from public.customers c
    where c.company_id = p_company_id
      and c.id = p_customer_id
      and c.status = 'active';

    if not found then
      raise exception 'O cliente selecionado não foi encontrado ou está inativo.';
    end if;
  else
    v_customer_name := nullif(trim(p_customer_name), '');
  end if;

  insert into public.sales (
    company_id,
    customer_id,
    customer_name,
    status,
    payment_method,
    subtotal,
    discount,
    total,
    notes,
    completed_at,
    created_by
  ) values (
    p_company_id,
    p_customer_id,
    coalesce(v_customer_name, 'Cliente balcão'),
    'completed',
    p_payment_method,
    round(v_subtotal, 2),
    round(v_item_discounts + p_discount, 2),
    v_total,
    nullif(trim(p_notes), ''),
    now(),
    (select auth.uid())
  )
  returning * into v_sale;

  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    select p.*
    into v_product
    from public.products p
    where p.company_id = p_company_id
      and p.id = (v_item->>'product_id')::uuid;

    v_quantity := (v_item->>'quantity')::numeric;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_item_discount := coalesce((v_item->>'discount')::numeric, 0);
    v_gross_total := round(v_quantity * v_unit_price, 2);
    v_item_total := round(v_gross_total - v_item_discount, 2);

    insert into public.sale_items (
      company_id,
      sale_id,
      product_id,
      product_code,
      product_name,
      quantity,
      unit,
      unit_cost,
      unit_price,
      discount,
      total
    ) values (
      p_company_id,
      v_sale.id,
      v_product.id,
      v_product.sku,
      v_product.name,
      v_quantity,
      v_product.unit,
      v_product.purchase_price,
      v_unit_price,
      v_item_discount,
      v_item_total
    );

    update public.products
    set
      stock_quantity = stock_quantity - v_quantity,
      updated_at = now()
    where company_id = p_company_id
      and id = v_product.id;

    insert into public.inventory_movements (
      company_id,
      product_id,
      sale_id,
      movement_type,
      quantity,
      stock_before,
      stock_after,
      unit_cost,
      reason,
      notes,
      created_by
    ) values (
      p_company_id,
      v_product.id,
      v_sale.id,
      'sale',
      v_quantity,
      v_product.stock_quantity,
      v_product.stock_quantity - v_quantity,
      v_product.purchase_price,
      'sale',
      'Saída automática da venda VEN-' || lpad(v_sale.number::text, 6, '0') || '.',
      (select auth.uid())
    );
  end loop;

  return v_sale;
end;
$$;

create or replace function public.cancel_sale(
  p_company_id uuid,
  p_sale_id uuid,
  p_reason text
)
returns public.sales
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_sale public.sales%rowtype;
  v_item public.sale_items%rowtype;
  v_product public.products%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if nullif(trim(p_reason), '') is null then
    raise exception 'Informe o motivo do cancelamento.';
  end if;

  if not exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = (select auth.uid())
      and cm.active
  ) then
    raise exception 'Usuário sem acesso à empresa informada.';
  end if;

  select s.*
  into v_sale
  from public.sales s
  where s.company_id = p_company_id
    and s.id = p_sale_id
  for update;

  if not found then
    raise exception 'Venda não encontrada.';
  end if;

  if v_sale.status = 'cancelled' then
    raise exception 'Esta venda já foi cancelada.';
  end if;

  perform 1
  from public.products p
  where p.company_id = p_company_id
    and p.id in (
      select si.product_id
      from public.sale_items si
      where si.company_id = p_company_id
        and si.sale_id = p_sale_id
    )
  order by p.id
  for update;

  for v_item in
    select si.*
    from public.sale_items si
    where si.company_id = p_company_id
      and si.sale_id = p_sale_id
  loop
    select p.*
    into v_product
    from public.products p
    where p.company_id = p_company_id
      and p.id = v_item.product_id;

    update public.products
    set
      stock_quantity = stock_quantity + v_item.quantity,
      updated_at = now()
    where company_id = p_company_id
      and id = v_product.id;

    insert into public.inventory_movements (
      company_id,
      product_id,
      sale_id,
      movement_type,
      quantity,
      stock_before,
      stock_after,
      unit_cost,
      reason,
      notes,
      created_by
    ) values (
      p_company_id,
      v_product.id,
      v_sale.id,
      'sale_cancellation',
      v_item.quantity,
      v_product.stock_quantity,
      v_product.stock_quantity + v_item.quantity,
      v_item.unit_cost,
      'return',
      'Retorno automático pelo cancelamento da venda VEN-' ||
        lpad(v_sale.number::text, 6, '0') || '. Motivo: ' || trim(p_reason),
      (select auth.uid())
    );
  end loop;

  update public.sales
  set
    status = 'cancelled',
    cancellation_reason = trim(p_reason),
    cancelled_at = now(),
    updated_at = now()
  where company_id = p_company_id
    and id = p_sale_id
  returning * into v_sale;

  return v_sale;
end;
$$;

revoke all on function public.complete_sale(
  uuid, public.payment_method, uuid, text, numeric, text, jsonb
) from public, anon;
grant execute on function public.complete_sale(
  uuid, public.payment_method, uuid, text, numeric, text, jsonb
) to authenticated;

revoke all on function public.cancel_sale(uuid, uuid, text)
  from public, anon;
grant execute on function public.cancel_sale(uuid, uuid, text)
  to authenticated;
