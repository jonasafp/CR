# Gestor Fácil — Controle interno

Sistema web multiempresa para estoque, vendas, clientes, fornecedores, compras,
financeiro e relatórios. Esta versão é exclusivamente de controle interno:
não emite documentos fiscais e não possui integração com a SEFAZ.

## Desenvolvimento

```powershell
npm ci
Copy-Item ".env.example" ".env.local"
npm run dev
```

Preencha em `.env.local` a URL e a chave pública do projeto Supabase.
Nunca coloque a `service_role` no frontend.

## Validação

```powershell
npm run validate
```

Esse comando executa testes, lint, TypeScript e build de produção.

## Produção

- [Preparação e publicação](docs/fase-13-producao.md)
- [Operação, backup e recuperação](docs/operacao-recuperacao.md)
- [Homologação funcional](docs/homologacao-fase-12.md)


## Licença e propriedade intelectual

Este projeto é software proprietário. O acesso ao repositório ou ao sistema
não concede permissão para copiar, modificar, distribuir, sublicenciar ou
comercializar o código. Consulte o arquivo [LICENSE](LICENSE).
