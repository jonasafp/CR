create extension if not exists pgcrypto with schema extensions;

insert into public.companies (
  legal_name,
  trade_name,
  status
)
select
  'Jiah',
  'Jiah',
  'active'::public.registration_status
where not exists (
  select 1
  from public.companies
  where lower(trade_name) = 'jiah'
);

alter table public.company_members
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_change_requested_at timestamptz;

create table if not exists private.control_admins (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  user_id uuid unique references auth.users(id) on delete set null,
  username text not null,
  email text not null,
  password_hash text not null,
  must_change_password boolean not null default true,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint control_admins_username_format_check
    check (username = lower(trim(username)) and username ~ '^[a-z0-9._-]{3,40}$')
);

create unique index if not exists control_admins_username_idx
  on private.control_admins(lower(username));

alter table private.control_admins enable row level security;
revoke all on table private.control_admins from public, anon, authenticated;

insert into private.control_admins (
  company_id,
  username,
  email,
  password_hash,
  must_change_password
)
select
  c.id,
  'jiah',
  'jiah@control.gestorfacil.internal',
  extensions.crypt('1234', extensions.gen_salt('bf', 10)),
  true
from public.companies c
where lower(c.trade_name) = 'jiah'
  and not exists (
    select 1
    from private.control_admins ca
    where lower(ca.username) = 'jiah'
  )
order by c.created_at
limit 1;

create or replace function private.is_control_admin_user(
  p_user_id uuid
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.control_admins ca
    where ca.user_id = p_user_id
  );
$$;

revoke all on function private.is_control_admin_user(uuid)
  from public, anon, authenticated;
grant execute on function private.is_control_admin_user(uuid)
  to service_role;

