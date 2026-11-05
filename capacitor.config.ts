import type { CapacitorConfig } from "@capacitor/cli";

const isControlApp = process.env.VITE_APP_VARIANT === "control";

const config: CapacitorConfig = {
  appId: isControlApp
    ? "com.jiah.gestorfacil.controle"
    : "com.jiah.gestorfacil",
  appName: isControlApp
    ? "Gestor Controle"
    : "Gestor Fácil",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
      style: "LIGHT",
      hidden: false,
    },
  },
};

export default config;
