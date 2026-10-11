alter table public.purchases
  add column if not exists other_expenses numeric(14,2) not null default 0
    check (other_expenses >= 0);

alter table public.purchase_items
  add column if not exists product_code text;

create or replace function public.save_purchase(
  p_company_id uuid,
  p_purchase_id uuid,
  p_supplier_id uuid,
  p_document_number text,
  p_purchase_date date,
  p_items jsonb,
  p_discount numeric,
  p_freight numeric,
  p_other_expenses numeric,
  p_notes text
) returns public.purchases
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_purchase public.purchases;
  v_supplier public.suppliers;
  v_subtotal numeric(14,2);
begin
  if not exists (
    select 1 from public.company_members
    where company_id = p_company_id and user_id = auth.uid() and active
  ) then raise exception 'Empresa não autorizada.'; end if;

  select * into v_supplier from public.suppliers
  where id = p_supplier_id and company_id = p_company_id and status = 'active';
  if not found then raise exception 'Fornecedor ativo não encontrado.'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Adicione ao menos um produto à compra.';
  end if;
  if coalesce(p_discount,0) < 0 or coalesce(p_freight,0) < 0 or coalesce(p_other_expenses,0) < 0 then
    raise exception 'Os valores adicionais da compra não podem ser negativos.';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as i(product_id uuid, quantity numeric, unit_cost numeric)
    where i.quantity <= 0 or i.unit_cost < 0
  ) then raise exception 'Existem itens com quantidade ou custo inválido.'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as i(product_id uuid, quantity numeric, unit_cost numeric)
    left join public.products p on p.id=i.product_id and p.company_id=p_company_id and p.status='active'
    where p.id is null
  ) then raise exception 'Um ou mais produtos não estão ativos.'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as i(product_id uuid, quantity numeric, unit_cost numeric)
    group by i.product_id having count(*) > 1
  ) then raise exception 'Não repita o mesmo produto na compra.'; end if;

  select round(sum(i.quantity*i.unit_cost),2) into v_subtotal
  from jsonb_to_recordset(p_items) as i(product_id uuid, quantity numeric, unit_cost numeric);
  if coalesce(p_discount,0) > v_subtotal + coalesce(p_freight,0) + coalesce(p_other_expenses,0) then
    raise exception 'O desconto não pode superar o valor da compra.';
  end if;

  if p_purchase_id is null then
    insert into public.purchases(company_id,supplier_id,supplier_name,status,document_number,subtotal,discount,freight,other_expenses,total,purchased_at,notes,created_by)
    values(p_company_id,v_supplier.id,coalesce(nullif(trim(v_supplier.trade_name),''),v_supplier.name),'draft',nullif(trim(p_document_number),''),v_subtotal,coalesce(p_discount,0),coalesce(p_freight,0),coalesce(p_other_expenses,0),v_subtotal-coalesce(p_discount,0)+coalesce(p_freight,0)+coalesce(p_other_expenses,0),p_purchase_date::timestamptz,nullif(trim(p_notes),''),auth.uid())
    returning * into v_purchase;
  else
    select * into v_purchase from public.purchases
    where id=p_purchase_id and company_id=p_company_id for update;
    if not found then raise exception 'Compra não encontrada.'; end if;
    if v_purchase.status <> 'draft' then raise exception 'Somente compras pendentes podem ser alteradas.'; end if;
    update public.purchases set supplier_id=v_supplier.id,supplier_name=coalesce(nullif(trim(v_supplier.trade_name),''),v_supplier.name),document_number=nullif(trim(p_document_number),''),subtotal=v_subtotal,discount=coalesce(p_discount,0),freight=coalesce(p_freight,0),other_expenses=coalesce(p_other_expenses,0),total=v_subtotal-coalesce(p_discount,0)+coalesce(p_freight,0)+coalesce(p_other_expenses,0),purchased_at=p_purchase_date::timestamptz,notes=nullif(trim(p_notes),''),updated_at=now()
    where id=p_purchase_id returning * into v_purchase;
    delete from public.purchase_items where company_id=p_company_id and purchase_id=p_purchase_id;
  end if;

  insert into public.purchase_items(company_id,purchase_id,product_id,product_code,product_name,unit,quantity,unit_cost,discount,total)
  select p_company_id,v_purchase.id,p.id,coalesce(p.sku,p.barcode,''),p.name,p.unit,i.quantity,i.unit_cost,0,round(i.quantity*i.unit_cost,2)
  from jsonb_to_recordset(p_items) as i(product_id uuid, quantity numeric, unit_cost numeric)
  join public.products p on p.id=i.product_id and p.company_id=p_company_id;
  return v_purchase;
