import {
  Ban,
  CheckCircle2,
  Clock3,
  Package,
  ReceiptText,
  TableProperties,
  TriangleAlert,
} from "lucide-react";

import EmptyState from "../../common/EmptyState/EmptyState";
import Pagination from "../../common/Pagination/Pagination";

import FinancialSourceBadge from "../../financial/FinancialSourceBadge/FinancialSourceBadge";
import FinancialTypeBadge from "../../financial/FinancialTypeBadge/FinancialTypeBadge";

import MovementTypeBadge from "../../inventory/MovementTypeBadge/MovementTypeBadge";

import ProductStatusBadge from "../../products/ProductStatusBadge/ProductStatusBadge";

import PaymentMethodBadge from "../../sales/PaymentMethodBadge/PaymentMethodBadge";
import SaleStatusBadge from "../../sales/SaleStatusBadge/SaleStatusBadge";

import type {
  FinancialReportRow,
  InventoryReportRow,
  ProductReportRow,
  ReportType,
  SalesReportRow,
} from "../../../domain/reports/Report";

import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatStockQuantity,
} from "../../../utils/formatters";

import styles from "./ReportTable.module.css";

type ReportRow =
  | SalesReportRow
  | FinancialReportRow
  | ProductReportRow
  | InventoryReportRow;

interface ReportTableProps {
  reportType: ReportType;
  rows: ReportRow[];

  page: number;
  pageSize: number;

  totalItems: number;
  totalPages: number;

  onPageChange: (
    page: number,
  ) => void;
}

const financialStatusLabels = {
  received: "Recebido",
  paid: "Pago",
  pending: "Pendente",
  cancelled: "Cancelado",
} as const;

const inventoryReasonLabels:
  Record<string, string> = {
  purchase: "Compra",
  sale: "Venda",

  manual_adjustment:
    "Ajuste manual",

  loss: "Perda",
  damage: "Avaria",
  expiration: "Validade",
  return: "Devolução",

  initial_balance:
    "Saldo inicial",

  other: "Outro",
};

