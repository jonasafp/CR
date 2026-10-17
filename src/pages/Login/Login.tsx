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

import useAuth from "../../contexts/AuthContext/useAuth";

import {
  getAuthErrorMessage,
  getCurrentCompanyMembership,
  signIn,
  signOut,
} from "../../services/auth/authService";

import "./Login.css";

export default function Login() {
  const navigate =
    useNavigate();

  const {
    session,
    isLoading:
      isAuthLoading,
  } =
    useAuth();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
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
      if (
        isAuthLoading ||
        !session
      ) {
        return;
      }

      void getCurrentCompanyMembership()
        .then(
          (
            membership,
          ) => {
            if (membership) {
              navigate("/", { replace: true });
              return;
            }

            void signOut();
            setErrorMessage("Esta conta não está vinculada a uma empresa ativa.");
          },
        );
    },
    [
      session,
      isAuthLoading,
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
      !email.trim() ||
      !password
    ) {
      setErrorMessage(
        "Informe o e-mail e a senha.",
      );

      return;
    }

    if (
      password.length <
      6
    ) {
      setErrorMessage(
        "A senha deve possuir pelo menos 6 caracteres.",
      );

      return;
    }

    setIsSubmitting(
      true,
    );

    try {
      await signIn(
        email,
        password,
      );

      const membership =
        await getCurrentCompanyMembership();

      if (!membership) {
        await signOut();
        setErrorMessage("Esta conta não está vinculada a uma empresa ativa.");
        return;
      }

      navigate("/", { replace: true });
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

  return (
    <main className="login-page">
      <section className="login-shell">
        <aside className="login-showcase">
          <div className="login-showcase__brand">
            <span className="login-showcase__logo">
              GF
            </span>

            <div>
              <strong>
                Gestor Fácil
              </strong>

              <small>
                Controle interno
              </small>
            </div>
          </div>

          <div className="login-showcase__content">
            <span className="login-showcase__badge">
              Gestão simplificada
            </span>

            <h1>
              Seu negócio sob controle.
            </h1>

            <p>
              Acompanhe estoque, vendas, clientes e resultados
              financeiros em um único lugar.
            </p>

            <ul>
              <li>
                Controle completo de estoque
              </li>

              <li>
                Vendas rápidas e organizadas
              </li>

              <li>
                Informações protegidas por empresa
              </li>
            </ul>
          </div>

          <p className="login-showcase__footer">
            Sistema de controle interno
          </p>
        </aside>

        <section className="login-card">
          <header className="login-card__header">
            <span className="login-card__eyebrow">
              Acesso ao sistema
            </span>

            <h2>
              Bem-vindo novamente
            </h2>

            <p>
              Informe seus dados para acessar o painel.
            </p>
          </header>

          <form
            className="login-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              E-mail

              <input
                type="email"
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target
                      .value,
                  )
                }
                autoComplete="email"
                placeholder="seu@email.com"
                disabled={
                  isSubmitting
                }
              />
            </label>

            <label>
              Senha

              <input
                type="password"
                value={
                  password
                }
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target
                      .value,
                  )
                }
                autoComplete="current-password"
                placeholder="Mínimo de 6 caracteres"
                disabled={
                  isSubmitting
                }
              />
            </label>

            {errorMessage && (
              <p className="login-message login-message--error">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? "Aguarde..."
                : "Entrar no sistema"}
            </button>
          </form>

          <footer className="login-card__footer">
            Seus dados são protegidos e separados por empresa.
          </footer>
        </section>
      </section>
    </main>
  );
}
