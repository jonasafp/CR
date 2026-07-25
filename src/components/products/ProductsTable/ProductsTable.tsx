import {
  Archive,
  MoreHorizontal,
  Package,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

import EmptyState from "../../common/EmptyState/EmptyState";
import ProductStatusBadge from "../ProductStatusBadge/ProductStatusBadge";

import type { Product } from "../../../types/Product";

import { calculateProductFinancialData } from "../../../utils/productCalculations";

import {
  formatCurrency,
  formatPercentage,
  formatStockQuantity,
} from "../../../utils/formatters";

import {
  isProductLowStock,
  isProductOutOfStock,
} from "../../../utils/productFilters";

import styles from "./ProductsTable.module.css";

interface ProductsTableProps {
  products: Product[];

  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
}

function getStockClass(product: Product): string {
  if (isProductOutOfStock(product)) {
    return styles.stockOut;
  }

  if (isProductLowStock(product)) {
    return styles.stockLow;
  }

  return styles.stockAvailable;
}

function getStockLabel(product: Product): string {
  if (isProductOutOfStock(product)) {
    return "Sem estoque";
  }

  if (isProductLowStock(product)) {
    return "Estoque baixo";
  }

  return "Disponível";
}

export default function ProductsTable({
  products,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreate,
}: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Archive}
        title="Nenhum produto encontrado"
        description="Altere os filtros utilizados ou cadastre um novo produto para começar."
        action={
          <button
            type="button"
            className={styles.emptyAction}
            onClick={onCreate}
          >
            Cadastrar produto
          </button>
        }
      />
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Compra</th>
            <th>Venda</th>
            <th>Lucro unitário</th>
            <th>Margem</th>
            <th>Situação</th>
            <th aria-label="Ações" />
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const financial =
              calculateProductFinancialData(product);

            return (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productImage}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      ) : (
                        <Package
                          size={21}
                          strokeWidth={1.8}
                        />
                      )}
                    </div>

                    <div className={styles.productInfo}>
                      <strong>{product.name}</strong>

                      <span>
                        Código: {product.code}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className={styles.category}>
                    {product.category}
                  </span>
                </td>

                <td>
                  <div
                    className={`${styles.stock} ${getStockClass(
                      product,
                    )}`}
                  >
                    <strong>
                      {formatStockQuantity(
                        product.stockQuantity,
                        product.stockUnit,
                      )}
                    </strong>

                    <span>{getStockLabel(product)}</span>
                  </div>
                </td>

                <td>
                  {formatCurrency(product.purchasePrice)}
                </td>

                <td>
                  <strong className={styles.salePrice}>
                    {formatCurrency(product.salePrice)}
                  </strong>
                </td>

                <td>
                  <strong className={styles.profit}>
                    {formatCurrency(
                      financial.profitPerUnit,
                    )}
                  </strong>
                </td>

                <td>
                  {formatPercentage(
                    financial.profitMarginPercentage,
                  )}
                </td>

                <td>
                  <ProductStatusBadge
                    status={product.status}
                  />
                </td>

                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      title="Editar produto"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      title={
                        product.status === "active"
                          ? "Desativar produto"
                          : "Ativar produto"
                      }
                      onClick={() =>
                        onToggleStatus(product)
                      }
                    >
                      <Power size={16} />
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      title="Excluir produto"
                      onClick={() => onDelete(product)}
                    >
                      <Trash2 size={16} />
                    </button>

                    <MoreHorizontal
                      size={16}
                      className={styles.moreIcon}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}