# Fase 12 — Checklist de homologação

Use uma empresa de testes. Marque cada item somente depois de conferir o resultado na tela.

## 1. Autenticação e empresa

- [ ] Entrar com e-mail e senha válidos.
- [ ] Confirmar que senha incorreta mostra uma mensagem amigável.
- [ ] Atualizar a página e confirmar que a sessão continua ativa.
- [ ] Clicar em **Sair** e confirmar o retorno à tela de login.
- [ ] Entrar novamente e confirmar que a empresa correta foi carregada.

## 2. Cadastros e estoque

- [ ] Criar um produto com preço de compra, preço de venda e estoque mínimo.
- [ ] Editar o produto e confirmar que os dados permanecem após atualizar a página.
- [ ] Registrar uma entrada manual de estoque.
- [ ] Registrar uma saída manual permitida.
- [ ] Tentar uma saída superior ao estoque e confirmar o bloqueio quando estoque negativo estiver desativado.
- [ ] Confirmar que os indicadores do dashboard refletem o estoque real.

## 3. Compras e fornecedores

- [ ] Criar um fornecedor.
- [ ] Criar uma compra com pelo menos um produto.
- [ ] Concluir a compra e confirmar o aumento do estoque.
- [ ] Confirmar a criação do lançamento financeiro correspondente.
- [ ] Cancelar uma compra de teste e conferir o estorno do estoque.

## 4. Vendas e clientes

- [ ] Criar um cliente.
- [ ] Finalizar uma venda por quantidade.
- [ ] Finalizar uma venda em quilogramas informando o valor monetário.
- [ ] Confirmar a redução correta do estoque.
- [ ] Confirmar a criação da receita no financeiro.
- [ ] Atualizar a página e confirmar que a venda permanece no histórico.
- [ ] Cancelar uma venda de teste e conferir estoque e financeiro.
- [ ] Tentar clicar duas vezes em **Finalizar venda** e confirmar que apenas uma venda é criada.

## 5. Financeiro, relatórios e dashboard

- [ ] Criar uma receita manual.
- [ ] Criar uma despesa manual.
- [ ] Baixar um lançamento pendente.
- [ ] Conferir filtros por período e situação.
- [ ] Conferir totais do relatório contra as operações cadastradas.
- [ ] Confirmar que gráficos não exibem produtos ou categorias inexistentes.
- [ ] Exportar um relatório nos formatos disponíveis.

## 6. Configurações e backup

- [ ] Alterar uma configuração e confirmar sua persistência após atualizar a página.
- [ ] Exportar um backup e guardar o arquivo em local seguro.
- [ ] Confirmar que o resumo do backup contém produtos, clientes, estoque, vendas e financeiro.
- [ ] Não testar restauração em uma empresa com dados reais.

## 7. Permissões e multiempresa

- [ ] Confirmar que o proprietário enxerga todos os módulos.
- [ ] Confirmar que operador de caixa enxerga somente Resumo e Vendas.
- [ ] Confirmar que usuário de consulta enxerga somente Resumo e Relatórios.
- [ ] Tentar abrir diretamente uma URL não autorizada e confirmar a tela **Acesso não permitido**.
- [ ] Com uma segunda empresa de testes, confirmar que nenhum cadastro da primeira empresa aparece.

## 8. Validação técnica

Execute no PowerShell, na raiz do projeto:

```powershell
npm run validate
```

Resultado esperado:

- todos os testes aprovados;
- lint sem erros ou avisos;
- TypeScript sem erros;
- build do Vite concluído.

## Critério de aprovação

A Fase 12 estará homologada quando todos os itens aplicáveis estiverem marcados e não houver erro bloqueador nos fluxos de compra, venda, estoque ou financeiro.
