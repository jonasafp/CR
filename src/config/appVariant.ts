export type AppVariant = "client" | "control";

const configuredVariant = import.meta.env.VITE_APP_VARIANT;

export const appVariant: AppVariant =
  configuredVariant === "control"
    ? "control"
    : "client";

export const isControlApp = appVariant === "control";
