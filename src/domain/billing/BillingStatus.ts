export type BillingAccessStatus =
  | "trial"
  | "active"
  | "due_soon"
  | "overdue"
  | "suspended"
  | "canceled"
  | "manual_release";

export type BillingInvoice = {
  id: string;
  status: string;
  amount: number;
  dueDate: string;
  invoiceUrl: string | null;
  pixPayload: string | null;
  pixQrCode: string | null;
  pixQrExpiresAt: string | null;
};

export type BillingStatus = {
  companyId: string;
  status: BillingAccessStatus;
  accessAllowed: boolean;
  enforcementEnabled: boolean;
  nextDueDate: string | null;
  daysUntilDue: number | null;
  warningDays: number;
  manualReleaseUntil: string | null;
  invoice: BillingInvoice | null;
};
