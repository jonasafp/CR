alter table public.company_members
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists invited_at timestamptz,
  add column if not exists invited_by uuid references auth.users(id) on delete set null;

update public.company_members cm
set
  full_name = coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(u.email, '@', 1),
    'Usuário'
  ),
  email = lower(u.email)
from auth.users u
where u.id = cm.user_id
  and (cm.full_name is null or cm.email is null);

create unique index if not exists company_members_company_email_idx
  on public.company_members(company_id, lower(email));

create or replace function private.is_company_access_admin(
  p_company_id uuid
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = (select auth.uid())
      and cm.active
      and cm.role in ('owner', 'admin')
  );
$$;

revoke all on function private.is_company_access_admin(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_company_access_admin(uuid) to authenticated;

drop policy if exists company_members_admin_select
  on public.company_members;

create policy company_members_admin_select
on public.company_members
for select
to authenticated
using (private.is_company_access_admin(company_id));

revoke insert, update, delete on public.company_members
  from anon, authenticated;
grant select on public.company_members to authenticated;
