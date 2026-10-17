# Fase 13 — Preparação para produção

Este documento registra a publicação da primeira versão operacional do Gestor Fácil.
O sistema continua sendo exclusivamente de controle interno, sem emissão fiscal e sem integração com a SEFAZ.

## 13A — Publicação do frontend

Plataforma prevista: Vercel, usando o repositório GitHub do projeto.

Configuração do projeto:

- Framework Preset: `Vite`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Install Command: `npm ci`.
- Node.js: `22.x`.

Variáveis obrigatórias nos ambientes Production e Preview:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_APP_ENV` com `production` ou `preview`
- `VITE_APP_VERSION` com a versão publicada, por exemplo `1.0.0`

Nunca cadastrar `service_role`, secret key ou senha do banco em variável iniciada por `VITE_`.
Toda variável `VITE_` é incorporada ao JavaScript enviado ao navegador.

O arquivo `vercel.json` fornece:

- fallback de rotas para a SPA;
- cabeçalhos básicos de segurança;
- cache longo para assets versionados;
- bloqueio de cache para `index.html`.

## 13B — Domínio e HTTPS

1. Publicar primeiro usando o domínio temporário da Vercel.
2. Validar login, vendas, estoque, financeiro, funcionários, relatórios e impressão.
3. Adicionar o domínio definitivo em Vercel > Project > Settings > Domains.
4. Criar no provedor do domínio os registros DNS solicitados pela Vercel.
5. Aguardar a emissão automática do certificado HTTPS.
6. Confirmar que HTTP redireciona para HTTPS.
7. Não remover o domínio temporário antes da validação do domínio definitivo.

## 13C — Supabase, autenticação e segurança

Em Supabase > Authentication > URL Configuration:

- Site URL: URL HTTPS definitiva do sistema.
- Redirect URLs: adicionar exatamente `https://SEU-DOMINIO/definir-senha`.
- Manter `http://localhost:5173/definir-senha` somente para desenvolvimento.

Em Supabase > Authentication > Providers > Email:

- desativar `Allow new users to sign up`;
- manter login por e-mail e senha;
- configurar SMTP próprio antes de convidar clientes reais;
- configurar prazo de OTP em no máximo 3600 segundos;
- ativar proteção contra senhas vazadas quando disponível no plano.

Em Supabase > Database:

- confirmar SSL Enforcement;
- revisar Security Advisor e Performance Advisor;
- não expor `service_role` no frontend;
- manter RLS habilitado em todas as tabelas do schema `public`;
- criar funcionários somente pelo fluxo administrativo existente;
- criar empresas somente pelo futuro Painel Administrativo Central.

A migration da Fase 13 revoga a execução pública de `bootstrap_company`.

## 13D — Operação e aceite

Antes da primeira empresa real:

- executar `npm run validate`;
- verificar o workflow `Quality` no GitHub;
- realizar a homologação descrita em `docs/homologacao-fase-12.md`;
- criar e restaurar um backup de teste;
- validar acesso de proprietário, administrador, gerente, caixa e consulta;
- testar perda e retorno de internet;
- testar abertura direta de `/vendas` e `/relatorios` no domínio publicado;
- testar convite e definição de senha em uma janela anônima;
- imprimir comprovante e relatório térmico reais;
- registrar versão, data e responsável pela publicação.

## Critério de conclusão

A Fase 13 termina somente quando:

1. o frontend estiver publicado em HTTPS;
2. o domínio definitivo estiver configurado;
3. o cadastro público estiver desativado;
4. Auth URLs e SMTP estiverem configurados;
5. o backup externo estiver testado;
6. a homologação funcional estiver aprovada;
7. houver um procedimento conhecido de recuperação e retorno de versão.
