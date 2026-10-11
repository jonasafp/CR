import type {
  PropsWithChildren,
} from "react";
import {
  Navigate,
} from "react-router-dom";

import useCompany from "../../../contexts/CompanyContext/useCompany";
import {
  hasPermission,
} from "../../../domain/auth/permissions";
import type {
  AppPermission,
} from "../../../domain/auth/permissions";

type RoleProtectedRouteProps = PropsWithChildren<{
  permission: AppPermission;
}>;

export default function RoleProtectedRoute({
  children,
  permission,
}: RoleProtectedRouteProps) {
  const {
    membership,
  } = useCompany();

  if (
    !hasPermission(
      membership?.role,
      permission,
    )
  ) {
    return (
      <Navigate
        to="/acesso-negado"
        replace
      />
    );
  }

  return children;
}
