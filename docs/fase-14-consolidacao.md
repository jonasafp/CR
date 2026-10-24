# Fase 14 — consolidação multiempresa e e-mails de acesso

## 1. Numeração independente por empresa

A migration `20261024213414_isolate_company_document_numbers.sql` substitui
as sequências globais por contadores transacionais separados por empresa para:

- vendas (`VEN-000001`);
- compras (`COM-000001`);
- lançamentos financeiros (`FIN-000001`).

Ela também renumera os registros de teste já existentes pela ordem de criação
de cada empresa e atualiza as referências de vendas e compras armazenadas no
financeiro.

Os contadores ficam no schema privado e usam `INSERT ... ON CONFLICT DO UPDATE`
para reservar o próximo número de forma atômica. Assim, duas operações
simultâneas da mesma empresa não recebem o mesmo número.

Funcionários já usam um contador próprio por empresa. Produtos, clientes,
fornecedores, itens e movimentações usam UUID como identificador técnico e
continuam isolados pelo `company_id` e pelas políticas RLS.

## 2. Convites e recuperação de senha

O SMTP padrão do Supabase é destinado apenas a desenvolvimento e possui um
limite baixo. Antes de receber clientes reais, configure um SMTP próprio em:

1. Supabase Dashboard;
2. Authentication;
3. Emails / SMTP Settings;
4. Enable Custom SMTP.

Preencha os dados entregues pelo provedor:

- Sender name: `Gestor Fácil`;
- Sender email: endereço verificado no provedor;
- Host;
- Port;
- Username;
- Password.

Depois de salvar, acesse Authentication > Rate Limits e ajuste o limite de
e-mails para um valor compatível com o plano contratado.

As credenciais SMTP são secretas. Nunca devem ser adicionadas ao `.env` do
frontend, ao repositório Git ou a um patch.

### Opção inicial

O Brevo oferece SMTP transacional e pode ser usado como solução inicial.
Cadastre e valide o remetente no provedor, gere uma chave SMTP e copie os dados
para o Supabase. Quando houver domínio próprio, configure SPF, DKIM e DMARC para
melhorar a entrega e reduzir mensagens classificadas como spam.

## 3. Verificação após a atualização

Em duas empresas diferentes:

1. registre uma venda em cada empresa e confirme que ambas começam em
   `VEN-000001` quando não houver vendas anteriores;
2. registre uma compra em cada empresa e confira a sequência `COM-000001`;
3. crie um lançamento financeiro manual e confira `FIN-000001`;
4. crie uma segunda operação na mesma empresa e confirme o incremento para 2;
5. confirme que nenhuma empresa visualiza dados da outra;
6. envie um convite e uma solicitação de troca de senha após configurar o SMTP.
