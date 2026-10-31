const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  session,
} = require("electron");
const path = require("node:path");

const APP_ORIGIN =
  process.env.GESTOR_FACIL_APP_URL?.trim() ||
  "https://cr-three-ashy.vercel.app";

const executableName =
  path.basename(
    process.execPath,
  ).toLowerCase();

const variantArgument =
  process.argv.find(
    (argument) =>
      argument.startsWith(
        "--app-variant=",
      ),
  );

const requestedVariant =
  variantArgument
    ?.split("=")[1];

const appVariant =
  requestedVariant === "control" ||
  (
    requestedVariant !== "client" &&
    executableName.includes("controle")
  )
    ? "control"
    : "client";

const initialPath =
  appVariant === "control"
    ? "/controle/login"
    : "/login";

const applicationName =
  appVariant === "control"
    ? "Gestor Fácil Controle"
    : "Gestor Fácil Cliente";

const applicationId =
  appVariant === "control"
    ? "com.jiah.gestorfacil.controle"
    : "com.jiah.gestorfacil.cliente";

const preloadPath =
  path.join(__dirname, "preload.cjs");

const desktopUserAgent =
  `GestorFacilDesktop/${app.getVersion()} Electron/${process.versions.electron} Chrome/${process.versions.chrome}`;

function getInitialUrl() {
  return new URL(initialPath, APP_ORIGIN).toString();
}

function isAllowedAppUrl(value) {
  try {
    const parsedUrl = new URL(value);
    const expectedOrigin =
      new URL(APP_ORIGIN).origin;

    if (
      parsedUrl.origin !==
      expectedOrigin
    ) {
      return false;
    }

    if (
      appVariant === "control"
    ) {
      return (
        parsedUrl.pathname ===
          "/controle" ||
        parsedUrl.pathname
          .startsWith("/controle/")
      );
    }

    return !(
      parsedUrl.pathname ===
        "/controle" ||
      parsedUrl.pathname
        .startsWith("/controle/")
    );
  } catch {
    return false;
  }
}

function getTrustedWindow(
  event,
) {
  const window =
    BrowserWindow
      .fromWebContents(
        event.sender,
      );

  if (
    !window ||
    window.isDestroyed() ||
    !isAllowedAppUrl(
      event.sender.getURL(),
    )
  ) {
    return null;
  }

  return window;
}

function getSecureWebPreferences() {
  return {
    contextIsolation: true,
    devTools: !app.isPackaged,
    nodeIntegration: false,
    sandbox: true,
    preload: preloadPath,
  };
}

const LOGIN_WINDOW_SIZE = {
  width: 1040,
  height: 650,
};

function isLoginPath(
  pathname,
) {
  return (
    pathname === "/login" ||
    pathname ===
      "/controle/login"
  );
}

function sendWindowState(
  window,
) {
  if (
    !window ||
    window.isDestroyed()
  ) {
    return;
  }

  window.webContents.send(
    "desktop:window-state",
    {
      maximized:
        window.isMaximized(),
    },
  );
}

function showLoginWindow(
  window,
) {
  if (
    !window ||
    window.isDestroyed()
  ) {
    return;
  }

  window.setMinimumSize(
    760,
    560,
  );

  if (window.isMaximized()) {
    window.unmaximize();
  }

  window.setSize(
    LOGIN_WINDOW_SIZE.width,
    LOGIN_WINDOW_SIZE.height,
    true,
  );

  window.center();
  sendWindowState(window);
}

function showApplicationWindow(
  window,
) {
  if (
    !window ||
    window.isDestroyed()
  ) {
    return;
  }

  window.setMinimumSize(
    1100,
    700,
  );

  if (!window.isMaximized()) {
    window.maximize();
  }

  sendWindowState(window);
}

function configureWebContents(
  contents,
) {
  contents.on(
    "will-navigate",
    (
      event,
      navigationUrl,
    ) => {
      if (
        isAllowedAppUrl(
          navigationUrl,
        )
      ) {
        return;
      }

      event.preventDefault();

      if (
        !contents.isDestroyed()
      ) {
        void contents.loadURL(
          getInitialUrl(),
        );
      }
    },
  );

  contents.setWindowOpenHandler(
    ({ url }) => {
      if (
        url === "about:blank"
      ) {
        return {
          action: "allow",
          overrideBrowserWindowOptions: {
            autoHideMenuBar: true,
            show: true,
            webPreferences:
              getSecureWebPreferences(),
          },
        };
      }

      if (
        isAllowedAppUrl(url)
      ) {
        void contents.loadURL(url);
      }

      return {
        action: "deny",
      };
    },
  );
}

