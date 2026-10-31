import {
  Capacitor,
} from "@capacitor/core";

const MOBILE_CLASS = "gestor-facil-mobile";

export function isMobileApp() {
  return Capacitor.isNativePlatform();
}

export function initializeMobilePlatform() {
  if (!isMobileApp()) {
    return;
  }

  const platform = Capacitor.getPlatform();

  document.documentElement.classList.add(
    MOBILE_CLASS,
    `gestor-facil-${platform}`,
  );

  document.documentElement.dataset.appPlatform = platform;
}
