alter table public.inventory_movements
  add column if not exists purchase_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inventory_movements_company_purchase_fkey'
      and conrelid = 'public.inventory_movements'::regclass
  ) then
    alter table public.inventory_movements
      add constraint inventory_movements_company_purchase_fkey
      foreign key (company_id, purchase_id)
      references public.purchases (company_id, id);
  end if;
end;
$$;

create index if not exists inventory_movements_company_purchase_idx
  on public.inventory_movements (company_id, purchase_id);

create or replace function public.record_inventory_movement(
  p_company_id uuid,
  p_product_id uuid,
  p_movement_type public.inventory_movement_type,
  p_quantity numeric,
  p_stock_change numeric,
  p_reason text default null,
  p_unit_cost numeric default null,
  p_notes text default null,
  p_update_purchase_price boolean default false,
  p_sale_id uuid default null,
  p_purchase_id uuid default null
)
returns public.inventory_movements
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_product public.products%rowtype;
  v_stock_after numeric;
  v_movement public.inventory_movements%rowtype;
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

  if p_quantity <= 0 then
    raise exception 'A quantidade deve ser maior que zero.';
  end if;

  if p_stock_change = 0 or abs(p_stock_change) <> p_quantity then
    raise exception 'A alteração do estoque não corresponde à quantidade informada.';
  end if;

  if p_unit_cost is not null and p_unit_cost < 0 then
    raise exception 'O custo unitário não pode ser negativo.';
  end if;

  select p.*
  into v_product
  from public.products p
  where p.company_id = p_company_id
    and p.id = p_product_id
  for update;

  if not found then
    raise exception 'Produto não encontrado ou sem permissão de acesso.';
  end if;

  if v_product.status <> 'active' then
    raise exception 'Não é possível movimentar um produto inativo.';
  end if;

  v_stock_after := v_product.stock_quantity + p_stock_change;

  if v_stock_after < 0 and not v_product.allow_negative_stock then
    raise exception 'A movimentação deixaria o produto com estoque negativo.';
  end if;

  update public.products
  set
    stock_quantity = v_stock_after,
    purchase_price = case
      when p_update_purchase_price and p_unit_cost is not null
        then p_unit_cost
      else purchase_price
    end,
    updated_at = now()
  where company_id = p_company_id
    and id = p_product_id;

  insert into public.inventory_movements (
    company_id,
    product_id,
    sale_id,
    purchase_id,
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
    p_product_id,
    p_sale_id,
    p_purchase_id,
    p_movement_type,
    p_quantity,
    v_product.stock_quantity,
    v_stock_after,
    p_unit_cost,
    nullif(trim(p_reason), ''),
    nullif(trim(p_notes), ''),
    (select auth.uid())
  )
  returning * into v_movement;

  return v_movement;
end;
$$;

revoke all on function public.record_inventory_movement(
  uuid,
  uuid,
  public.inventory_movement_type,
  numeric,
  numeric,
  text,
  numeric,
  text,
  boolean,
  uuid,
  uuid
) from public, anon;

grant execute on function public.record_inventory_movement(
  uuid,
  uuid,
  public.inventory_movement_type,
  numeric,
  numeric,
  text,
  numeric,
  text,
  boolean,
  uuid,
  uuid
) to authenticated;
