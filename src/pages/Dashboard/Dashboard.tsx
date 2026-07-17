import { dashboardData } from "../../data/mock";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../utils/formatters";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { summary } = dashboardData;

  return (
    <section className={styles.page}>
      <div className={styles.placeholder}>
        <span>Dados carregados</span>

        <h2>Bem-vindo ao Gestor Fácil</h2>

        <p>
          A estrutura de dados foi configurada e os cálculos
          financeiros estão funcionando.
        </p>

        <div style={{ marginTop: "24px" }}>
          <p>
            Estoque principal:{" "}
            <strong>
              {formatStockQuantity(
                summary.totalStockQuantity,
                summary.principalStockUnit,
              )}
            </strong>
          </p>

          <p>
            Quantidade vendida:{" "}
            <strong>
              {formatStockQuantity(
                summary.totalSoldQuantity,
                summary.principalStockUnit,
              )}
            </strong>
          </p>

          <p>
            Faturamento realizado:{" "}
            <strong>
              {formatCurrency(summary.realizedRevenue)}
            </strong>
          </p>

          <p>
            Lucro realizado:{" "}
            <strong>
              {formatCurrency(summary.realizedProfit)}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}