import {
  MoreHorizontal,
} from "lucide-react";
import {
  NavLink,
} from "react-router-dom";

import { businessConfig } from "../../../config/businessConfig";
import { mainNavigationItems } from "../../../constants/navigation";
import useCompany from "../../../contexts/CompanyContext/useCompany";
import {
  hasPermission,
} from "../../../domain/auth/permissions";
import {
  isMobileApp,
} from "../../../services/mobile/mobilePlatformService";

import styles from "./MobileBottomNavigation.module.css";

interface MobileBottomNavigationProps {
  onOpenMenu: () => void;
}

const primaryPaths = [
  "/",
  "/vendas",
  "/produtos",
  "/estoque",
];

export default function MobileBottomNavigation({
  onOpenMenu,
}: MobileBottomNavigationProps) {
  const {
    membership,
  } = useCompany();

  if (!isMobileApp()) {
    return null;
  }

  const primaryItems = primaryPaths
    .map((path) =>
      mainNavigationItems.find(
        (item) => item.path === path,
      ),
    )
    .filter((item) =>
      Boolean(
        item &&
        businessConfig.modules[item.module] &&
        hasPermission(
          membership?.role,
          item.permission,
        ),
      ),
    );

  return (
    <nav
      className={styles.navigation}
      aria-label="Navegação rápida"
    >
      <div className={styles.navigationInner}>
        {primaryItems.map((item) => {
          if (!item) {
            return null;
          }

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navigationItem} ${isActive ? styles.active : ""}`
              }
            >
              <Icon size={21} strokeWidth={2.1} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          className={styles.navigationItem}
          onClick={onOpenMenu}
          aria-label="Abrir menu completo"
        >
          <MoreHorizontal size={22} strokeWidth={2.1} />
          <span>Mais</span>
        </button>
      </div>
    </nav>
  );
}
