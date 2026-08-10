import type {
  AnyReportResult,
  FinancialReportRow,
  InventoryReportRow,
  ProductReportRow,
  ReportExportFormat,
  ReportOverview,
  SalesReportRow,
} from "../../domain/reports/Report";

import type {
  ReportFilters,
} from "../../domain/reports/ReportFilters";

import {
  getReportPeriodLabel,
} from "../../domain/reports/ReportPeriod";

import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatStockQuantity,
} from "../../utils/formatters";

import {
  reportService,
} from "./reportService";

interface ExportColumn<Row> {
  label: string;

  getValue: (
    row: Row,
  ) => string | number;
}

const reportFileNames = {
  sales:
    "relatorio-vendas",

  financial:
    "relatorio-financeiro",

  products:
    "relatorio-produtos",

  inventory:
    "relatorio-estoque",
} as const;

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value.includes("T")
        ? value
        : `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",

      timeStyle:
        value.includes("T")
          ? "short"
          : undefined,
    },
  ).format(date);
}

function escapeCsvValue(
  value: string | number,
): string {
  const normalizedValue =
    String(value ?? "");

  if (
    normalizedValue.includes(
      ";",
    ) ||
    normalizedValue.includes(
      '"',
    ) ||
    normalizedValue.includes(
      "\n",
    )
  ) {
    return `"${normalizedValue.replace(
      /"/g,
      '""',
    )}"`;
  }

  return normalizedValue;
}

function escapeHtml(
  value: string | number,
): string {
  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /"/g,
      "&quot;",
    )
    .replace(
      /'/g,
      "&#039;",
    );
}

function downloadFile(
  content: string,
  fileName: string,
  mimeType: string,
) {
  const blob =
    new Blob(
      [content],
      {
        type: mimeType,
      },
    );

  const downloadUrl =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href =
    downloadUrl;

  link.download =
    fileName;

  document.body.appendChild(
    link,
  );

  link.click();
  link.remove();

  URL.revokeObjectURL(
    downloadUrl,
  );
}

function getSalesColumns():
  ExportColumn<
    SalesReportRow
  >[] {
  return [
    {
      label: "Venda",

      getValue: (row) =>
        row.number,
    },

    {
      label: "Cliente",

      getValue: (row) =>
        row.customerName,
    },

    {
      label: "Data",

      getValue: (row) =>
        formatDate(
          row.completedAt ??
            row.cancelledAt ??
            row.createdAt,
        ),
    },

    {
      label: "Situação",

      getValue: (row) =>
        row.status,
    },

    {
      label: "Pagamento",

      getValue: (row) =>
        row.paymentMethod,
    },

    {
      label: "Itens",

      getValue: (row) =>
        row.itemCount,
    },

    {
      label: "Quantidade",

      getValue: (row) =>
        formatNumber(
          row.totalQuantity,
        ),
    },

    {
      label: "Subtotal",

      getValue: (row) =>
        formatCurrency(
          row.subtotal,
        ),
    },

    {
      label: "Desconto",

      getValue: (row) =>
        formatCurrency(
          row.discount,
        ),
    },

    {
      label: "Total",

      getValue: (row) =>
        formatCurrency(
          row.total,
        ),
    },

    {
      label: "Custo",

      getValue: (row) =>
        formatCurrency(
          row.cost,
        ),
    },

    {
      label: "Lucro",

      getValue: (row) =>
        formatCurrency(
          row.profit,
        ),
    },

    {
      label: "Margem",

      getValue: (row) =>
        formatPercentage(
          row.profitMargin,
        ),
    },

    {
      label: "Responsável",

      getValue: (row) =>
        row.createdBy,
    },
  ];
}

function getFinancialColumns():
  ExportColumn<
    FinancialReportRow
  >[] {
  return [
    {
      label: "Lançamento",

      getValue: (row) =>
        row.number,
    },

    {
      label: "Descrição",

      getValue: (row) =>
        row.description,
    },

    {
      label: "Categoria",

      getValue: (row) =>
        row.category,
    },

    {
      label: "Tipo",

      getValue: (row) =>
        row.type,
    },

    {
      label: "Situação",

      getValue: (row) =>
        row.status,
    },

    {
      label: "Origem",

      getValue: (row) =>
        row.source,
    },

    {
      label: "Vencimento",

      getValue: (row) =>
        formatDate(
          row.dueDate,
        ),
    },

    {
      label: "Pagamento",

      getValue: (row) =>
        formatDate(
          row.paymentDate,
        ),
    },

    {
      label:
        "Forma de pagamento",

      getValue: (row) =>
        row.paymentMethod ?? "",
    },

    {
      label:
        "Cliente/Fornecedor",

      getValue: (row) =>
        row.customerOrSupplier ??
        "",
    },

    {
      label: "Venda",

      getValue: (row) =>
        row.saleNumber ?? "",
    },

    {
      label: "Valor",

      getValue: (row) =>
        formatCurrency(
          row.amount,
        ),
    },

    {
      label: "Responsável",

      getValue: (row) =>
        row.createdBy,
    },
  ];
}

