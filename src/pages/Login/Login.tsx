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

import {
  controlService,
} from "../../services/control/controlService";

import "./Login.css";

type LoginProps = {
  controlMode?: boolean;
};

export default function Login({
  controlMode = false,
}: LoginProps) {
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

      void (async () => {
        const controlSession = await controlService.getSession();

        if (controlSession) {
          navigate("/controle", { replace: true });
          return;
        }

        if (controlMode) {
          await signOut();
          setErrorMessage("Esta conta não possui acesso ao sistema de controle.");
          return;
        }

        const membership = await getCurrentCompanyMembership();

        if (membership) {
          navigate("/", { replace: true });
          return;
        }

        await signOut();
        setErrorMessage("Esta conta não está vinculada a uma empresa ativa.");
      })()
        .catch(() => {
          void signOut();
          setErrorMessage("Não foi possível validar esta conta.");
        });
    },
    [
      session,
      isAuthLoading,
      navigate,
      controlMode,
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
        controlMode
          ? "Informe o usuário e a senha."
          : "Informe o e-mail e a senha.",
      );

      return;
    }

    if (
      !controlMode &&
      password.length < 6
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
      if (controlMode) {
        await controlService.signIn(email, password);
        navigate("/controle", { replace: true });
        return;
      }

      await signIn(email, password);

      const controlSession = await controlService.getSession();

      if (controlSession) {
        navigate("/controle", { replace: true });
        return;
      }

      const membership =
        await getCurrentCompanyMembership();

      if (!membership) {
        await signOut();
        setErrorMessage("Esta conta não está vinculada a uma empresa ativa.");
        return;
      }

      if (membership.must_change_password) {
        navigate("/definir-senha", { replace: true });
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
              {controlMode ? "JC" : "GF"}
            </span>

            <div>
              <strong>
                {controlMode ? "Jiah Controle" : "Gestor Fácil"}
              </strong>

              <small>
                {controlMode ? "Administração da plataforma" : "Controle interno"}
              </small>
            </div>
          </div>

          <div className="login-showcase__content">
            <span className="login-showcase__badge">
              {controlMode ? "Central administrativa" : "Gestão simplificada"}
            </span>

            <h1>
              {controlMode ? "Gestão da plataforma." : "Seu negócio sob controle."}
            </h1>

            <p>
              {controlMode
                ? "Acompanhe empresas, usuários e o crescimento do Gestor Fácil."
                : "Acompanhe estoque, vendas, clientes e resultados financeiros em um único lugar."}
            </p>

            <ul>
              <li>
                {controlMode ? "Visão consolidada das empresas" : "Controle completo de estoque"}
              </li>

              <li>
                {controlMode ? "Cadastro seguro de novos clientes" : "Vendas rápidas e organizadas"}
              </li>

              <li>
                {controlMode ? "Operações administrativas auditáveis" : "Informações protegidas por empresa"}
              </li>
            </ul>
          </div>

          <p className="login-showcase__footer">
            {controlMode ? "Acesso exclusivo Jiah" : "Sistema de controle interno"}
          </p>
        </aside>

        <section className="login-card">
          <header className="login-card__header">
            <span className="login-card__eyebrow">
              {controlMode ? "Acesso administrativo" : "Acesso ao sistema"}
            </span>

            <h2>
              {controlMode ? "Sistema de controle" : "Bem-vindo novamente"}
            </h2>

            <p>
              {controlMode
                ? "Informe as credenciais exclusivas da Jiah."
                : "Informe seus dados para acessar o painel."}
            </p>
          </header>

          <form
            className="login-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              {controlMode ? "Usuário" : "E-mail"}

              <input
                type={controlMode ? "text" : "email"}
                value={email}
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target
                      .value,
                  )
                }
                autoComplete={controlMode ? "username" : "email"}
                placeholder={controlMode ? "Seu usuário" : "seu@email.com"}
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
                placeholder={controlMode ? "Sua senha" : "Mínimo de 6 caracteres"}
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
                : controlMode
                  ? "Entrar no controle"
                  : "Entrar no sistema"}
            </button>
          </form>

          <footer className="login-card__footer">
            {controlMode
              ? "Área restrita à administração da plataforma."
              : "Seus dados são protegidos e separados por empresa."}
          </footer>
        </section>
      </section>
    </main>
  );
}
