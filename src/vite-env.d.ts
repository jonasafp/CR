/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL:
    string;

  readonly VITE_SUPABASE_PUBLISHABLE_KEY:
    string;

  readonly VITE_APP_ENV?:
    "development" | "preview" | "production";

  readonly VITE_APP_VERSION?:
    string;
}

interface ImportMeta {
  readonly env:
    ImportMetaEnv;
}

type DesktopWindowState = {
  maximized: boolean;
};

type GestorFacilDesktopBridge = {
  isDesktop: true;
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  getWindowState: () =>
    Promise<DesktopWindowState>;
  onWindowState: (
    callback: (
      state: DesktopWindowState,
    ) => void,
  ) => () => void;
};

interface Window {
  gestorFacilDesktop?:
    GestorFacilDesktopBridge;
}
