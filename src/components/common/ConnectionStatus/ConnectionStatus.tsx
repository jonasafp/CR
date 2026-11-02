import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Network,
} from "@capacitor/network";

import {
  isMobileApp,
} from "../../../services/mobile/mobilePlatformService";

import styles from "./ConnectionStatus.module.css";

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    if (isMobileApp()) {
      let isActive = true;
      let removeNativeListener:
        (() => Promise<void>) | undefined;

      void Network.getStatus()
        .then((status) => {
          if (isActive) {
            setIsOnline(status.connected);
          }
        })
        .catch(() => {
          if (isActive) {
            setIsOnline(navigator.onLine);
          }
        });

      void Network.addListener(
        "networkStatusChange",
        (status) => {
          if (isActive) {
            setIsOnline(status.connected);
          }
        },
      ).then((handle) => {
        removeNativeListener = () => handle.remove();
      }).catch(() => {
        // O estado inicial permanece disponível se o listener nativo falhar.
      });

      return () => {
        isActive = false;
        void removeNativeListener?.();
      };
    }

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
      <span>Sem conexão com a internet. Algumas informações podem não carregar até a conexão voltar.</span>
    </div>
  );
}