end;
$$;

create or replace function public.complete_purchase(p_company_id uuid,p_purchase_id uuid,p_update_purchase_price boolean)
returns public.purchases language plpgsql security invoker set search_path=public as $$
declare v_purchase public.purchases; v_item public.purchase_items; v_product public.products;
begin
  select * into v_purchase from public.purchases where id=p_purchase_id and company_id=p_company_id for update;
  if not found then raise exception 'Compra não encontrada.'; end if;
  if v_purchase.status <> 'draft' then raise exception 'A compra não está pendente.'; end if;
  for v_item in select * from public.purchase_items where purchase_id=p_purchase_id and company_id=p_company_id order by product_id
  loop
    select * into v_product from public.products where id=v_item.product_id and company_id=p_company_id for update;
    update public.products set stock_quantity=stock_quantity+v_item.quantity,purchase_price=case when p_update_purchase_price then v_item.unit_cost else purchase_price end,updated_at=now() where id=v_product.id;
    insert into public.inventory_movements(company_id,product_id,purchase_id,movement_type,quantity,stock_before,stock_after,unit_cost,reason,notes,created_by)
    values(p_company_id,v_product.id,p_purchase_id,'entry',v_item.quantity,v_product.stock_quantity,v_product.stock_quantity+v_item.quantity,v_item.unit_cost,'purchase','Entrada pela compra '||v_purchase.number,auth.uid());
  end loop;
  update public.purchases set status='completed',completed_at=now(),updated_at=now() where id=p_purchase_id returning * into v_purchase;
  return v_purchase;
end;
$$;

create or replace function public.cancel_purchase(p_company_id uuid,p_purchase_id uuid,p_reason text)
returns public.purchases language plpgsql security invoker set search_path=public as $$
declare v_purchase public.purchases; v_item public.purchase_items; v_product public.products;
begin
  if trim(coalesce(p_reason,''))='' then raise exception 'Informe o motivo do cancelamento.'; end if;
  select * into v_purchase from public.purchases where id=p_purchase_id and company_id=p_company_id for update;
  if not found then raise exception 'Compra não encontrada.'; end if;
  if v_purchase.status='cancelled' then raise exception 'A compra já foi cancelada.'; end if;
  if v_purchase.status='completed' then
    for v_item in select * from public.purchase_items where purchase_id=p_purchase_id and company_id=p_company_id order by product_id
    loop
      select * into v_product from public.products where id=v_item.product_id and company_id=p_company_id for update;
      if not v_product.allow_negative_stock and v_product.stock_quantity < v_item.quantity then raise exception 'Estoque insuficiente para estornar o produto %.',v_product.name; end if;
      update public.products set stock_quantity=stock_quantity-v_item.quantity,updated_at=now() where id=v_product.id;
      insert into public.inventory_movements(company_id,product_id,purchase_id,movement_type,quantity,stock_before,stock_after,unit_cost,reason,notes,created_by)
      values(p_company_id,v_product.id,p_purchase_id,'exit',v_item.quantity,v_product.stock_quantity,v_product.stock_quantity-v_item.quantity,v_item.unit_cost,'return','Estorno da compra '||v_purchase.number,auth.uid());
    end loop;
  end if;
  update public.purchases set status='cancelled',cancelled_at=now(),cancellation_reason=trim(p_reason),updated_at=now() where id=p_purchase_id returning * into v_purchase;
  return v_purchase;
end;
$$;

grant execute on function public.save_purchase(uuid,uuid,uuid,text,date,jsonb,numeric,numeric,numeric,text) to authenticated;
grant execute on function public.complete_purchase(uuid,uuid,boolean) to authenticated;
grant execute on function public.cancel_purchase(uuid,uuid,text) to authenticated;
