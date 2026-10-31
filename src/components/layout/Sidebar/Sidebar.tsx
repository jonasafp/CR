import {
  ChevronRight,
  LogOut,
  Settings,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import { NavLink } from "react-router-dom";

import { businessConfig } from "../../../config/businessConfig";
import { useSettings, } from "../../../hooks/useSettings";
import { mainNavigationItems } from "../../../constants/navigation";
import useCompany from "../../../contexts/CompanyContext/useCompany";
import useAuth from "../../../contexts/AuthContext/useAuth";
import {
  getRoleLabel,
  hasPermission,
} from "../../../domain/auth/permissions";
import {
  signOut,
} from "../../../services/auth/authService";
import {
  useNotifications,
} from "../../../hooks/useNotifications";
import {
  getErrorMessage,
} from "../../../utils/errors";

import styles from "./Sidebar.module.css";

import {
  getStockUnitLabel,
} from "../../../utils/formatters";

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

  const {
    membership,
  } = useCompany();

  const {
    user,
  } = useAuth();

  const notifications =
    useNotifications();

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false);

  const business =
    settings.business;

  const enabledNavigationItems =
    mainNavigationItems.filter(
      (item) =>
        businessConfig.modules[item.module] &&
        hasPermission(
          membership?.role,
          item.permission,
        ),
    );

  async function handleLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      notifications.error(
        "Não foi possível sair",
        getErrorMessage(error),
      );

      setIsSigningOut(false);
    }
  }

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""
        }`}
    >
      <div className={styles.brandArea}>
        <div className={styles.brandIcon}>
          <img
            src="/brand/gestor-facil-logo.png"
            alt="Gestor Fácil"
          />
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
          <span>
            Unidade principal:{" "}
            {getStockUnitLabel(
              settings.general
                .principalStockUnit,
            )}
          </span>
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

        {hasPermission(
          membership?.role,
          "manageSettings",
        ) && (
          <>
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
          </>
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userSummary}>
          <div className={styles.userAvatar}>
            {getRoleLabel(membership?.role)
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className={styles.userInfo}>
            <strong>{getRoleLabel(membership?.role)}</strong>
            <span>{user?.email ?? "Usuário autenticado"}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
          disabled={isSigningOut}
        >
          <LogOut size={20} />

          <span className={styles.menuLabel}>
            {isSigningOut ? "Saindo..." : "Sair"}
          </span>
        </button>
      </div>
    </aside>
  );
}
