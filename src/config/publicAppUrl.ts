const PRODUCTION_APP_URL = "https://cr-three-ashy.vercel.app";

function normalizeUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function resolvePublicAppUrl(
  configuredUrl: string | undefined,
  currentOrigin: string,
) {
  if (configuredUrl?.trim()) {
    return normalizeUrl(configuredUrl);
  }

  const currentUrl = new URL(currentOrigin);

  if (
    currentUrl.hostname === "localhost" ||
    currentUrl.hostname === "127.0.0.1" ||
    currentUrl.hostname.endsWith(".local")
  ) {
    return PRODUCTION_APP_URL;
  }

  return normalizeUrl(currentOrigin);
}

export function getPasswordSetupUrl() {
  const appUrl = resolvePublicAppUrl(
    import.meta.env.VITE_PUBLIC_APP_URL,
    window.location.origin,
  );

  return `${appUrl}/definir-senha`;
}
