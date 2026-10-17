import {
  KeyRound,
} from "lucide-react";
import {
  useState,
} from "react";
import type {
  FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../../lib/supabase";
import {
  getErrorMessage,
} from "../../utils/errors";

import styles from "./DefinirSenha.module.css";

export default function DefinirSenha() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (password.length < 8) {
      setError("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("A confirmação da senha não corresponde.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      navigate("/", { replace: true });
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.icon}><KeyRound size={28} /></div>
        <span className={styles.eyebrow}>Primeiro acesso</span>
        <h1>Defina sua senha</h1>
        <p>Crie uma senha pessoal para acessar o sistema nas próximas vezes.</p>

        <label>
          <span>Nova senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo de 8 caracteres"
            autoComplete="new-password"
            disabled={isSaving}
          />
        </label>

        <label>
          <span>Confirmar senha</span>
          <input
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            disabled={isSaving}
          />
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar senha e entrar"}
        </button>
      </form>
    </main>
  );
}
