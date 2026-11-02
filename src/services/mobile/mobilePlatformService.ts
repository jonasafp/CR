import {
  Capacitor,
  SystemBars,
  SystemBarsStyle,
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

  void SystemBars.setStyle({
    style: SystemBarsStyle.Light,
  }).catch(() => {
    // A configuração visual não deve impedir a inicialização do aplicativo.
  });
}