function FinancialReportStatus({
  row,
}: {
  row: FinancialReportRow;
}) {
  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const isOverdue =
    row.status === "pending" &&
    row.dueDate < today;

  const Icon =
    row.status === "cancelled"
      ? Ban
      : isOverdue
        ? TriangleAlert
        : row.status ===
          "pending"
          ? Clock3
          : CheckCircle2;

  const label =
    isOverdue
      ? "Vencido"
      : financialStatusLabels[
      row.status
      ];

  const className =
    isOverdue
      ? styles.overdue
      : styles[row.status];

  return (
    <span
      className={`${styles.statusBadge} ${className}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

function SalesRows({
  rows,
}: {
  rows: SalesReportRow[];
}) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.id}>
          <td>
            <div
              className={
                styles.mainCell
              }
            >
              <div
                className={
                  styles.mainIcon
                }
              >
                <ReceiptText
                  size={17}
                />
              </div>

              <div>
                <strong>
                  {row.number}
                </strong>

                <span>
                  {row.createdBy}
                </span>
              </div>
            </div>
          </td>

          <td>
            {row.customerName}
          </td>

          <td>
            {formatDateTime(
              row.completedAt ??
              row.cancelledAt ??
              row.createdAt,
            )}
          </td>

          <td>
            <PaymentMethodBadge
              method={
                row.paymentMethod
              }
            />
          </td>

          <td>
            {formatNumber(
              row.itemCount,
              0,
            )}
          </td>

          <td>
            {formatCurrency(
              row.subtotal,
            )}
          </td>

          <td
            className={
              styles.discount
            }
          >
            {formatCurrency(
              row.discount,
            )}
          </td>

          <td>
            <strong
              className={
                styles.total
              }
            >
              {formatCurrency(
                row.total,
              )}
            </strong>
          </td>

          <td>
            <strong
              className={
                styles.positive
              }
            >
              {formatCurrency(
                row.profit,
              )}
            </strong>
          </td>

          <td>
            {formatPercentage(
              row.profitMargin,
            )}
          </td>

          <td>
            <SaleStatusBadge
              status={row.status}
            />
          </td>
        </tr>
      ))}
    </>
  );
}

function FinancialRows({
  rows,
}: {
  rows: FinancialReportRow[];
}) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.id}>
          <td>
            <div
              className={
                styles.mainCell
              }
            >
              <div
                className={
                  styles.mainIcon
                }
              >
                <ReceiptText
                  size={17}
                />
              </div>

              <div>
                <strong>
                  {row.number}
                </strong>

                <span>
                  {row.saleNumber
                    ? `Venda ${row.saleNumber}`
                    : row.createdBy}
                </span>
              </div>
            </div>
          </td>

          <td>
            <div
              className={
                styles.descriptionCell
              }
            >
              <strong>
                {row.description}
              </strong>

              <span>
                {row.customerOrSupplier ||
                  "Não informado"}
              </span>
            </div>
          </td>

          <td>{row.category}</td>

          <td>
            <FinancialTypeBadge
              type={row.type}
            />
          </td>

          <td>
            <FinancialSourceBadge
              source={row.source}
            />
          </td>

          <td>
            {formatDateTime(
              row.dueDate,
            )}
          </td>

          <td>
            {formatDateTime(
              row.paymentDate,
            )}
          </td>

          <td>
            <strong
              className={
                row.type ===
                  "income"
                  ? styles.positive
                  : styles.negative
              }
            >
              {formatCurrency(
                row.amount,
              )}
            </strong>
          </td>

          <td>
            <FinancialReportStatus
              row={row}
            />
          </td>
        </tr>
      ))}
    </>
  );
}

function ProductRows({
  rows,
}: {
  rows: ProductReportRow[];
}) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.id}>
          <td>
            <div
              className={
                styles.mainCell
              }
            >
              <div
                className={
                  styles.mainIcon
                }
              >
                <Package size={17} />
              </div>

              <div>
                <strong>
                  {row.name}
                </strong>

                <span>
                  {row.code}
                </span>
              </div>
            </div>
          </td>

          <td>{row.category}</td>

          <td>
            <ProductStatusBadge
              status={row.status}
            />
          </td>

          <td>
            {formatStockQuantity(
              row.stockQuantity,
              row.unit,
            )}
          </td>

          <td>
            {formatStockQuantity(
              row.minimumStock,
              row.unit,
            )}
          </td>

          <td>
            {formatStockQuantity(
              row.soldQuantity,
              row.unit,
            )}
          </td>

          <td>
            {formatCurrency(
              row.purchasePrice,
            )}
          </td>

          <td>
            {formatCurrency(
              row.salePrice,
            )}
          </td>

          <td>
            {formatCurrency(
              row.stockCost,
            )}
          </td>

          <td>
            {formatCurrency(
              row.potentialRevenue,
            )}
          </td>

          <td>
            <strong
              className={
                styles.positive
              }
            >
              {formatCurrency(
                row.potentialProfit,
              )}
            </strong>
          </td>

          <td>
            <strong
              className={
                styles.positive
              }
            >
              {formatCurrency(
                row.realizedProfit,
              )}
            </strong>
          </td>

          <td>
            {formatPercentage(
              row.profitMargin,
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

function InventoryRows({
  rows,
}: {
  rows: InventoryReportRow[];
}) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.id}>
          <td>
            <div
              className={
                styles.mainCell
              }
            >
              <div
                className={
                  styles.mainIcon
                }
              >
                <Package size={17} />
              </div>

              <div>
                <strong>
                  {row.productName}
                </strong>

                <span>
                  {row.productCode}
                </span>
              </div>
            </div>
          </td>

          <td>
            {formatDateTime(
              row.createdAt,
            )}
          </td>

          <td>
            <MovementTypeBadge
              type={row.type}
            />
          </td>

          <td>
            {inventoryReasonLabels[
              row.reason
            ] ?? row.reason}
          </td>

          <td>
            <strong>
              {formatStockQuantity(
                row.quantity,
                row.unit,
              )}
            </strong>
          </td>

          <td>
            {formatStockQuantity(
              row.previousStock,
              row.unit,
            )}
          </td>

          <td>
            {formatStockQuantity(
              row.currentStock,
              row.unit,
            )}
          </td>

          <td>
            {formatCurrency(
              row.unitCost,
            )}
          </td>

          <td>
            <strong
              className={
                styles.total
              }
            >
              {formatCurrency(
                row.totalValue,
              )}
            </strong>
          </td>

          <td>{row.createdBy}</td>
        </tr>
      ))}
    </>
  );
}

export default function ReportTable({
  reportType,
  rows,

  page,
  pageSize,
  totalItems,
  totalPages,

  onPageChange,
}: ReportTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={TableProperties}
        title="Nenhum registro encontrado"
        description="Altere os filtros ou selecione outro período para consultar o relatório."
      />
    );
  }

  return (
    <>
      <div
        className={styles.wrapper}
      >
        <table
          className={styles.table}
        >
          {reportType ===
            "sales" && (
              <>
                <thead>
                  <tr>
                    <th>Venda</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Pagamento</th>
                    <th>Itens</th>
                    <th>Subtotal</th>
                    <th>Desconto</th>
                    <th>Total</th>
                    <th>Lucro</th>
                    <th>Margem</th>
                    <th>Situação</th>
                  </tr>
                </thead>

                <tbody>
                  <SalesRows
                    rows={
                      rows as
                      SalesReportRow[]
                    }
                  />
                </tbody>
              </>
            )}

          {reportType ===
            "financial" && (
              <>
                <thead>
                  <tr>
                    <th>Lançamento</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Origem</th>
                    <th>Vencimento</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Situação</th>
                  </tr>
                </thead>

                <tbody>
                  <FinancialRows
                    rows={
                      rows as
                      FinancialReportRow[]
                    }
                  />
                </tbody>
              </>
            )}

          {reportType ===
            "products" && (
              <>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Situação</th>
                    <th>Estoque</th>
                    <th>Mínimo</th>
                    <th>Vendido</th>
                    <th>Compra</th>
                    <th>Venda</th>
                    <th>Custo estoque</th>
                    <th>Receita potencial</th>
                    <th>Lucro potencial</th>
                    <th>Lucro realizado</th>
                    <th>Margem</th>
                  </tr>
                </thead>

                <tbody>
                  <ProductRows
                    rows={
                      rows as
                      ProductReportRow[]
                    }
                  />
                </tbody>
              </>
            )}

          {reportType ===
            "inventory" && (
              <>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Data</th>
                    <th>Movimentação</th>
                    <th>Motivo</th>
                    <th>Quantidade</th>
                    <th>Estoque anterior</th>
                    <th>Estoque atual</th>
                    <th>Custo unitário</th>
                    <th>Valor total</th>
                    <th>Responsável</th>
                  </tr>
                </thead>

                <tbody>
                  <InventoryRows
                    rows={
                      rows as
                      InventoryReportRow[]
                    }
                  />
                </tbody>
              </>
            )}
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={
          onPageChange
        }
      />
    </>
  );
}