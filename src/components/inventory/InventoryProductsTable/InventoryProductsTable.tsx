import {
  ArrowRightLeft,
  Boxes,
  Package,
} from "lucide-react";

import EmptyState from "../../common/EmptyState/EmptyState";

import type { Product } from "../../../types/Product";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../../utils/formatters";

import { calculateProductFinancialData } from "../../../utils/productCalculations";

import {
  isProductLowStock,
  isProductOutOfStock,
} from "../../../utils/productFilters";

import styles from "./InventoryProductsTable.module.css";

interface InventoryProductsTableProps {
  products: Product[];

  onCreateMovement: (
    product: Product,
  ) => void;
}

function getStockStatus(product: Product) {
  if (isProductOutOfStock(product)) {
    return {
      label: "Sem estoque",
      className: styles.out,
    };
  }

  if (isProductLowStock(product)) {
    return {
      label: "Estoque baixo",
      className: styles.low,
    };
  }

  return {
    label: "Disponível",
    className: styles.available,
  };
}

export default function InventoryProductsTable({
  products,
  onCreateMovement,
}: InventoryProductsTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Boxes}
        title="Nenhum produto encontrado"
        description="Não existem produtos correspondentes aos filtros selecionados."
      />
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Estoque atual</th>
            <th>Estoque mínimo</th>
            <th>Condição</th>
            <th>Custo em estoque</th>
            <th>Receita potencial</th>
            <th>Lucro potencial</th>
            <th aria-label="Ações" />
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const financial =
              calculateProductFinancialData(product);

            const stockStatus =
              getStockStatus(product);

            return (
              <tr key={product.id}>
                <td>
                  <div className={styles.product}>
                    <div
                      className={styles.productIcon}
                    >
                      <Package size={20} />
                    </div>

                    <div>
                      <strong>{product.name}</strong>

                      <span>
                        {product.code} ·{" "}
                        {product.category}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <strong>
                    {formatStockQuantity(
                      product.stockQuantity,
                      product.stockUnit,
                    )}
                  </strong>
                </td>

                <td>
                  {formatStockQuantity(
                    product.minimumStock,
                    product.stockUnit,
                  )}
                </td>

                <td>
                  <span
                    className={`${styles.status} ${stockStatus.className}`}
                  >
                    {stockStatus.label}
                  </span>
                </td>

                <td>
                  {formatCurrency(
                    financial.stockCost,
                  )}
                </td>

                <td>
                  {formatCurrency(
                    financial.estimatedRevenue,
                  )}
                </td>

                <td>
                  <strong className={styles.profit}>
                    {formatCurrency(
                      financial.estimatedProfit,
                    )}
                  </strong>
                </td>

                <td>
                  <button
                    type="button"
                    className={
                      styles.movementButton
                    }
                    onClick={() =>
                      onCreateMovement(product)
                    }
                  >
                    <ArrowRightLeft size={15} />
                    Movimentar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}