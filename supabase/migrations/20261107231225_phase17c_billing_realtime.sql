do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'billing_invoices'
  ) then
    alter publication supabase_realtime
      add table public.billing_invoices;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'company_subscriptions'
  ) then
    alter publication supabase_realtime
      add table public.company_subscriptions;
  end if;
end
$$;
