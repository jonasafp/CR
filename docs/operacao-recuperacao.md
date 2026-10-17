# Operação, backup e recuperação

## Rotina diária

- Confirmar que a aplicação abre pelo domínio HTTPS.
- Confirmar que o painel Supabase está com status operacional.
- Verificar erros relatados pelos usuários.
- Não alterar migrations já aplicadas; toda correção de banco deve gerar uma nova migration.

## Rotina semanal

- Executar `npm run validate` na branch de entrega.
- Exportar um backup lógico do banco e armazená-lo fora do computador de desenvolvimento.
- Conferir convites pendentes e funcionários inativos.
- Registrar a versão atualmente publicada.

## Backup lógico do banco

O projeto gratuito do Supabase não oferece download dos backups gerenciados. Para clientes reais,
manter exportação lógica externa ou migrar para um plano com retenção/PITR adequada.

Depois de autenticar e vincular o Supabase CLI:

```powershell
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db dump --linked --data-only -f ".\backups\dados-AAAA-MM-DD.sql"
```

Não versionar os arquivos de backup no Git. Eles podem conter dados pessoais e comerciais.

## Backup funcional por empresa

Além do backup do banco, usar a exportação disponível em Configurações > Dados. Esse arquivo é
útil para conferência e portabilidade, mas não substitui o backup lógico completo do Postgres.

## Recuperação do frontend

Se uma publicação apresentar erro:

1. abrir o projeto na Vercel;
2. acessar Deployments;
3. localizar a última versão validada;
4. usar Promote to Production/Rollback;
5. testar login e uma consulta antes de liberar os usuários.

O rollback do frontend não desfaz migrations do banco.

## Recuperação do banco

- Nunca restaurar diretamente em produção sem preservar uma cópia do estado atual.
- Testar a restauração em projeto separado sempre que possível.
- Não executar migrations destrutivas durante o horário de operação.
- Para incidentes graves, bloquear temporariamente novas operações antes da restauração.
- Depois da recuperação, validar contagens de empresas, usuários, produtos, vendas e lançamentos.

## Registro mínimo de incidente

Registrar:

- data e horário;
- empresa afetada;
- usuário que percebeu o problema;
- operação executada;
- mensagem de erro;
- versão publicada;
- correção aplicada;
- necessidade ou não de restauração.

Nunca registrar senhas, tokens, chaves privadas ou conteúdo completo de sessões.
