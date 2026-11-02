import {
  App,
} from "@capacitor/app";
import {
  Browser,
} from "@capacitor/browser";
import {
  useEffect,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  isMobileApp,
} from "../../../services/mobile/mobilePlatformService";

const ROOT_PATHS = new Set([
  "/",
  "/login",
]);

export default function NativeAppController() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMobileApp()) {
      return;
    }

    let isActive = true;
    let removeBackListener:
      (() => Promise<void>) | undefined;

    void App.addListener(
      "backButton",
      () => {
        if (ROOT_PATHS.has(window.location.pathname)) {
          void App.minimizeApp();
          return;
        }

        navigate(-1);
      },
    ).then((handle) => {
      if (!isActive) {
        void handle.remove();
        return;
      }

      removeBackListener = () => handle.remove();
    }).catch(() => {
      // Mantém a navegação web caso o recurso nativo não esteja disponível.
    });

    function handleExternalLink(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>(
        "a[href]",
      );

      if (
        !anchor ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(
        anchor.href,
        window.location.href,
      );

      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.origin === window.location.origin
      ) {
        return;
      }

      event.preventDefault();
      void Browser.open({ url: url.href })
        .catch(() => {
          window.open(
            url.href,
            "_blank",
            "noopener,noreferrer",
          );
        });
    }

    document.addEventListener(
      "click",
      handleExternalLink,
      true,
    );

    return () => {
      isActive = false;
      document.removeEventListener(
        "click",
        handleExternalLink,
        true,
      );
      void removeBackListener?.();
    };
  }, [navigate]);

  return null;
}