function getProductColumns():
  ExportColumn<
    ProductReportRow
  >[] {
  return [
    {
      label: "Código",

      getValue: (row) =>
        row.code,
    },

    {
      label: "Produto",

      getValue: (row) =>
        row.name,
    },

    {
      label: "Categoria",

      getValue: (row) =>
        row.category,
    },

    {
      label: "Situação",

      getValue: (row) =>
        row.status,
    },

    {
      label: "Estoque",

      getValue: (row) =>
        formatStockQuantity(
          row.stockQuantity,
          row.unit,
        ),
    },

    {
      label:
        "Estoque mínimo",

      getValue: (row) =>
        formatStockQuantity(
          row.minimumStock,
          row.unit,
        ),
    },

    {
      label:
        "Quantidade vendida",

      getValue: (row) =>
        formatStockQuantity(
          row.soldQuantity,
          row.unit,
        ),
    },

    {
      label:
        "Preço de compra",

      getValue: (row) =>
        formatCurrency(
          row.purchasePrice,
        ),
    },

    {
      label:
        "Preço de venda",

      getValue: (row) =>
        formatCurrency(
          row.salePrice,
        ),
    },

    {
      label:
        "Custo do estoque",

      getValue: (row) =>
        formatCurrency(
          row.stockCost,
        ),
    },

    {
      label:
        "Receita potencial",

      getValue: (row) =>
        formatCurrency(
          row.potentialRevenue,
        ),
    },

    {
      label:
        "Lucro potencial",

      getValue: (row) =>
        formatCurrency(
          row.potentialProfit,
        ),
    },

    {
      label:
        "Receita realizada",

      getValue: (row) =>
        formatCurrency(
          row.realizedRevenue,
        ),
    },

    {
      label:
        "Lucro realizado",

      getValue: (row) =>
        formatCurrency(
          row.realizedProfit,
        ),
    },

    {
      label: "Margem",

      getValue: (row) =>
        formatPercentage(
          row.profitMargin,
        ),
    },
  ];
}

function getInventoryColumns():
  ExportColumn<
    InventoryReportRow
  >[] {
  return [
    {
      label: "Data",

      getValue: (row) =>
        formatDate(
          row.createdAt,
        ),
    },

    {
      label: "Código",

      getValue: (row) =>
        row.productCode,
    },

    {
      label: "Produto",

      getValue: (row) =>
        row.productName,
    },

    {
      label:
        "Movimentação",

      getValue: (row) =>
        row.type,
    },

    {
      label: "Motivo",

      getValue: (row) =>
        row.reason,
    },

    {
      label: "Quantidade",

      getValue: (row) =>
        formatStockQuantity(
          row.quantity,
          row.unit,
        ),
    },

    {
      label:
        "Estoque anterior",

      getValue: (row) =>
        formatStockQuantity(
          row.previousStock,
          row.unit,
        ),
    },

    {
      label:
        "Estoque atual",

      getValue: (row) =>
        formatStockQuantity(
          row.currentStock,
          row.unit,
        ),
    },

    {
      label:
        "Custo unitário",

      getValue: (row) =>
        formatCurrency(
          row.unitCost,
        ),
    },

    {
      label: "Valor total",

      getValue: (row) =>
        formatCurrency(
          row.totalValue,
        ),
    },

    {
      label: "Observações",

      getValue: (row) =>
        row.notes ?? "",
    },

    {
      label: "Responsável",

      getValue: (row) =>
        row.createdBy,
    },
  ];
}

