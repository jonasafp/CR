import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  PropsWithChildren,
} from "react";

import {
  supabase,
} from "../../lib/supabase";

import {
  getCurrentCompanyMembership,
} from "../../services/auth/authService";

import type {
  CurrentCompanyMembership,
} from "../../services/auth/authService";

import useAuth from "../AuthContext/useAuth";

import CompanyContext from "./CompanyContext";

import type {
  ActiveCompany,
} from "./CompanyContext";

export default function CompanyProvider({
  children,
}: PropsWithChildren) {
  const {
    session,
    isLoading:
      isAuthLoading,
  } =
    useAuth();

  const [
    company,
    setCompany,
  ] =
    useState<
      ActiveCompany
      | null
    >(null);

  const [
    membership,
    setMembership,
  ] =
    useState<
      CurrentCompanyMembership
      | null
    >(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const refreshCompany =
    useCallback(
      async () => {
        if (
          !session
        ) {
          setCompany(
            null,
          );

          setMembership(
            null,
          );

          setError(
            "",
          );

          setIsLoading(
            false,
          );

          return;
        }

        setIsLoading(
          true,
        );

        setError(
          "",
        );

        try {
          const currentMembership =
            await getCurrentCompanyMembership();

          setMembership(
            currentMembership,
          );

          if (
            !currentMembership
          ) {
            setCompany(
              null,
            );

            return;
          }

          const {
            data,
            error:
              companyError,
          } =
            await supabase
              .from(
                "companies",
              )
              .select(
                [
                  "id",
                  "legal_name",
                  "trade_name",
                  "document",
                  "email",
                  "phone",
                  "city",
                  "state",
                  "logo_url",
                  "status",
                ].join(","),
              )
              .eq(
                "id",
                currentMembership
                  .company_id,
              )
              .single();

          if (
            companyError
          ) {
            throw companyError;
          }

          setCompany({
            id:
              data.id,

            legalName:
              data.legal_name,

            tradeName:
              data.trade_name,

            document:
              data.document,

            email:
              data.email,

            phone:
              data.phone,

            city:
              data.city,

            state:
              data.state,

            logoUrl:
              data.logo_url,

            status:
              data.status,
          });
        } catch (
          loadError
        ) {
          setCompany(
            null,
          );

          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os dados da empresa.",
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [
        session,
      ],
    );

  useEffect(
    () => {
      if (
        isAuthLoading
      ) {
        return;
      }

      void refreshCompany();
    },
    [
      isAuthLoading,
      refreshCompany,
    ],
  );

  const value =
    useMemo(
      () => ({
        company,
        membership,

        companyId:
          company?.id ??
          null,

        isLoading,
        error,
        refreshCompany,
      }),
      [
        company,
        membership,
        isLoading,
        error,
        refreshCompany,
      ],
    );

  return (
    <CompanyContext.Provider
      value={value}
    >
      {children}
    </CompanyContext.Provider>
  );
}