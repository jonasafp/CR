create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  monthly_price numeric(12,2) not null check (monthly_price >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  warning_days smallint not null default 3 check (warning_days between 0 and 30),
  grace_days smallint not null default 0 check (grace_days between 0 and 30),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  plan_id uuid not null references public.billing_plans(id),
  status text not null default 'active'
    check (status in ('trial','active','due_soon','overdue','suspended','canceled','manual_release')),
  billing_day smallint check (billing_day between 1 and 28),
  started_at date not null default current_date,
  next_due_date date,
  trial_ends_at timestamptz,
  manual_release_until timestamptz,
  enforcement_enabled boolean not null default false,
  asaas_customer_id text unique,
  asaas_subscription_id text unique,
  last_payment_at timestamptz,
  last_reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_id uuid not null references public.company_subscriptions(id) on delete cascade,
  provider text not null default 'asaas' check (provider = 'asaas'),
  external_payment_id text unique,
  status text not null default 'pending'
    check (status in ('pending','confirmed','received','overdue','refunded','canceled','chargeback')),
  amount numeric(12,2) not null check (amount >= 0),
  due_date date not null,
  paid_at timestamptz,
  invoice_url text,
  bank_slip_url text,
  pix_payload text,
  pix_qr_expires_at timestamptz,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, due_date)
);

create schema if not exists private;

create table if not exists private.billing_webhook_events (
  id bigint generated always as identity primary key,
  provider text not null default 'asaas',
  external_event_id text not null,
  event_type text not null,
  external_payment_id text,
  payload jsonb not null,
  processing_status text not null default 'received'
    check (processing_status in ('received','processed','ignored','failed')),
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_event_id)
);

create table if not exists private.billing_audit_logs (
  id bigint generated always as identity primary key,
  company_id uuid references public.companies(id) on delete set null,
  actor_user_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.billing_plans enable row level security;
alter table public.company_subscriptions enable row level security;
alter table public.billing_invoices enable row level security;

create policy billing_plans_authenticated_read
on public.billing_plans for select to authenticated
using (active or private.is_control_admin_user((select auth.uid())));

create policy company_subscriptions_member_read
on public.company_subscriptions for select to authenticated
using (
  private.is_control_admin_user((select auth.uid()))
  or exists (
    select 1 from public.company_members cm
    where cm.company_id = company_subscriptions.company_id
      and cm.user_id = (select auth.uid())
      and cm.active
  )
);

create policy billing_invoices_member_read
on public.billing_invoices for select to authenticated
using (
  private.is_control_admin_user((select auth.uid()))
  or exists (
    select 1 from public.company_members cm
    where cm.company_id = billing_invoices.company_id
      and cm.user_id = (select auth.uid())
      and cm.active
  )
);

revoke all on public.billing_plans from anon;
revoke all on public.company_subscriptions from anon;
revoke all on public.billing_invoices from anon;
grant select on public.billing_plans to authenticated;
grant select on public.company_subscriptions to authenticated;
grant select on public.billing_invoices to authenticated;
revoke all on private.billing_webhook_events from anon, authenticated;
revoke all on private.billing_audit_logs from anon, authenticated;

insert into public.billing_plans(
  code,name,monthly_price,currency,warning_days,grace_days,active
)
values(
  'gestor_facil_essencial','Gestor Fácil Essencial',50,'BRL',3,0,true
)
on conflict(code) do nothing;

insert into public.company_subscriptions(company_id,plan_id,status,enforcement_enabled)
select c.id,p.id,'active',false
from public.companies c
cross join public.billing_plans p
where p.code='gestor_facil_essencial'
on conflict(company_id) do nothing;
CREATE OR REPLACE FUNCTION public.get_my_billing_status()
 RETURNS TABLE(company_id uuid, subscription_status text, access_allowed boolean, enforcement_enabled boolean, next_due_date date, days_until_due integer, warning_days integer, manual_release_until timestamp with time zone, invoice_id uuid, invoice_status text, invoice_amount numeric, invoice_url text, pix_payload text)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  select
    s.company_id,
    case
      when not s.enforcement_enabled then 'active'
      when s.manual_release_until is not null and s.manual_release_until > now() then 'manual_release'
      when s.status in ('suspended','canceled') then s.status
      when coalesce(i.status, '') = 'overdue'
        or (s.next_due_date is not null and current_date > s.next_due_date + p.grace_days)
        then 'overdue'
      when s.next_due_date is not null
        and s.next_due_date - current_date between 0 and p.warning_days
        then 'due_soon'
      else s.status
    end as subscription_status,
    (
      not s.enforcement_enabled
      or (s.manual_release_until is not null and s.manual_release_until > now())
      or (
        s.status not in ('suspended','canceled')
        and not (
          coalesce(i.status, '') = 'overdue'
          or (s.next_due_date is not null and current_date > s.next_due_date + p.grace_days)
        )
      )
    ) as access_allowed,
    s.enforcement_enabled,
    s.next_due_date,
    case when s.next_due_date is null then null
      else (s.next_due_date - current_date)::integer end,
    p.warning_days::integer,
    s.manual_release_until,
    i.id,
    i.status,
    i.amount,
    i.invoice_url,
    i.pix_payload
  from public.company_subscriptions s
  join public.billing_plans p on p.id = s.plan_id
  left join lateral (
    select bi.*
    from public.billing_invoices bi
    where bi.subscription_id = s.id
      and bi.status in ('pending','overdue')
    order by bi.due_date desc, bi.created_at desc
    limit 1
  ) i on true
  where exists (
    select 1 from public.company_members cm
    where cm.company_id = s.company_id
      and cm.user_id = (select auth.uid())
      and cm.active
  );
$function$

revoke all on function public.get_my_billing_status() from public,anon;
grant execute on function public.get_my_billing_status() to authenticated;
