import type {
  BusinessSettings,
} from "../../domain/settings/SystemSettings";

interface DesktopApi {
  setApplicationIcon?: (
    dataUrl: string,
  ) => Promise<void> | void;

  setApplicationTitle?: (
    title: string,
  ) => Promise<void> | void;
}

function getDesktopApi():
  DesktopApi | undefined {
  return (
    window as Window & {
      desktopApi?: DesktopApi;
    }
  ).desktopApi;
}

function updateFavicon(
  logo: string,
) {
  let favicon =
    document.querySelector<HTMLLinkElement>(
      "link[rel='icon']",
    );

  if (!logo) {
    favicon?.remove();
    return;
  }

  if (!favicon) {
    favicon =
      document.createElement(
        "link",
      );

    favicon.rel = "icon";

    document.head.appendChild(
      favicon,
    );
  }

  favicon.href = logo;
}

export const applicationIdentityService = {
  apply(
    business: BusinessSettings,
  ) {
    const title =
      business.tradeName.trim() ||
      "Gestor Fácil";

    document.title =
      `${title} · Gestor Fácil`;

    updateFavicon(
      business.logo,
    );

    const desktopApi =
      getDesktopApi();

    try {
      void Promise.resolve(
        desktopApi
          ?.setApplicationTitle
          ?.(title),
      );

      if (business.logo) {
        void Promise.resolve(
          desktopApi
            ?.setApplicationIcon
            ?.(business.logo),
        );
      }
    } catch {
      /*
       * O navegador continuará funcionando
       * normalmente quando a ponte do Electron
       * ainda não estiver disponível.
       */
    }
  },
};