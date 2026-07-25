import type { ProductStatus } from "../../../types/Product";

import styles from "./ProductStatusBadge.module.css";

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

const statusLabels: Record<ProductStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export default function ProductStatusBadge({
  status,
}: ProductStatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[status]}`}
    >
      <span className={styles.dot} />

      {statusLabels[status]}
    </span>
  );
}