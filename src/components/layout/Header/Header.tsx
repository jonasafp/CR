import {
  Bell,
  CalendarDays,
  Menu,
  Search,
} from "lucide-react";
import { useLocation } from "react-router-dom";

import styles from "./Header.module.css";

import { businessConfig } from "../../../config/businessConfig";

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface PageInformation {
  title: string;
  description: string;
}

const pageInformation: Record<string, PageInformation> = {
  "/": {
    title: "Resumo",
    description:
      "Visão geral das principais informações do seu negócio.",
  },
  "/estoque": {
    title: "Estoque",
    description:
      "Acompanhe quantidades, entradas, saídas e níveis de reposição.",
  },
  "/vendas": {
    title: "Vendas",
    description:
      "Consulte e registre as movimentações comerciais internas.",
  },
  "/produtos": {
    title: "Produtos",
    description:
      "Gerencie o catálogo, os custos e os preços de venda.",
  },
  "/financeiro": {
    title: "Financeiro",
    description:
      "Analise receitas, custos, resultados e margens.",
  },
  "/relatorios": {
    title: "Relatórios",
    description:
      "Visualize indicadores para apoiar suas decisões.",
  },
  "/configuracoes": {
    title: "Configurações",
    description:
      "Personalize os dados e as preferências do sistema.",
  },
};

function formatCurrentDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function Header({
  onToggleSidebar,
}: HeaderProps) {
  const location = useLocation();

  const currentPage =
    pageInformation[location.pathname] ?? pageInformation["/"];

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleArea}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={onToggleSidebar}
            aria-label="Abrir menu lateral"
          >
            <Menu size={23} />
          </button>

          <div>
            <h1>{currentPage.title}</h1>
            <p>{currentPage.description}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <label className={styles.searchBox}>
            <Search size={18} />

            <input
              type="search"
              placeholder="Pesquisar..."
              aria-label="Pesquisar no sistema"
            />
          </label>

          <div className={styles.dateBox}>
            <CalendarDays size={18} />

            <span>{formatCurrentDate()}</span>
          </div>

          <button
            type="button"
            className={styles.notificationButton}
            aria-label="Notificações"
          >
            <Bell size={20} />
            <span className={styles.notificationDot} />
          </button>

          <div className={styles.profile}>
            <div className={styles.profileAvatar}>AD</div>

            <div className={styles.profileText}>
              <strong>Administrador</strong>
              <span>{businessConfig.tradeName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}