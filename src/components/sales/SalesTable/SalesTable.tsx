import {
  Ban,
  Eye,
  Printer,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";

import EmptyState from "../../common/EmptyState/EmptyState";

import PaymentMethodBadge from "../PaymentMethodBadge/PaymentMethodBadge";
import SaleStatusBadge from "../SaleStatusBadge/SaleStatusBadge";

import type {
  Sale,
} from "../../../domain/sales/Sale";

import {
  formatCurrency,
} from "../../../utils/formatters";

import styles from "./SalesTable.module.css";

interface SalesTableProps {
  sales: Sale[];

  onView: (sale: Sale) => void;
  onPrint: (sale: Sale) => void;
  onCancel: (sale: Sale) => void;
  onCreate: () => void;
}

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export default function SalesTable({
  sales,
  onView,
  onPrint,
  onCancel,
  onCreate,
}: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nenhuma venda encontrada"
        description="Altere os filtros utilizados ou registre uma nova venda."
        action={
          <button
            type="button"
            className={styles.emptyAction}
            onClick={onCreate}
          >
            Registrar venda
          </button>
        }
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Venda</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Itens</th>
            <th>Pagamento</th>
            <th>Subtotal</th>
            <th>Desconto</th>
            <th>Total</th>
            <th>Lucro</th>
            <th>Situação</th>
            <th aria-label="Ações" />
          </tr>
        </thead>

        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>
                <div className={styles.number}>
                  <div>
                    <ReceiptText size={18} />
                  </div>

                  <strong>
                    {sale.number}
                  </strong>
                </div>
              </td>

              <td>
                {formatDateTime(
                  sale.createdAt,
                )}
              </td>

              <td>
                {sale.customerName ??
                  "Cliente balcão"}
              </td>

              <td>
                {sale.items.length}
              </td>

              <td>
                <PaymentMethodBadge
                  method={
                    sale.paymentMethod
                  }
                />
              </td>

              <td>
                {formatCurrency(
                  sale.subtotal,
                )}
              </td>

              <td>
                {formatCurrency(
                  sale.discount,
                )}
              </td>

              <td>
                <strong
                  className={styles.total}
                >
                  {formatCurrency(
                    sale.total,
                  )}
                </strong>
              </td>

              <td>
                <strong
                  className={styles.profit}
                >
                  {formatCurrency(
                    sale.profit,
                  )}
                </strong>
              </td>

              <td>
                <SaleStatusBadge
                  status={sale.status}
                />
              </td>

              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    title="Visualizar venda"
                    onClick={() =>
                      onView(sale)
                    }
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    type="button"
                    title="Imprimir comprovante"
                    onClick={() =>
                      onPrint(sale)
                    }
                  >
                    <Printer size={16} />
                  </button>

                  <button
                    type="button"
                    title="Cancelar venda"
                    disabled={
                      sale.status !==
                      "completed"
                    }
                    className={
                      styles.cancelButton
                    }
                    onClick={() =>
                      onCancel(sale)
                    }
                  >
                    <Ban size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}