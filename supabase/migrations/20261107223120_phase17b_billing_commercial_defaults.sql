update public.billing_plans
set monthly_price=50,warning_days=3,grace_days=0,updated_at=now()
where code='gestor_facil_essencial';
