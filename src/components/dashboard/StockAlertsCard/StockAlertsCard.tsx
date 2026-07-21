import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  PackageX,
} from "lucide-react";

import { Link } from "react-router-dom";

import SectionCard from "../../common/SectionCard/SectionCard";

import type { StockAlertItem } from "../../../types/Dashboard";

import { formatStockQuantity } from "../../../utils/formatters";

import styles from "./StockAlertsCard.module.css";

interface StockAlertsCardProps {
  items: StockAlertItem[];
}

export default function StockAlertsCard({
  items,
}: StockAlertsCardProps) {
  return (
    <SectionCard
      title="Alertas de estoque"
      description="Produtos que precisam de reposição."
      icon={AlertTriangle}
      badge={`${items.length} alertas`}
      action={
        <Link
          to="/estoque"
          className={styles.viewAllButton}
        >
          Ver estoque
          <ArrowRight size={15} />
        </Link>
      }
      className={styles.card}
      noPadding
    >
      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <CircleAlert size={28} />

          <strong>Nenhum alerta encontrado</strong>

          <span>
            Todos os produtos estão com estoque adequado.
          </span>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => {
            const isCritical =
              item.severity === "critical";

            return (
              <div
                key={item.productId}
                className={styles.alertItem}
              >
                <div
                  className={`${styles.alertIcon} ${
                    isCritical
                      ? styles.criticalIcon
                      : styles.warningIcon
                  }`}
                >
                  {isCritical ? (
                    <PackageX size={19} />
                  ) : (
                    <AlertTriangle size={19} />
                  )}
                </div>

                <div className={styles.alertInformation}>
                  <strong>{item.name}</strong>

                  <span>
                    Mínimo recomendado:{" "}
                    {formatStockQuantity(
                      item.minimumStock,
                      item.unit,
                    )}
                  </span>
                </div>

                <div
                  className={`${styles.currentStock} ${
                    isCritical
                      ? styles.criticalStock
                      : styles.warningStock
                  }`}
                >
                  <span>Atual</span>

                  <strong>
                    {formatStockQuantity(
                      item.currentStock,
                      item.unit,
                    )}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}