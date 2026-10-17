-- A criação de empresas deixa de ser uma operação pública do aplicativo cliente.
-- O futuro painel administrativo deverá executar essa operação somente no servidor.
revoke all on function public.bootstrap_company(text, text, text)
  from public, anon, authenticated;

create index if not exists company_members_invited_by_idx
  on public.company_members(invited_by)
  where invited_by is not null;
