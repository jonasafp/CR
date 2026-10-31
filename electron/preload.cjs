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

contextBridge.exposeInMainWorld(
  "gestorFacilDesktop",
  {
    isDesktop: true,

    minimize: () =>
      ipcRenderer.invoke(
        "desktop:window-control",
        "minimize",
      ),

    toggleMaximize: () =>
      ipcRenderer.invoke(
        "desktop:window-control",
        "maximize",
      ),

    close: () =>
      ipcRenderer.invoke(
        "desktop:window-control",
        "close",
      ),

    getWindowState: () =>
      ipcRenderer.invoke(
        "desktop:get-window-state",
      ),

    onWindowState: (
      callback,
    ) => {
      const listener = (
        _event,
        state,
      ) => {
        callback(state);
      };

      ipcRenderer.on(
        "desktop:window-state",
        listener,
      );

      return () => {
        ipcRenderer.removeListener(
          "desktop:window-state",
          listener,
        );
      };
    },
  },
);

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