function getReportColumns(
  report: AnyReportResult,
): ExportColumn<never>[] {
  if (
    report.reportType ===
    "financial"
  ) {
    return getFinancialColumns() as
      ExportColumn<never>[];
  }

  if (
    report.reportType ===
    "products"
  ) {
    return getProductColumns() as
      ExportColumn<never>[];
  }

  if (
    report.reportType ===
    "inventory"
  ) {
    return getInventoryColumns() as
      ExportColumn<never>[];
  }

  return getSalesColumns() as
    ExportColumn<never>[];
}

function createCsv(
  report: AnyReportResult,
): string {
  const columns =
    getReportColumns(
      report,
    );

  const rows =
    report.rows as never[];

  const header =
    columns
      .map((column) =>
        escapeCsvValue(
          column.label,
        ),
      )
      .join(";");

  const contentRows =
    rows.map((row) =>
      columns
        .map((column) =>
          escapeCsvValue(
            column.getValue(
              row,
            ),
          ),
        )
        .join(";"),
    );

  return `\uFEFF${[
    header,
    ...contentRows,
  ].join("\r\n")}`;
}

function getOverviewItems(
  overview: ReportOverview,

  reportType:
    AnyReportResult[
      "reportType"
    ],
) {
  if (
    reportType ===
    "financial"
  ) {
    return [
      [
        "Receitas",

        formatCurrency(
          overview
            .financialBalance +
            overview
              .totalExpense,
        ),
      ],

      [
        "Despesas",

        formatCurrency(
          overview.totalExpense,
        ),
      ],

      [
        "Saldo",

        formatCurrency(
          overview
            .financialBalance,
        ),
      ],

      [
        "A receber",

        formatCurrency(
          overview
            .accountsReceivable,
        ),
      ],

      [
        "A pagar",

        formatCurrency(
          overview
            .accountsPayable,
        ),
      ],
    ];
  }

  if (
    reportType ===
    "products"
  ) {
    return [
      [
        "Produtos",

        formatNumber(
          overview.totalProducts,
          0,
        ),
      ],

      [
        "Custo do estoque",

        formatCurrency(
          overview.stockCost,
        ),
      ],

      [
        "Receita potencial",

        formatCurrency(
          overview
            .potentialRevenue,
        ),
      ],

      [
        "Estoque baixo",

        formatNumber(
          overview
            .lowStockProducts,
          0,
        ),
      ],

      [
        "Sem estoque",

        formatNumber(
          overview
            .outOfStockProducts,
          0,
        ),
      ],
    ];
  }

  if (
    reportType ===
    "inventory"
  ) {
    return [
      [
        "Entradas",

        formatNumber(
          overview.totalEntries,
        ),
      ],

      [
        "Saídas",

        formatNumber(
          overview.totalExits,
        ),
      ],

      [
        "Movimentação líquida",

        formatNumber(
          overview.totalEntries -
            overview.totalExits,
        ),
      ],

      [
        "Custo do estoque",

        formatCurrency(
          overview.stockCost,
        ),
      ],

      [
        "Receita potencial",

        formatCurrency(
          overview
            .potentialRevenue,
        ),
      ],
    ];
  }

  return [
    [
      "Vendas concluídas",

      formatNumber(
        overview.completedSales,
        0,
      ),
    ],

    [
      "Faturamento",

      formatCurrency(
        overview.netRevenue,
      ),
    ],

    [
      "Lucro",

      formatCurrency(
        overview.totalProfit,
      ),
    ],

    [
      "Ticket médio",

      formatCurrency(
        overview.averageTicket,
      ),
    ],

    [
      "Margem",

      formatPercentage(
        overview.profitMargin,
      ),
    ],
  ];
}