create or replace function public.control_is_admin_user(
  p_user_id uuid
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_control_admin_user(p_user_id);
$$;

revoke all on function public.control_is_admin_user(uuid)
  from public, anon, authenticated;
grant execute on function public.control_is_admin_user(uuid)
  to service_role;

create or replace function public.control_verify_credentials(
  p_username text,
  p_password text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin private.control_admins;
begin
  select *
  into v_admin
  from private.control_admins
  where lower(username) = lower(trim(p_username))
  for update;

  if v_admin.id is null then
    perform pg_sleep(0.35);
    return null;
  end if;

  if v_admin.locked_until is not null
     and v_admin.locked_until > now() then
    return jsonb_build_object(
      'locked', true,
      'lockedUntil', v_admin.locked_until
    );
  end if;

  if v_admin.password_hash <> extensions.crypt(p_password, v_admin.password_hash) then
    update private.control_admins
    set
      failed_attempts = case
        when failed_attempts >= 4 then 0
        else failed_attempts + 1
      end,
      locked_until = case
        when failed_attempts >= 4 then now() + interval '15 minutes'
        else null
      end,
      updated_at = now()
    where id = v_admin.id;

    return null;
  end if;

  update private.control_admins
  set
    failed_attempts = 0,
    locked_until = null,
    updated_at = now()
  where id = v_admin.id;

  return jsonb_build_object(
    'id', v_admin.id,
    'companyId', v_admin.company_id,
    'userId', v_admin.user_id,
    'username', v_admin.username,
    'email', v_admin.email,
    'mustChangePassword', v_admin.must_change_password,
    'locked', false
  );
end;
$$;

revoke all on function public.control_verify_credentials(text, text)
  from public, anon, authenticated;
grant execute on function public.control_verify_credentials(text, text)
  to service_role;

create or replace function public.control_link_bootstrap_user(
  p_control_admin_id uuid,
  p_user_id uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin private.control_admins;
begin
  select *
  into v_admin
  from private.control_admins
  where id = p_control_admin_id
  for update;

  if v_admin.id is null then
    raise exception 'Administrador de controle não encontrado.';
  end if;

  if v_admin.user_id is not null then
    raise exception 'Administrador de controle já inicializado.';
  end if;

  update private.control_admins
  set user_id = p_user_id, updated_at = now()
  where id = v_admin.id;

  insert into public.company_members (
    company_id,
    user_id,
    role,
    active,
    full_name,
    email,
    invited_at,
    must_change_password
  ) values (
    v_admin.company_id,
    p_user_id,
    'owner'::public.company_member_role,
    true,
    'Administrador Jiah',
    v_admin.email,
    now(),
    true
  );
end;
$$;

revoke all on function public.control_link_bootstrap_user(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.control_link_bootstrap_user(uuid, uuid)
  to service_role;

create or replace function public.control_set_password(
  p_user_id uuid,
  p_password text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(p_password) < 8 then
    raise exception 'A nova senha deve possuir pelo menos 8 caracteres.';
  end if;

  update private.control_admins
  set
    password_hash = extensions.crypt(
      p_password,
      extensions.gen_salt('bf', 12)
    ),
    must_change_password = false,
    failed_attempts = 0,
    locked_until = null,
    updated_at = now()
  where user_id = p_user_id;

  if not found then
    raise exception 'Administrador de controle não encontrado.';
  end if;

  update public.company_members
  set
    must_change_password = false,
    password_change_requested_at = null,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

revoke all on function public.control_set_password(uuid, text)
  from public, anon, authenticated;
grant execute on function public.control_set_password(uuid, text)
  to service_role;

create or replace function public.control_mark_login(
  p_user_id uuid
) returns void
language sql
security definer
set search_path = ''
as $$
  update private.control_admins
  set last_login_at = now(), updated_at = now()
  where user_id = p_user_id;
$$;

revoke all on function public.control_mark_login(uuid)
  from public, anon, authenticated;
grant execute on function public.control_mark_login(uuid)
  to service_role;

create or replace function public.get_control_session()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'username', ca.username,
    'companyId', ca.company_id,
    'mustChangePassword', ca.must_change_password,
    'lastLoginAt', ca.last_login_at
  )
  from private.control_admins ca
  where ca.user_id = (select auth.uid());
$$;

revoke all on function public.get_control_session()
  from public, anon;
grant execute on function public.get_control_session()
  to authenticated;

create or replace function public.control_get_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not exists (
    select 1
    from private.control_admins ca
    where ca.user_id = (select auth.uid())
  ) then
    raise exception 'Acesso restrito ao sistema de controle.';
  end if;

  select jsonb_build_object(
    'overview', jsonb_build_object(
      'companies', (select count(*) from public.companies),
      'activeCompanies', (
        select count(*) from public.companies where status = 'active'
      ),
      'users', (select count(*) from public.company_members),
      'sales', (select count(*) from public.sales),
      'salesTotal', coalesce((
        select sum(total) from public.sales where status = 'completed'
      ), 0),
      'products', (select count(*) from public.products)
    ),
    'companies', coalesce((
      select jsonb_agg(company_row order by company_row->>'tradeName')
      from (
        select jsonb_build_object(
          'id', c.id,
          'legalName', c.legal_name,
          'tradeName', c.trade_name,
          'document', c.document,
          'email', c.email,
          'phone', c.phone,
          'city', c.city,
          'state', c.state,
          'status', c.status,
          'createdAt', c.created_at,
          'users', (select count(*) from public.company_members cm where cm.company_id = c.id),
          'products', (select count(*) from public.products p where p.company_id = c.id),
          'sales', (select count(*) from public.sales s where s.company_id = c.id),
          'salesTotal', coalesce((
            select sum(s.total)
            from public.sales s
            where s.company_id = c.id and s.status = 'completed'
          ), 0)
        ) as company_row
        from public.companies c
      ) rows
    ), '[]'::jsonb),
    'growth', coalesce((
      select jsonb_agg(jsonb_build_object(
        'month', to_char(month_start, 'YYYY-MM'),
        'companies', (
          select count(*)
          from public.companies c
          where date_trunc('month', c.created_at) <= month_start
        ),
        'sales', (
          select count(*)
          from public.sales s
          where date_trunc('month', s.created_at) = month_start
        )
      ) order by month_start)
      from generate_series(
        date_trunc('month', now()) - interval '5 months',
        date_trunc('month', now()),
        interval '1 month'
      ) month_start
    ), '[]'::jsonb),
    'database', jsonb_build_object(
      'companies', (select count(*) from public.companies),
      'members', (select count(*) from public.company_members),
      'products', (select count(*) from public.products),
      'customers', (select count(*) from public.customers),
      'sales', (select count(*) from public.sales),
      'saleItems', (select count(*) from public.sale_items),
      'financialTransactions', (select count(*) from public.financial_transactions),
      'inventoryMovements', (select count(*) from public.inventory_movements),
      'purchases', (select count(*) from public.purchases),
      'suppliers', (select count(*) from public.suppliers)
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.control_get_dashboard()
  from public, anon;
grant execute on function public.control_get_dashboard()
  to authenticated;

create or replace function public.control_get_company_users(
  p_company_id uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not exists (
    select 1
    from private.control_admins ca
    where ca.user_id = (select auth.uid())
  ) then
    raise exception 'Acesso restrito ao sistema de controle.';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', cm.id,
    'userId', cm.user_id,
    'internalCode', cm.internal_code,
    'fullName', cm.full_name,
    'email', cm.email,
    'role', cm.role,
    'active', cm.active,
    'mustChangePassword', cm.must_change_password,
    'createdAt', cm.created_at
  ) order by cm.full_name), '[]'::jsonb)
  into v_result
  from public.company_members cm
  where cm.company_id = p_company_id;

  return v_result;
end;
$$;

revoke all on function public.control_get_company_users(uuid)
  from public, anon;
grant execute on function public.control_get_company_users(uuid)
  to authenticated;

create index if not exists company_members_must_change_password_idx
  on public.company_members(user_id)
  where must_change_password;
