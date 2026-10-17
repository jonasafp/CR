type AppEnvironment = "development" | "preview" | "production";

function requiredUrl(name: string, value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`A variável ${name} não foi configurada.`);
  }

  try {
    const url = new URL(normalized);

    if (url.protocol !== "https:" && !url.hostname.includes("localhost")) {
      throw new Error();
    }
  } catch {
    throw new Error(`A variável ${name} não contém uma URL válida e segura.`);
  }

  return normalized;
}

function requiredValue(name: string, value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`A variável ${name} não foi configurada.`);
  }

  return normalized;
}

function getAppEnvironment(value: string | undefined): AppEnvironment {
  return value === "production" || value === "preview"
    ? value
    : "development";
}

export const environment = Object.freeze({
  supabaseUrl: requiredUrl("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: requiredValue(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
  appEnvironment: getAppEnvironment(import.meta.env.VITE_APP_ENV),
  appVersion: import.meta.env.VITE_APP_VERSION?.trim() || "local",
});
