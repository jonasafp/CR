alter table public.company_subscriptions
  add column if not exists monthly_price_override numeric(12,2)
  check (monthly_price_override is null or monthly_price_override > 0);
