import type {
  FinancialTransaction,
} from "../domain/financial/FinancialTransaction";

function createDate(
  dayOffset: number,
): string {
  const date =
    new Date();

  date.setHours(
    12,
    0,
    0,
    0,
  );

  date.setDate(
    date.getDate() +
      dayOffset,
  );

  return date
    .toISOString()
    .slice(
      0,
      10,
    );
}

function createDateTime(
  dayOffset: number,
): string {
  const date =
    new Date();

  date.setHours(
    12,
    0,
    0,
    0,
  );

  date.setDate(
    date.getDate() +
      dayOffset,
  );

  return date.toISOString();
}

export const financialCategories = {
  income: [
    "Vendas",
    "Serviços",
    "Recebimentos",
    "Outras receitas",
  ],

  expense: [
    "Compra de mercadorias",
    "Fornecedores",
    "Aluguel",
    "Energia elétrica",
    "Água",
    "Internet",
    "Salários",
    "Impostos",
    "Manutenção",
    "Transporte",
    "Marketing",
    "Outras despesas",
  ],
} as const;

export const initialFinancialTransactions:
  FinancialTransaction[] = [
    {
      id: 1,

      number:
        "FIN-000001",

      type:
        "expense",

      status:
        "paid",

      source:
        "manual",

      description:
        "Conta de energia elétrica",

      category:
        "Energia elétrica",

      amount: 468.5,

      dueDate:
        createDate(-8),

      paymentDate:
        createDate(-9),

      paymentMethod:
        "pix",

      customerOrSupplier:
        "Companhia de energia",

      notes:
        "Conta mensal da unidade principal.",

      createdAt:
        createDateTime(-15),

      updatedAt:
        createDateTime(-9),

      createdBy:
        "Administrador",
    },

    {
      id: 2,

      number:
        "FIN-000002",

      type:
        "expense",

      status:
        "pending",

      source:
        "manual",

      description:
        "Reposição de rações",

      category:
        "Compra de mercadorias",

      amount: 2350,

      dueDate:
        createDate(5),

      customerOrSupplier:
        "Distribuidora de produtos",

      notes:
        "Pedido de reposição do estoque.",

      createdAt:
        createDateTime(-3),

      updatedAt:
        createDateTime(-3),

      createdBy:
        "Administrador",
    },

    {
      id: 3,

      number:
        "FIN-000003",

      type:
        "income",

      status:
        "received",

      source:
        "manual",

      description:
        "Recebimento de venda externa",

      category:
        "Vendas",

      amount: 780,

      dueDate:
        createDate(-2),

      paymentDate:
        createDate(-2),

      paymentMethod:
        "bank_transfer",

      customerOrSupplier:
        "Cliente externo",

      createdAt:
        createDateTime(-2),

      updatedAt:
        createDateTime(-2),

      createdBy:
        "Administrador",
    },

    {
      id: 4,

      number:
        "FIN-000004",

      type:
        "expense",

      status:
        "pending",

      source:
        "manual",

      description:
        "Serviço de internet",

      category:
        "Internet",

      amount: 149.9,

      dueDate:
        createDate(-4),

      customerOrSupplier:
        "Provedor de internet",

      notes:
        "Lançamento propositalmente vencido para teste.",

      createdAt:
        createDateTime(-12),

      updatedAt:
        createDateTime(-12),

      createdBy:
        "Administrador",
    },

    {
      id: 5,

      number:
        "FIN-000005",

      type:
        "income",

      status:
        "pending",

      source:
        "manual",

      description:
        "Venda corporativa a receber",

      category:
        "Vendas",

      amount: 1250,

      dueDate:
        createDate(10),

      customerOrSupplier:
        "Cliente empresarial",

      notes:
        "Pagamento acordado por transferência.",

      createdAt:
        createDateTime(-1),

      updatedAt:
        createDateTime(-1),

      createdBy:
        "Administrador",
    },
  ];