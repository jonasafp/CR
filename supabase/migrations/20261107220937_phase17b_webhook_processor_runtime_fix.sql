CREATE OR REPLACE FUNCTION public.process_asaas_webhook(p_event_id text, p_event_type text, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_payment jsonb := coalesce(p_payload->'payment', '{}'::jsonb);
  v_payment_id text := nullif(v_payment->>'id', '');
  v_subscription_id text := nullif(v_payment->>'subscription', '');
  v_external_reference text := nullif(v_payment->>'externalReference', '');
  v_subscription public.company_subscriptions%rowtype;
  v_invoice_status text;
  v_due_date date;
  v_paid_at timestamptz;
  v_row_count integer := 0;
begin
  insert into private.billing_webhook_events(
    provider, external_event_id, event_type, external_payment_id, payload
  )
  values ('asaas', p_event_id, p_event_type, v_payment_id, p_payload)
  on conflict (provider, external_event_id) do nothing;

  get diagnostics v_row_count = row_count;
  if v_row_count = 0 then
    return jsonb_build_object('accepted', true, 'duplicate', true);
  end if;

  if v_payment_id is null or p_event_type not like 'PAYMENT_%' then
    update private.billing_webhook_events
       set processing_status='ignored', processed_at=now()
     where provider='asaas' and external_event_id=p_event_id;
    return jsonb_build_object('accepted', true, 'ignored', true);
  end if;

  if v_subscription_id is not null then
    select * into v_subscription
      from public.company_subscriptions
     where asaas_subscription_id=v_subscription_id
     limit 1;
  end if;

  if v_subscription.id is null and v_external_reference is not null
     and v_external_reference ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    select * into v_subscription
      from public.company_subscriptions
     where company_id=v_external_reference::uuid
     limit 1;
  end if;

  if v_subscription.id is null then
    update private.billing_webhook_events
       set processing_status='ignored',
           processing_error='Assinatura local não encontrada',
           processed_at=now()
     where provider='asaas' and external_event_id=p_event_id;
    return jsonb_build_object('accepted', true, 'ignored', true, 'reason', 'subscription_not_found');
  end if;

  v_invoice_status := case upper(coalesce(v_payment->>'status',''))
    when 'PENDING' then 'pending'
    when 'CONFIRMED' then 'confirmed'
    when 'RECEIVED' then 'received'
    when 'RECEIVED_IN_CASH' then 'received'
    when 'OVERDUE' then 'overdue'
    when 'REFUNDED' then 'refunded'
    when 'PARTIALLY_REFUNDED' then 'refunded'
    when 'DELETED' then 'canceled'
    when 'CHARGEBACK_REQUESTED' then 'chargeback'
    when 'CHARGEBACK_DISPUTE' then 'chargeback'
    when 'AWAITING_CHARGEBACK_REVERSAL' then 'chargeback'
    else case
      when p_event_type='PAYMENT_RECEIVED' then 'received'
      when p_event_type='PAYMENT_CONFIRMED' then 'confirmed'
      when p_event_type='PAYMENT_OVERDUE' then 'overdue'
      when p_event_type in ('PAYMENT_REFUNDED','PAYMENT_PARTIALLY_REFUNDED') then 'refunded'
      when p_event_type='PAYMENT_DELETED' then 'canceled'
      when p_event_type='PAYMENT_RESTORED' then 'pending'
      when p_event_type like '%CHARGEBACK%' then 'chargeback'
      else 'pending'
    end
  end;

  v_due_date := coalesce(nullif(v_payment->>'dueDate','')::date, current_date);
  v_paid_at := case when v_invoice_status in ('confirmed','received')
    then coalesce(
      nullif(v_payment->>'paymentDate','')::date::timestamptz,
      nullif(v_payment->>'clientPaymentDate','')::date::timestamptz,
      now()
    )
    else null
  end;

  insert into public.billing_invoices(
    company_id, subscription_id, provider, external_payment_id, status,
    amount, due_date, paid_at, invoice_url, bank_slip_url, description
  )
  values (
    v_subscription.company_id, v_subscription.id, 'asaas', v_payment_id,
    v_invoice_status, coalesce((v_payment->>'value')::numeric, 0),
    v_due_date, v_paid_at, nullif(v_payment->>'invoiceUrl',''),
    nullif(v_payment->>'bankSlipUrl',''), nullif(v_payment->>'description','')
  )
  on conflict (external_payment_id) do update set
    status=excluded.status,
    amount=excluded.amount,
    due_date=excluded.due_date,
    paid_at=coalesce(excluded.paid_at, public.billing_invoices.paid_at),
    invoice_url=coalesce(excluded.invoice_url, public.billing_invoices.invoice_url),
    bank_slip_url=coalesce(excluded.bank_slip_url, public.billing_invoices.bank_slip_url),
    description=coalesce(excluded.description, public.billing_invoices.description),
    updated_at=now();

  if v_invoice_status in ('confirmed','received') then
    update public.company_subscriptions
       set status='active',
           last_payment_at=coalesce(v_paid_at, now()),
           next_due_date=(v_due_date + interval '1 month')::date,
           last_reconciled_at=now()
     where id=v_subscription.id;
  elsif v_invoice_status='overdue' then
    update public.company_subscriptions
       set status='overdue',
           next_due_date=v_due_date,
           last_reconciled_at=now()
     where id=v_subscription.id;
  else
    update public.company_subscriptions
       set status=case
         when v_due_date-current_date between 0 and 3 then 'due_soon'
         else status
       end,
       next_due_date=v_due_date,
       last_reconciled_at=now()
     where id=v_subscription.id;
  end if;

  insert into private.billing_audit_logs(company_id, action, details)
  values (
    v_subscription.company_id,
    'asaas_webhook_' || lower(p_event_type),
    jsonb_build_object('event_id',p_event_id,'payment_id',v_payment_id,'status',v_invoice_status)
  );

  update private.billing_webhook_events
     set processing_status='processed', processed_at=now()
   where provider='asaas' and external_event_id=p_event_id;

  return jsonb_build_object('accepted', true, 'processed', true, 'status', v_invoice_status);
exception when others then
  update private.billing_webhook_events
     set processing_status='failed', processing_error=sqlerrm, processed_at=now()
   where provider='asaas' and external_event_id=p_event_id;
  raise;
end;
$function$

revoke all on function public.process_asaas_webhook(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.process_asaas_webhook(text,text,jsonb) to service_role;
