import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./ConnectionStatus.module.css";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <WifiOff size={17} />
      <span>Sem conexão com a internet. As alterações serão liberadas quando a conexão voltar.</span>
    </div>
  );
}
