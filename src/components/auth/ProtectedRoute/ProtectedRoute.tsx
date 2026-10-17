import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../../../contexts/AuthContext/useAuth";
import useCompany from "../../../contexts/CompanyContext/useCompany";
import ErrorState from "../../common/ErrorState/ErrorState";

type ProtectedRouteProps = {
  requireCompany?:
    boolean;
};

export default function ProtectedRoute({
  requireCompany = true,
}: ProtectedRouteProps) {
  const {
    session,
    isLoading: isAuthLoading,
  } =
    useAuth();

  const {
    membership,
    isLoading: isCompanyLoading,
    error: companyError,
    refreshCompany,
  } = useCompany();

  const location =
    useLocation();

  if (
    isAuthLoading ||
    (
      session &&
      requireCompany &&
      isCompanyLoading &&
      !companyError
    )
  ) {
    return (
      <div
        style={{
          alignItems:
            "center",

          display:
            "flex",

          justifyContent:
            "center",

          minHeight:
            "100vh",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (
    !session
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  if (
    companyError
  ) {
    return (
      <ErrorState
        title="Não foi possível carregar a empresa"
        description={companyError}
        onRetry={() => {
          void refreshCompany();
        }}
      />
    );
  }

  if (
    requireCompany &&
    !membership
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <Outlet />
  );
}
