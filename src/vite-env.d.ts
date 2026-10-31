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
  minimize: () => Promise<boolean>;
  toggleMaximize: () => Promise<boolean>;
  close: () => Promise<boolean>;
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
