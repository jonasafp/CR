import {
  BarChart3,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: typeof BarChart3;
  end?: boolean;
}

const menuItems: MenuItem[] = [
  {
    label: "Resumo",
    path: "/",
    icon: BarChart3,
    end: true,
  },
  {
    label: "Estoque",
    path: "/estoque",
    icon: Boxes,
  },
  {
    label: "Vendas",
    path: "/vendas",
    icon: ShoppingCart,
  },
  {
    label: "Produtos",
    path: "/produtos",
    icon: Package,
  },
  {
    label: "Financeiro",
    path: "/financeiro",
    icon: CircleDollarSign,
  },
  {
    label: "Relatórios",
    path: "/relatorios",
    icon: BarChart3,
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  function handleLogout() {
    /*
     * O logout será implementado quando adicionarmos autenticação.
     * Por enquanto, o botão permanece preparado visualmente.
     */
    console.info("Logout ainda não implementado.");
  }

  return (
    <aside
      className={`${styles.sidebar} ${
        isOpen ? styles.sidebarOpen : ""
      }`}
    >
      <div className={styles.brandArea}>
        <div className={styles.brandIcon}>
          <Store size={25} strokeWidth={2.3} />
        </div>

        <div className={styles.brandText}>
          <strong>Gestor Fácil</strong>
          <span>Controle interno</span>
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <X size={22} />
        </button>
      </div>

      <div className={styles.businessCard}>
        <div className={styles.businessAvatar}>CR</div>

        <div className={styles.businessInfo}>
          <strong>Casa de Rações</strong>
          <span>Unidade principal</span>
        </div>

        <ChevronRight
          size={18}
          className={styles.businessArrow}
        />
      </div>

      <nav
        className={styles.navigation}
        aria-label="Navegação principal"
      >
        <span className={styles.sectionLabel}>Menu principal</span>

        <ul className={styles.menuList}>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.menuLink} ${
                      isActive ? styles.menuLinkActive : ""
                    }`
                  }
                >
                  <span className={styles.menuIcon}>
                    <Icon size={21} strokeWidth={2} />
                  </span>

                  <span className={styles.menuLabel}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <span
          className={`${styles.sectionLabel} ${styles.settingsLabel}`}
        >
          Sistema
        </span>

        <ul className={styles.menuList}>
          <li>
            <NavLink
              to="/configuracoes"
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.menuLink} ${
                  isActive ? styles.menuLinkActive : ""
                }`
              }
            >
              <span className={styles.menuIcon}>
                <Settings size={21} strokeWidth={2} />
              </span>

              <span className={styles.menuLabel}>
                Configurações
              </span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userSummary}>
          <div className={styles.userAvatar}>AD</div>

          <div className={styles.userInfo}>
            <strong>Administrador</strong>
            <span>Gestor do negócio</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <LogOut size={20} />

          <span className={styles.menuLabel}>Sair</span>
        </button>
      </div>
    </aside>
  );
}