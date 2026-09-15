import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  bootstrapCompany,
  getAuthErrorMessage,
  getCurrentCompanyMembership,
  signOut,
} from "../../services/auth/authService";

import "./ConfiguracaoInicial.css";

export default function ConfiguracaoInicial() {
  const navigate =
    useNavigate();

  const [
    legalName,
    setLegalName,
  ] =
    useState("");

  const [
    tradeName,
    setTradeName,
  ] =
    useState("");

  const [
    document,
    setDocument,
  ] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  useEffect(
    () => {
      void getCurrentCompanyMembership()
        .then(
          (
            membership,
          ) => {
            if (
              membership
            ) {
              navigate(
                "/",
                {
                  replace:
                    true,
                },
              );
            }
          },
        );
    },
    [
      navigate,
    ],
  );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage(
      "",
    );

    if (
      !legalName.trim() ||
      !tradeName.trim()
    ) {
      setErrorMessage(
        "Informe a razão social e o nome fantasia.",
      );

      return;
    }

    setIsSubmitting(
      true,
    );

    try {
      await bootstrapCompany({
        legalName,
        tradeName,
        document,
      });

      navigate(
        "/",
        {
          replace:
            true,
        },
      );
    } catch (
      error
    ) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
        ),
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  async function handleExit() {
    await signOut();

    navigate(
      "/login",
      {
        replace:
          true,
      },
    );
  }

  return (
    <main className="initial-company-page">
      <section className="initial-company-card">
        <header>
          <span>
            Configuração inicial
          </span>

          <h1>
            Cadastre sua empresa
          </h1>

          <p>
            Esses dados identificam a empresa dentro do sistema.
            Não existe integração fiscal ou vínculo com a SEFAZ.
          </p>
        </header>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label>
            Razão social *

            <input
              type="text"
              value={
                legalName
              }
              onChange={(
                event,
              ) =>
                setLegalName(
                  event.target
                    .value,
                )
              }
              placeholder="Nome empresarial"
              disabled={
                isSubmitting
              }
            />
          </label>

          <label>
            Nome fantasia *

            <input
              type="text"
              value={
                tradeName
              }
              onChange={(
                event,
              ) =>
                setTradeName(
                  event.target
                    .value,
                )
              }
              placeholder="Nome exibido no sistema"
              disabled={
                isSubmitting
              }
            />
          </label>

          <label>
            CNPJ

            <input
              type="text"
              value={
                document
              }
              onChange={(
                event,
              ) =>
                setDocument(
                  event.target
                    .value,
                )
              }
              placeholder="Opcional"
              disabled={
                isSubmitting
              }
            />
          </label>

          {errorMessage && (
            <p className="initial-company-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? "Criando empresa..."
              : "Concluir configuração"}
          </button>
        </form>

        <button
          type="button"
          className="initial-company-exit"
          onClick={
            handleExit
          }
          disabled={
            isSubmitting
          }
        >
          Sair desta conta
        </button>
      </section>
    </main>
  );
}