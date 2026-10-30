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

const appVariant =
  executableName.includes("controle")
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

function getSecureWebPreferences() {
  return {
    contextIsolation: true,
    devTools: false,
    nodeIntegration: false,
    sandbox: true,
    preload: preloadPath,
  };
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
      width: 1440,
      height: 900,
      minWidth: 1100,
      minHeight: 700,
      autoHideMenuBar: true,
      backgroundColor: "#f4f7fb",
      show: false,
      title: applicationName,
      webPreferences:
        getSecureWebPreferences(),
    });

  window.once(
    "ready-to-show",
    () => {
      window.maximize();
      window.show();
    },
  );

  void window.loadURL(
    getInitialUrl(),
  );

  return window;
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
