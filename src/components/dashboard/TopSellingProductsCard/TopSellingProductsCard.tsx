import {
  ArrowRight,
  Medal,
  PackageSearch,
  Trophy,
} from "lucide-react";

import { Link } from "react-router-dom";

import TableCard from "../../common/TableCard/TableCard";

import type { TopSellingProduct } from "../../../types/Dashboard";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../../utils/formatters";

import styles from "./TopSellingProductsCard.module.css";

import EmptyState from "../../common/EmptyState/EmptyState";

interface TopSellingProductsCardProps {
  items: TopSellingProduct[];
}

export default function TopSellingProductsCard({
  items,
}: TopSellingProductsCardProps) {
  if (items.length === 0) {
    return (
      <TableCard
        title="Produtos mais vendidos"
        description="Ranking por quantidade vendida no período."
        icon={Trophy}
        badge="Sem dados"
        className={styles.card}
      >
        <EmptyState
          icon={PackageSearch}
          title="Nenhuma venda registrada"
          description="O ranking será exibido quando existirem produtos com quantidade vendida."
        />
      </TableCard>
    );
  }
  return (
    <TableCard
      title="Produtos mais vendidos"
      description="Ranking por quantidade vendida no período."
      icon={Trophy}
      badge="Top 5"
      action={
        <Link
          to="/vendas"
          className={styles.viewAllButton}
        >
          Ver vendas
          <ArrowRight size={15} />
        </Link>
      }
      className={styles.card}
    >
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Faturamento</th>
              <th>Lucro</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={item.productId}>
                <td>
                  <div
                    className={`${styles.position} ${index === 0
                        ? styles.firstPosition
                        : ""
                      }`}
                  >
                    {index === 0 ? (
                      <Medal size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                </td>

                <td>
                  <div className={styles.product}>
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>
                </td>

                <td>
                  {formatStockQuantity(
                    item.quantitySold,
                    item.unit,
                  )}
                </td>

                <td>{formatCurrency(item.revenue)}</td>

                <td>
                  <strong className={styles.profit}>
                    {formatCurrency(item.profit)}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}