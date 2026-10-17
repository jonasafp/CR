import { ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.code}>404</span>
        <h1>Página não encontrada</h1>
        <p>O endereço informado não existe ou não está disponível para o seu acesso.</p>

        <div className={styles.actions}>
          <button type="button" onClick={() => navigate(-1)}>
            <ArrowLeft size={17} /> Voltar
          </button>
          <Link to="/">
            <Home size={17} /> Ir para o resumo
          </Link>
        </div>
      </section>
    </main>
  );
}
