alter table public.company_members
  add column if not exists internal_code bigint;

with numbered as (
  select
    id,
    row_number() over (
      partition by company_id
      order by
        case when role = 'owner' then 0 else 1 end,
        created_at,
        id
    ) as code
  from public.company_members
)
update public.company_members cm
set internal_code = numbered.code
from numbered
where numbered.id = cm.id
  and cm.internal_code is null;

create table if not exists private.company_employee_counters (
  company_id uuid primary key references public.companies(id) on delete cascade,
  next_code bigint not null check (next_code > 0)
);

insert into private.company_employee_counters(company_id, next_code)
select company_id, coalesce(max(internal_code), 0) + 1
from public.company_members
group by company_id
on conflict (company_id) do update
set next_code = greatest(
  private.company_employee_counters.next_code,
  excluded.next_code
);

create or replace function private.assign_company_member_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.internal_code is null then
    insert into private.company_employee_counters(company_id, next_code)
    values (new.company_id, 2)
    on conflict (company_id) do update
      set next_code = private.company_employee_counters.next_code + 1
    returning next_code - 1 into new.internal_code;
  end if;

  return new;
end;
$$;

drop trigger if exists assign_company_member_code
  on public.company_members;

create trigger assign_company_member_code
before insert on public.company_members
for each row execute function private.assign_company_member_code();

alter table public.company_members
  alter column internal_code set not null;

create unique index if not exists company_members_company_internal_code_idx
  on public.company_members(company_id, internal_code);

alter table public.sales
  add column if not exists seller_name text;

update public.sales s
set seller_name = coalesce(
  nullif(trim(cm.full_name), ''),
  nullif(trim(cm.email), ''),
  'Usuário do sistema'
)
from public.company_members cm
where cm.company_id = s.company_id
  and cm.user_id = s.created_by
  and s.seller_name is null;

update public.sales
set seller_name = 'Usuário do sistema'
where seller_name is null;

alter table public.sales
  alter column seller_name set default 'Usuário do sistema',
  alter column seller_name set not null;

create or replace function private.assign_sale_seller()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := coalesce(new.created_by, (select auth.uid()));
begin
  new.created_by := v_user_id;

  select coalesce(
    nullif(trim(cm.full_name), ''),
    nullif(trim(cm.email), ''),
    'Usuário do sistema'
  )
  into new.seller_name
  from public.company_members cm
  where cm.company_id = new.company_id
    and cm.user_id = v_user_id
    and cm.active
  limit 1;

  new.seller_name := coalesce(new.seller_name, 'Usuário do sistema');
  return new;
end;
$$;

drop trigger if exists assign_sale_seller on public.sales;

create trigger assign_sale_seller
before insert on public.sales
for each row execute function private.assign_sale_seller();

revoke all on table private.company_employee_counters
  from public, anon, authenticated;
revoke all on function private.assign_company_member_code()
  from public, anon, authenticated;
revoke all on function private.assign_sale_seller()
  from public, anon, authenticated;