function createMainWindow() {
  const window =
    new BrowserWindow({
      ...LOGIN_WINDOW_SIZE,
      minWidth: 760,
      minHeight: 560,
      autoHideMenuBar: true,
      backgroundColor: "#ffffff",
      frame: false,
      show: false,
      title: applicationName,
      webPreferences:
        getSecureWebPreferences(),
    });

  window.once(
    "ready-to-show",
    () => {
      showLoginWindow(
        window,
      );

      window.show();
    },
  );

  window.on(
    "maximize",
    () => {
      sendWindowState(
        window,
      );
    },
  );

  window.on(
    "unmaximize",
    () => {
      sendWindowState(
        window,
      );
    },
  );

  window.webContents.setUserAgent(
    desktopUserAgent,
  );

  void window.loadURL(
    getInitialUrl(),
  );

  return window;
}

function configureWindowControls() {
  ipcMain.handle(
    "desktop:get-window-state",
    (event) => {
      const window =
        getTrustedWindow(
          event,
        );

      return {
        maximized:
          window?.isMaximized() ??
          false,
      };
    },
  );

  ipcMain.on(
    "desktop:route-changed",
    (
      event,
      pathname,
    ) => {
      if (
        typeof pathname !==
          "string"
      ) {
        return;
      }

      const window =
        getTrustedWindow(
          event,
        );

      if (!window) {
        return;
      }

      if (
        isLoginPath(pathname)
      ) {
        showLoginWindow(
          window,
        );
      } else {
        showApplicationWindow(
          window,
        );
      }
    },
  );

  ipcMain.handle(
    "desktop:window-control",
    (
      event,
      action,
    ) => {
      const window =
        getTrustedWindow(
          event,
        );

      if (!window) {
        return false;
      }

      if (
        action === "minimize"
      ) {
        window.minimize();
      } else if (
        action === "maximize"
      ) {
        if (
          window.isMaximized()
        ) {
          window.unmaximize();
        } else {
          window.maximize();
        }
      } else if (
        action === "close"
      ) {
        window.close();
      } else {
        return false;
      }

      return true;
    },
  );
}

function configurePrinting() {
  ipcMain.handle(
    "printing:list",
    async (event) => {
      return event.sender
        .getPrintersAsync();
    },
  );

  ipcMain.handle(
    "printing:print",
    async (
      event,
      options = {},
    ) => {
      const requestedPrinter =
        typeof options.printerName ===
          "string"
          ? options.printerName
              .trim()
          : "";

      const useSystemDialog =
        !requestedPrinter ||
        requestedPrinter ===
          "system-default";

      return new Promise(
        (resolve) => {
          event.sender.print(
            {
              silent:
                !useSystemDialog,
              printBackground: true,
              deviceName:
                useSystemDialog
                  ? undefined
                  : requestedPrinter,
            },
            (
              success,
              failureReason,
            ) => {
              resolve({
                success,
                error:
                  success
                    ? undefined
                    : failureReason,
              });
            },
          );
        },
      );
    },
  );
}

const hasSingleInstanceLock =
  app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.setName(
    applicationName,
  );

  app.setAppUserModelId(
    applicationId,
  );

  app.on(
    "second-instance",
    () => {
      const window =
        BrowserWindow
          .getAllWindows()[0];

      if (!window) {
        return;
      }

      if (
        window.isMinimized()
      ) {
        window.restore();
      }

      window.focus();
    },
  );

  app.on(
    "web-contents-created",
    (
      _event,
      contents,
    ) => {
      configureWebContents(
        contents,
      );
    },
  );

  app.whenReady()
    .then(() => {
      Menu.setApplicationMenu(
        null,
      );

      session.defaultSession
        .setPermissionRequestHandler(
          (
            _webContents,
            _permission,
            callback,
          ) => {
            callback(false);
          },
        );

      configurePrinting();
      configureWindowControls();
      createMainWindow();

      app.on(
        "activate",
        () => {
          if (
            BrowserWindow
              .getAllWindows()
              .length === 0
          ) {
            createMainWindow();
          }
        },
      );
    })
    .catch(() => {
      app.quit();
    });
}

app.on(
  "window-all-closed",
  () => {
    app.quit();
  },
);