function createPrintableHtml(
  report: AnyReportResult,
): string {
  const columns =
    getReportColumns(
      report,
    );

  const rows =
    report.rows as never[];

  const periodLabel =
    getReportPeriodLabel(
      report.period,
    );

  const overviewItems =
    getOverviewItems(
      report.overview,
      report.reportType,
    );

  const overviewHtml =
    overviewItems
      .map(
        ([
          label,
          value,
        ]) => `
          <div class="metric">
            <span>${escapeHtml(
              label,
            )}</span>

            <strong>${escapeHtml(
              value,
            )}</strong>
          </div>
        `,
      )
      .join("");

  const headersHtml =
    columns
      .map(
        (column) =>
          `<th>${escapeHtml(
            column.label,
          )}</th>`,
      )
      .join("");

  const rowsHtml =
    rows
      .map(
        (row) => `
          <tr>
            ${columns
              .map(
                (column) =>
                  `<td>${escapeHtml(
                    column.getValue(
                      row,
                    ),
                  )}</td>`,
              )
              .join("")}
          </tr>
        `,
      )
      .join("");

  return `
    <!doctype html>

    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />

        <title>
          ${escapeHtml(
            report.title,
          )}
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 28px;

            color: #0f172a;

            font-family:
              Arial,
              sans-serif;
          }

          header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 18px;

            border-bottom:
              2px solid #2563eb;
          }

          h1 {
            margin: 0;
            font-size: 22px;
          }

          header p,
          header span {
            margin: 6px 0 0;

            color: #64748b;
            font-size: 11px;
          }

          .generated {
            text-align: right;
          }

          .metrics {
            display: grid;
            grid-template-columns:
              repeat(5, 1fr);
            gap: 9px;
            margin: 18px 0;
          }

          .metric {
            padding: 11px;

            border:
              1px solid #e2e8f0;

            border-radius: 8px;
          }

          .metric span,
          .metric strong {
            display: block;
          }

          .metric span {
            color: #64748b;
            font-size: 9px;
          }

          .metric strong {
            margin-top: 5px;
            font-size: 13px;
          }

          table {
            width: 100%;
            border-collapse: collapse;

            font-size: 8px;
          }

          th {
            padding: 8px;

            color: #475569;

            border:
              1px solid #cbd5e1;

            background: #f1f5f9;

            text-align: left;
            text-transform: uppercase;
          }

          td {
            padding: 8px;

            border:
              1px solid #e2e8f0;
          }

          tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          footer {
            margin-top: 16px;

            color: #64748b;

            font-size: 8px;
            text-align: right;
          }

          @page {
            size: landscape;
            margin: 12mm;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <header>
          <div>
            <h1>
              ${escapeHtml(
                report.title,
              )}
            </h1>

            <p>
              ${escapeHtml(
                report.description,
              )}
            </p>

            <span>
              Período:
              ${escapeHtml(
                periodLabel,
              )}
            </span>
          </div>

          <div class="generated">
            <strong>
              Gestor Fácil
            </strong>

            <p>
              Gerado em
              ${escapeHtml(
                formatDate(
                  report.generatedAt,
                ),
              )}
            </p>
          </div>
        </header>

        <section class="metrics">
          ${overviewHtml}
        </section>

        <table>
          <thead>
            <tr>
              ${headersHtml}
            </tr>
          </thead>

          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <footer>
          ${escapeHtml(
            String(
              report.totalItems,
            ),
          )}
          registros encontrados
        </footer>
      </body>
    </html>
  `;
}

async function getCompleteReport(
  filters: ReportFilters,
): Promise<AnyReportResult> {
  return reportService.generate({
    ...filters,

    page: 1,
    pageSize: 100000,
  });
}

function createFileName(
  report: AnyReportResult,
  extension: string,
): string {
  const baseName =
    reportFileNames[
      report.reportType
    ];

  return `${baseName}-${report.period.dateFrom}-a-${report.period.dateTo}.${extension}`;
}

async function exportCsv(
  filters: ReportFilters,
) {
  const report =
    await getCompleteReport(
      filters,
    );

  const csv =
    createCsv(report);

  downloadFile(
    csv,

    createFileName(
      report,
      "csv",
    ),

    "text/csv;charset=utf-8",
  );
}

async function openPrintReport(
  filters: ReportFilters,
) {
  const printWindow =
    window.open(
      "",
      "_blank",
    );

  if (!printWindow) {
    throw new Error(
      "O navegador bloqueou a janela de impressão. Permita pop-ups para continuar.",
    );
  }

  printWindow.opener = null;

  printWindow.document.write(
    "<p style='font-family:Arial;padding:24px'>Preparando relatório...</p>",
  );

  try {
    const report =
      await getCompleteReport(
        filters,
      );

    printWindow.document.open();

    printWindow.document.write(
      createPrintableHtml(
        report,
      ),
    );

    printWindow.document.close();

    printWindow.setTimeout(
      () => {
        printWindow.focus();
        printWindow.print();
      },
      250,
    );
  } catch (error) {
    printWindow.close();
    throw error;
  }
}

export const reportExportService = {
  export(
    filters:
      ReportFilters,

    format:
      ReportExportFormat,
  ) {
    if (format === "csv") {
      return exportCsv(
        filters,
      );
    }

    return openPrintReport(
      filters,
    );
  },
};