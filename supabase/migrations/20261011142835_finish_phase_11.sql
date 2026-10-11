alter type public.financial_transaction_status add value if not exists 'received';
alter type public.payment_method add value if not exists 'bank_slip';

alter table public.financial_transactions
  add column if not exists number bigint generated always as identity,
  add column if not exists source text not null default 'manual',
  add column if not exists category_name text not null default 'Outros',
  add column if not exists customer_or_supplier text,
  add column if not exists sale_number text,
  add column if not exists purchase_id uuid,
  add column if not exists purchase_number text,
  add column if not exists inventory_movement_id uuid,
  add column if not exists cancellation_reason text;

alter table public.financial_transactions
  drop constraint if exists financial_transactions_source_check;
alter table public.financial_transactions
  add constraint financial_transactions_source_check
  check (source in ('manual','sale','purchase','inventory','other'));

create unique index if not exists financial_transactions_company_number_idx
  on public.financial_transactions(company_id, number);
create unique index if not exists financial_transactions_company_sale_unique_idx
  on public.financial_transactions(company_id, sale_id);
create unique index if not exists financial_transactions_company_purchase_unique_idx
  on public.financial_transactions(company_id, purchase_id);
create index if not exists financial_transactions_company_source_idx
  on public.financial_transactions(company_id, source);

do $$ begin
  alter table public.financial_transactions
    add constraint financial_transactions_company_purchase_fkey
    foreign key (company_id, purchase_id)
    references public.purchases(company_id, id);
exception when duplicate_object then null; end $$;

create or replace function public.save_system_settings(
  p_company_id uuid,
  p_settings jsonb
) returns public.system_settings
language plpgsql
security invoker
set search_path = public
as $$
declare v_row public.system_settings;
begin
  if not exists (
    select 1 from public.company_members
    where company_id = p_company_id and user_id = auth.uid() and active
      and role in ('owner','admin','manager')
  ) then raise exception 'Você não possui permissão para alterar as configurações.'; end if;

  insert into public.system_settings(company_id, setting_key, setting_value)
  values(p_company_id, 'system', p_settings)
  on conflict (company_id, setting_key)
  do update set setting_value=excluded.setting_value, updated_at=now()
  returning * into v_row;

  update public.companies set
    legal_name=coalesce(nullif(trim(p_settings#>>'{business,legalName}'),''),legal_name),
    trade_name=coalesce(nullif(trim(p_settings#>>'{business,tradeName}'),''),trade_name),
    document=nullif(regexp_replace(coalesce(p_settings#>>'{business,document}',''),'\\D','','g'),''),
    state_registration=nullif(trim(p_settings#>>'{business,stateRegistration}'),''),
    email=nullif(trim(p_settings#>>'{business,email}'),''),
    phone=nullif(regexp_replace(coalesce(p_settings#>>'{business,phone}',''),'\\D','','g'),''),
    postal_code=nullif(regexp_replace(coalesce(p_settings#>>'{business,postalCode}',''),'\\D','','g'),''),
    street=nullif(trim(p_settings#>>'{business,street}'),''),
    address_number=nullif(trim(p_settings#>>'{business,number}'),''),
    complement=nullif(trim(p_settings#>>'{business,complement}'),''),
    neighborhood=nullif(trim(p_settings#>>'{business,neighborhood}'),''),
    city=nullif(trim(p_settings#>>'{business,city}'),''),
    state=nullif(upper(trim(p_settings#>>'{business,state}')),''),
    updated_at=now()
  where id=p_company_id;
  return v_row;
end;
$$;

grant execute on function public.save_system_settings(uuid,jsonb) to authenticated;
