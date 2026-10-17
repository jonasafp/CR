# Fase 12 — Checklist de homologação

Use uma empresa de testes. Marque cada item somente depois de conferir o resultado na tela.

## 1. Autenticação e empresa

- [V] Entrar com e-mail e senha válidos.
- [V] Confirmar que senha incorreta mostra uma mensagem amigável.
- [V] Atualizar a página e confirmar que a sessão continua ativa.
- [V] Clicar em **Sair** e confirmar o retorno à tela de login.
- [V] Entrar novamente e confirmar que a empresa correta foi carregada.

## 2. Cadastros e estoque

- [V] Criar um produto com preço de compra, preço de venda e estoque mínimo.
- [V] Editar o produto e confirmar que os dados permanecem após atualizar a página.
- [V] Registrar uma entrada manual de estoque.
- [V] Registrar uma saída manual permitida.
- [V] Tentar uma saída superior ao estoque e confirmar o bloqueio quando estoque negativo estiver desativado.
- [V] Confirmar que os indicadores do dashboard refletem o estoque real.

## 3. Compras e fornecedores

- [V] Criar um fornecedor.
- [V] Criar uma compra com pelo menos um produto.
- [V] Concluir a compra e confirmar o aumento do estoque.
- [V] Confirmar a criação do lançamento financeiro correspondente.
- [V] Cancelar uma compra de teste e conferir o estorno do estoque.

## 4. Vendas e clientes

- [V] Criar um cliente.
- [V] Finalizar uma venda por quantidade.
- [V] Finalizar uma venda em quilogramas informando o valor monetário.
- [V] Confirmar a redução correta do estoque.
- [V] Confirmar a criação da receita no financeiro.
- [V] Atualizar a página e confirmar que a venda permanece no histórico.
- [V] Cancelar uma venda de teste e conferir estoque e financeiro.
- [V] Tentar clicar duas vezes em **Finalizar venda** e confirmar que apenas uma venda é criada.

## 5. Financeiro, relatórios e dashboard

- [V] Criar uma receita manual.
- [V] Criar uma despesa manual.
- [V] Baixar um lançamento pendente.
- [V] Conferir filtros por período e situação.
- [V] Conferir totais do relatório contra as operações cadastradas.
- [V] Confirmar que gráficos não exibem produtos ou categorias inexistentes.
- [V] Exportar um relatório nos formatos disponíveis.

## 6. Configurações e backup

- [V] Alterar uma configuração e confirmar sua persistência após atualizar a página.
- [V] Exportar um backup e guardar o arquivo em local seguro.
- [V] Confirmar que o resumo do backup contém produtos, clientes, estoque, vendas e financeiro.
- [V] Não testar restauração em uma empresa com dados reais.

## 7. Permissões e multiempresa

- [V] Confirmar que o proprietário enxerga todos os módulos.
- [V] Confirmar que operador de caixa enxerga somente Resumo e Vendas.
- [V] Confirmar que usuário de consulta enxerga somente Resumo e Relatórios.
- [V] Tentar abrir diretamente uma URL não autorizada e confirmar a tela **Acesso não permitido**.
- [V] Com uma segunda empresa de testes, confirmar que nenhum cadastro da primeira empresa aparece.

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
