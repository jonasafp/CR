const {
  contextBridge,
  ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld(
  "gestorFacilPrinting",
  {
    getPrinters: () =>
      ipcRenderer.invoke(
        "printing:list",
      ),

    print: (options) =>
      ipcRenderer.invoke(
        "printing:print",
        options,
      ),
  },
);

const TITLE_BAR_HEIGHT = 38;

function isLoginPath() {
  return (
    location.pathname ===
      "/login" ||
    location.pathname ===
      "/controle/login"
  );
}

function installDesktopStyles() {
  const style =
    document.createElement(
      "style",
    );

  style.dataset.gestorFacilDesktop =
    "true";

  style.textContent = `
    :root {
      --desktop-titlebar-height: ${TITLE_BAR_HEIGHT}px;
    }

    html.gestor-facil-desktop,
    html.gestor-facil-desktop body,
    html.gestor-facil-desktop #root {
      min-height: 100%;
    }

    html.gestor-facil-desktop body {
      padding-top: var(--desktop-titlebar-height);
    }

    .desktop-titlebar {
      -webkit-app-region: drag;
      align-items: center;
      background: #1f3c7d;
      color: #ffffff;
      display: flex;
      height: var(--desktop-titlebar-height);
      justify-content: space-between;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      user-select: none;
      z-index: 2147483647;
    }

    .desktop-titlebar__identity {
      align-items: center;
      display: flex;
      font-family: Inter, system-ui, sans-serif;
      font-size: 12px;
      font-weight: 700;
      gap: 9px;
      padding-left: 13px;
    }

    .desktop-titlebar__mark {
      align-items: center;
      background: rgb(255 255 255 / 14%);
      border: 1px solid rgb(255 255 255 / 20%);
      border-radius: 7px;
      display: inline-flex;
      font-size: 10px;
      height: 23px;
      justify-content: center;
      width: 23px;
    }

    .desktop-titlebar__controls {
      -webkit-app-region: no-drag;
      align-self: stretch;
      display: flex;
    }

    .desktop-titlebar__button {
      align-items: center;
      background: transparent;
      border: 0;
      color: #dbe7ff;
      cursor: default;
      display: flex;
      height: 100%;
      justify-content: center;
      padding: 0;
      transition: background 120ms ease, color 120ms ease;
      width: 47px;
    }

    .desktop-titlebar__button:hover {
      background: rgb(255 255 255 / 12%);
      color: #ffffff;
    }

    .desktop-titlebar__button--close:hover {
      background: #dc2626;
    }

    .desktop-titlebar__button svg {
      fill: none;
      height: 12px;
      pointer-events: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.5;
      width: 12px;
    }

    html.gestor-facil-desktop-login,
    html.gestor-facil-desktop-login body,
    html.gestor-facil-desktop-login #root {
      height: 100%;
      overflow: hidden;
    }

    html.gestor-facil-desktop-login .login-page {
      background: #ffffff;
      height: calc(100vh - var(--desktop-titlebar-height));
      min-height: 0;
      overflow: hidden;
      padding: 0;
    }

    html.gestor-facil-desktop-login .login-page::before,
    html.gestor-facil-desktop-login .login-page::after {
      display: none;
    }

    html.gestor-facil-desktop-login .login-shell {
      border: 0;
      border-radius: 0;
      box-shadow: none;
      height: 100%;
      max-width: none;
      min-height: 0;
      width: 100%;
    }

    html.gestor-facil-desktop-login .login-showcase,
    html.gestor-facil-desktop-login .login-card {
      min-height: 0;
    }
  `;

  document.head.append(style);
}

function createIcon(
  pathData,
) {
  return `
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="${pathData}"></path>
    </svg>
  `;
}

function createControl(
  action,
  label,
  pathData,
) {
  const button =
    document.createElement(
      "button",
    );

  button.type = "button";
  button.className =
    `desktop-titlebar__button desktop-titlebar__button--${action}`;
  button.setAttribute(
    "aria-label",
    label,
  );
  button.title = label;
  button.innerHTML =
    createIcon(pathData);

  button.addEventListener(
    "click",
    () => {
      ipcRenderer.send(
        "desktop:window-control",
        action,
      );
    },
  );

  return button;
}

function installTitleBar() {
  const titleBar =
    document.createElement(
      "header",
    );

  const identity =
    document.createElement(
      "div",
    );

  const controls =
    document.createElement(
      "div",
    );

  const controlVariant =
    location.pathname
      .startsWith("/controle");

  titleBar.className =
    "desktop-titlebar";
  identity.className =
    "desktop-titlebar__identity";
  controls.className =
    "desktop-titlebar__controls";

  identity.innerHTML = `
    <span class="desktop-titlebar__mark">${controlVariant ? "JC" : "GF"}</span>
    <span>${controlVariant ? "Jiah Controle" : "Gestor Fácil"}</span>
  `;

  controls.append(
    createControl(
      "minimize",
      "Minimizar",
      "M1 6.5h10",
    ),
    createControl(
      "maximize",
      "Maximizar",
      "M2 2h8v8H2z",
    ),
    createControl(
      "close",
      "Fechar",
      "M2 2l8 8M10 2L2 10",
    ),
  );

  titleBar.append(
    identity,
    controls,
  );

  document.body.prepend(
    titleBar,
  );

  ipcRenderer.on(
    "desktop:window-state",
    (
      _event,
      state,
    ) => {
      const maximizeButton =
        controls.querySelector(
          ".desktop-titlebar__button--maximize",
        );

      if (!maximizeButton) {
        return;
      }

      maximizeButton.title =
        state.maximized
          ? "Restaurar"
          : "Maximizar";

      maximizeButton.setAttribute(
        "aria-label",
        maximizeButton.title,
      );

      maximizeButton.innerHTML =
        state.maximized
          ? createIcon(
              "M4 2h6v6M2 4h6v6H2z",
            )
          : createIcon(
              "M2 2h8v8H2z",
            );
    },
  );
}

let lastPathname = "";

function synchronizeRoute() {
  if (
    lastPathname ===
    location.pathname
  ) {
    return;
  }

  lastPathname =
    location.pathname;

  document.documentElement
    .classList.toggle(
      "gestor-facil-desktop-login",
      isLoginPath(),
    );

  ipcRenderer.send(
    "desktop:route-changed",
    location.pathname,
  );
}

window.addEventListener(
  "DOMContentLoaded",
  () => {
    document.documentElement
      .classList.add(
        "gestor-facil-desktop",
      );

    installDesktopStyles();
    installTitleBar();
    synchronizeRoute();

    const routeObserver =
      new MutationObserver(
        synchronizeRoute,
      );

    routeObserver.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    window.setInterval(
      synchronizeRoute,
      400,
    );
  },
);
