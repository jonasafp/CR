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

import {
  getCurrentCompanyMembership,
} from "../../../services/auth/authService";

type ProtectedRouteProps = {
  requireCompany?:
    boolean;
};

export default function ProtectedRoute({
  requireCompany = true,
}: ProtectedRouteProps) {
  const {
    session,
    isLoading,
  } =
    useAuth();

  const location =
    useLocation();

  const [
    hasCompany,
    setHasCompany,
  ] =
    useState<
      boolean
      | null
    >(
      requireCompany
        ? null
        : true,
    );

  const [
    companyError,
    setCompanyError,
  ] =
    useState("");

  useEffect(
    () => {
      let isMounted =
        true;

      if (
        isLoading ||
        !session ||
        !requireCompany
      ) {
        return () => {
          isMounted =
            false;
        };
      }

      setHasCompany(
        null,
      );

      setCompanyError(
        "",
      );

      void getCurrentCompanyMembership()
        .then(
          (
            membership,
          ) => {
            if (
              !isMounted
            ) {
              return;
            }

            setHasCompany(
              Boolean(
                membership,
              ),
            );
          },
        )
        .catch(
          (
            error:
              unknown,
          ) => {
            if (
              !isMounted
            ) {
              return;
            }

            setCompanyError(
              error instanceof Error
                ? error.message
                : "Não foi possível verificar a empresa.",
            );
          },
        );

      return () => {
        isMounted =
          false;
      };
    },
    [
      isLoading,
      session,
      requireCompany,
    ],
  );

  if (
    isLoading ||
    (
      session &&
      requireCompany &&
      hasCompany ===
        null &&
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
      <div
        style={{
          padding:
            "32px",
        }}
      >
        <h1>
          Não foi possível carregar a empresa
        </h1>

        <p>
          {companyError}
        </p>

        <button
          type="button"
          onClick={() =>
            window.location
              .reload()
          }
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (
    requireCompany &&
    !hasCompany
  ) {
    return (
      <Navigate
        to="/configuracao-inicial"
        replace
      />
    );
  }

  return (
    <Outlet />
  );
}