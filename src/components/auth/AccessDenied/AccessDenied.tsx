import {
  ShieldAlert,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import styles from "./AccessDenied.module.css";

export default function AccessDenied() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.icon}>
          <ShieldAlert size={30} />
        </div>

        <h1>Acesso não permitido</h1>

        <p>
          Seu perfil não possui permissão para acessar este módulo.
          Fale com o administrador da empresa caso precise desse acesso.
        </p>

        <Link to="/">
          Voltar ao resumo
        </Link>
      </section>
    </main>
  );
}
