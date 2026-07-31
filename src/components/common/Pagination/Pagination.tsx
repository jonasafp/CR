import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;

  totalItems: number;
  pageSize: number;

  onPageChange: (
    page: number,
  ) => void;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const firstItem =
    totalItems === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastItem = Math.min(
    page * pageSize,
    totalItems,
  );

  return (
    <footer className={styles.container}>
      <span>
        Exibindo {firstItem} a {lastItem} de{" "}
        {totalItems} registros
      </span>

      <div className={styles.navigation}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
        >
          <ChevronLeft size={16} />
        </button>

        <strong>
          Página {page} de {totalPages}
        </strong>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() =>
            onPageChange(page + 1)
          }
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </footer>
  );
}