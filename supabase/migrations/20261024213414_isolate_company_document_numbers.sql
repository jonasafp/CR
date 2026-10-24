-- Fase 14: torna a numeração dos documentos independente por empresa.
-- Os UUIDs continuam sendo as chaves técnicas; os números abaixo são apenas
-- identificadores operacionais visíveis para cada cliente.

lock table public.sales in share row exclusive mode;
lock table public.purchases in share row exclusive mode;
lock table public.financial_transactions in share row exclusive mode;

alter table public.sales
  alter column number drop identity if exists;

alter table public.purchases
  alter column number drop identity if exists;

alter table public.financial_transactions
  alter column number drop identity if exists;

-- Usa valores negativos temporários para não colidir com as restrições únicas
-- existentes durante a renumeração.
with numbered as (
  select
    id,
    -row_number() over (
      partition by company_id
      order by created_at, id
    )::bigint as new_number
  from public.sales
)
update public.sales as target
set number = numbered.new_number
from numbered
where target.id = numbered.id;

update public.sales
set number = -number;

with numbered as (
  select
    id,
    -row_number() over (
      partition by company_id
      order by created_at, id
    )::bigint as new_number
  from public.purchases
)
update public.purchases as target
set number = numbered.new_number
from numbered
where target.id = numbered.id;

update public.purchases
set number = -number;

with numbered as (
  select
    id,
    -row_number() over (
      partition by company_id
      order by created_at, id
    )::bigint as new_number
  from public.financial_transactions
)
update public.financial_transactions as target
set number = numbered.new_number
from numbered
where target.id = numbered.id;

update public.financial_transactions
set number = -number;

-- Mantém as referências textuais sincronizadas com os novos números locais.
update public.financial_transactions as transaction
set sale_number = 'VEN-' || lpad(sale.number::text, 6, '0')
from public.sales as sale
where transaction.company_id = sale.company_id
  and transaction.sale_id = sale.id;

update public.financial_transactions as transaction
set purchase_number = 'COM-' || lpad(purchase.number::text, 6, '0')
from public.purchases as purchase
where transaction.company_id = purchase.company_id
  and transaction.purchase_id = purchase.id;

create table if not exists private.company_document_counters (
  company_id uuid not null
    references public.companies(id)
    on delete cascade,
  document_type text not null
    check (document_type in ('sale', 'purchase', 'financial')),
  next_number bigint not null
    check (next_number > 0),
  updated_at timestamptz not null default now(),
  primary key (company_id, document_type)
);

revoke all on table private.company_document_counters
  from public, anon, authenticated;

insert into private.company_document_counters (
  company_id,
  document_type,
  next_number
)
select company.id, document.document_type, 1
from public.companies as company
cross join (
  values ('sale'), ('purchase'), ('financial')
) as document(document_type)
on conflict (company_id, document_type) do nothing;

update private.company_document_counters as counter
set
  next_number = greatest(source.next_number, 1),
  updated_at = now()
from (
  select company_id, 'sale'::text as document_type, max(number) + 1 as next_number
  from public.sales
  group by company_id

  union all

  select company_id, 'purchase'::text, max(number) + 1
  from public.purchases
  group by company_id

  union all

  select company_id, 'financial'::text, max(number) + 1
  from public.financial_transactions
  group by company_id
) as source
where counter.company_id = source.company_id
  and counter.document_type = source.document_type;

create or replace function private.assign_company_document_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_document_type text := tg_argv[0];
begin
  if new.company_id is null then
    raise exception 'A empresa é obrigatória para numerar o documento.';
  end if;

  if v_document_type not in ('sale', 'purchase', 'financial') then
    raise exception 'Tipo de documento inválido para numeração.';
  end if;

  insert into private.company_document_counters (
    company_id,
    document_type,
    next_number
  ) values (
    new.company_id,
    v_document_type,
    2
  )
  on conflict (company_id, document_type) do update
  set
    next_number = private.company_document_counters.next_number + 1,
    updated_at = now()
  returning next_number - 1 into new.number;

  return new;
end;
$$;

revoke all on function private.assign_company_document_number()
  from public, anon, authenticated;

drop trigger if exists assign_company_sale_number on public.sales;
create trigger assign_company_sale_number
before insert on public.sales
for each row
execute function private.assign_company_document_number('sale');

drop trigger if exists assign_company_purchase_number on public.purchases;
create trigger assign_company_purchase_number
before insert on public.purchases
for each row
execute function private.assign_company_document_number('purchase');

drop trigger if exists assign_company_financial_number
  on public.financial_transactions;
create trigger assign_company_financial_number
before insert on public.financial_transactions
for each row
execute function private.assign_company_document_number('financial');

alter table public.sales
  drop constraint if exists sales_number_positive;
alter table public.sales
  add constraint sales_number_positive check (number > 0);

alter table public.purchases
  drop constraint if exists purchases_number_positive;
alter table public.purchases
  add constraint purchases_number_positive check (number > 0);

alter table public.financial_transactions
  drop constraint if exists financial_transactions_company_number_unique;
alter table public.financial_transactions
  add constraint financial_transactions_company_number_unique
  unique (company_id, number);

alter table public.financial_transactions
  drop constraint if exists financial_transactions_number_positive;
alter table public.financial_transactions
  add constraint financial_transactions_number_positive check (number > 0);
