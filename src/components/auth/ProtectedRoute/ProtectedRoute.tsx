import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../../../contexts/AuthContext/useAuth";
import useCompany from "../../../contexts/CompanyContext/useCompany";
import ErrorState from "../../common/ErrorState/ErrorState";
import {
  controlService,
} from "../../../services/control/controlService";

type ProtectedRouteProps = {
  requireCompany?:
    boolean;
};

export default function ProtectedRoute({
  requireCompany = true,
}: ProtectedRouteProps) {
  const [isCheckingControl, setIsCheckingControl] = useState(true);
  const [isControlAdmin, setIsControlAdmin] = useState(false);
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

  useEffect(() => {
    let active = true;

    if (isAuthLoading) {
      return () => {
        active = false;
      };
    }

    if (!session) {
      setIsControlAdmin(false);
      setIsCheckingControl(false);
      return () => {
        active = false;
      };
    }

    setIsCheckingControl(true);

    void controlService.getSession()
      .then((profile) => {
        if (active) {
          setIsControlAdmin(Boolean(profile));
        }
      })
      .catch(() => {
        if (active) {
          setIsControlAdmin(false);
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingControl(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, session]);

  if (
    isAuthLoading ||
    isCheckingControl ||
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

  if (isControlAdmin) {
    return <Navigate to="/controle" replace />;
  }

  if (
    membership?.must_change_password &&
    location.pathname !== "/definir-senha"
  ) {
    return <Navigate to="/definir-senha" replace />;
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
