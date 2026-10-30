export interface PrinterOption {
  value: string;
  label: string;
}

type DesktopPrintingBridge = {
  getPrinters?: () => Promise<Array<{ name: string; displayName?: string }>>;
  print?: (options?: { printerName?: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
};

declare global {
  interface Window {
    gestorFacilPrinting?: DesktopPrintingBridge;
  }
}

const systemDefault: PrinterOption = {
  value: "system-default",
  label: "Impressora escolhida no diálogo do sistema",
};

export const printerService = {
  async list(): Promise<PrinterOption[]> {
    const printers = await window.gestorFacilPrinting?.getPrinters?.();

    if (!printers?.length) {
      return [systemDefault];
    }

    return [
      systemDefault,
      ...printers.map((printer) => ({
        value: printer.name,
        label: printer.displayName || printer.name,
      })),
    ];
  },
};
