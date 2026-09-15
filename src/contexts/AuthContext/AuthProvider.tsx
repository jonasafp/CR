import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  PropsWithChildren,
} from "react";

import type {
  Session,
} from "@supabase/supabase-js";

import {
  supabase,
} from "../../lib/supabase";

import AuthContext from "./AuthContext";

export default function AuthProvider({
  children,
}: PropsWithChildren) {
  const [
    session,
    setSession,
  ] =
    useState<
      Session
      | null
    >(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  useEffect(
    () => {
      let isMounted =
        true;

      void supabase.auth
        .getSession()
        .then(
          ({
            data,
          }) => {
            if (
              !isMounted
            ) {
              return;
            }

            setSession(
              data.session,
            );

            setIsLoading(
              false,
            );
          },
        )
        .catch(
          () => {
            if (
              !isMounted
            ) {
              return;
            }

            setSession(
              null,
            );

            setIsLoading(
              false,
            );
          },
        );

      const {
        data: {
          subscription,
        },
      } =
        supabase.auth
          .onAuthStateChange(
            (
              _event,
              nextSession,
            ) => {
              if (
                !isMounted
              ) {
                return;
              }

              setSession(
                nextSession,
              );

              setIsLoading(
                false,
              );
            },
          );

      return () => {
        isMounted =
          false;

        subscription
          .unsubscribe();
      };
    },
    [],
  );

  const value =
    useMemo(
      () => ({
        session,

        user:
          session
            ?.user ??
          null,

        isLoading,
      }),
      [
        session,
        isLoading,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}