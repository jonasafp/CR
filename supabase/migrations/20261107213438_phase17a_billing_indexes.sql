create index if not exists company_subscriptions_due_idx
  on public.company_subscriptions(enforcement_enabled,next_due_date)
  where status <> 'canceled';
create index if not exists company_subscriptions_plan_id_idx
  on public.company_subscriptions(plan_id);
create index if not exists billing_invoices_company_due_idx
  on public.billing_invoices(company_id,due_date desc);
create index if not exists billing_invoices_subscription_id_idx
  on public.billing_invoices(subscription_id);
create index if not exists billing_webhook_events_payment_idx
  on private.billing_webhook_events(external_payment_id)
  where external_payment_id is not null;
create index if not exists billing_audit_logs_company_id_idx
  on private.billing_audit_logs(company_id);
