import {
  ChevronRight,
  LogOut,
  Settings,
  Store,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { businessConfig } from "../../../config/businessConfig";
import { useSettings, } from "../../../hooks/useSettings";
import { mainNavigationItems } from "../../../constants/navigation";

import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const {
    settings,
  } = useSettings();

  const business =
    settings.business;

  const enabledNavigationItems =
    mainNavigationItems.filter(
      (item) => businessConfig.modules[item.module],
    );

  function handleLogout() {
    console.info("Logout ainda não implementado.");
  }

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""
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
        <div className={styles.businessAvatar}>
          {business.logo ? (
            <img
              src={business.logo}
              alt={`Logotipo de ${business.tradeName}`}
            />
          ) : (
            business.shortName ||
            businessConfig.shortName
          )}
        </div>

        <div className={styles.businessInfo}>
          <strong>
            {business.tradeName ||
              businessConfig.tradeName}
          </strong>
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
        <span className={styles.sectionLabel}>
          Menu principal
        </span>

        <ul className={styles.menuList}>
          {enabledNavigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${styles.menuLink} ${isActive ? styles.menuLinkActive : ""
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
                `${styles.menuLink} ${isActive ? styles.menuLinkActive : ""
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