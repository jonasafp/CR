import { KeyRound, LogIn, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import useCompany from "../../../contexts/CompanyContext/useCompany";
import { quickSwitchUser } from "../../../services/auth/authService";
import { getErrorMessage } from "../../../utils/errors";

import styles from "./QuickUserSwitchModal.module.css";

interface QuickUserSwitchModalProps {
  isOpen: boolean;
  onSuccess: (employeeName: string) => void;
}

export default function QuickUserSwitchModal({
  isOpen,
  onSuccess,
}: QuickUserSwitchModalProps) {
  const { companyId, membership, refreshCompany } = useCompany();
  const codeRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setPassword("");
      setError("");
      window.setTimeout(() => codeRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const numericCode = Number(code);

    if (!companyId || !Number.isSafeInteger(numericCode) || numericCode < 1) {
      setError("Informe um código interno válido.");
      return;
    }

    if (!password) {
      setError("Informe a senha do funcionário.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const employeeName = await quickSwitchUser(companyId, numericCode, password);
      await refreshCompany();
      onSuccess(employeeName);
    } catch (switchError) {
      setError(getErrorMessage(switchError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={(event) => void handleSubmit(event)}>
        <div className={styles.icon}><UserRound size={25} /></div>
        <span className={styles.eyebrow}>Próximo atendimento</span>
        <h3>Troca rápida de usuário</h3>
        <p>
          Venda concluída por <strong>{membership?.full_name ?? "usuário atual"}</strong>.
          Identifique o responsável pela próxima venda.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <label>
          <span>Código interno</span>
          <div className={styles.inputWrap}>
            <KeyRound size={17} />
            <input
              ref={codeRef}
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              disabled={isSubmitting}
              autoComplete="username"
            />
          </div>
        </label>

        <label>
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          <LogIn size={17} />
          {isSubmitting ? "Verificando..." : "Entrar e continuar vendendo"}
        </button>
      </form>
    </div>
  );
}
