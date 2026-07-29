import {
  History,
  Package,
} from "lucide-react";

import EmptyState from "../../common/EmptyState/EmptyState";
import MovementTypeBadge from "../MovementTypeBadge/MovementTypeBadge";

import type { InventoryMovement } from "../../../types/Inventory";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../../utils/formatters";

import styles from "./InventoryMovementsTable.module.css";

interface InventoryMovementsTableProps {
  movements: InventoryMovement[];
}

const reasonLabels = {
  purchase: "Compra",
  sale: "Venda",
  manual_adjustment: "Ajuste manual",
  loss: "Perda",
  damage: "Avaria",
  expiration: "Vencimento",
  return: "Devolução",
  initial_balance: "Saldo inicial",
  other: "Outro",
} satisfies Record<
  InventoryMovement["reason"],
  string
>;

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InventoryMovementsTable({
  movements,
}: InventoryMovementsTableProps) {
  if (movements.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nenhuma movimentação encontrada"
        description="As entradas, saídas e ajustes aparecerão nesta área."
      />
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Produto</th>
            <th>Movimentação</th>
            <th>Motivo</th>
            <th>Quantidade</th>
            <th>Saldo anterior</th>
            <th>Saldo atual</th>
            <th>Valor</th>
            <th>Responsável</th>
          </tr>
        </thead>

        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td>
                {formatDateTime(
                  movement.createdAt,
                )}
              </td>

              <td>
                <div className={styles.product}>
                  <div className={styles.icon}>
                    <Package size={18} />
                  </div>

                  <div>
                    <strong>
                      {movement.productName}
                    </strong>

                    <span>
                      {movement.productCode}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <MovementTypeBadge
                  type={movement.type}
                />
              </td>

              <td>
                {reasonLabels[movement.reason]}
              </td>

              <td>
                <strong>
                  {formatStockQuantity(
                    movement.quantity,
                    movement.unit,
                  )}
                </strong>
              </td>

              <td>
                {formatStockQuantity(
                  movement.previousStock,
                  movement.unit,
                )}
              </td>

              <td>
                <strong
                  className={styles.currentStock}
                >
                  {formatStockQuantity(
                    movement.currentStock,
                    movement.unit,
                  )}
                </strong>
              </td>

              <td>
                {formatCurrency(
                  movement.totalValue,
                )}
              </td>

              <td>{movement.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}