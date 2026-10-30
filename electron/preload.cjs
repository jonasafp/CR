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
