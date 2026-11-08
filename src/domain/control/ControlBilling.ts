export type ControlBillingStatus =
  | "trial"
  | "active"
  | "due_soon"
  | "overdue"
  | "suspended"
  | "canceled"
  | "manual_release"
  | "not_configured";

export interface ControlBillingInvoice {
  id: string;
  externalPaymentId: string | null;
  status: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  invoiceUrl: string | null;
}

export interface ControlBillingCompany {
  companyId: string;
  tradeName: string;
  legalName: string;
  document: string | null;
  companyStatus: "active" | "inactive";
  subscriptionId: string | null;
  status: ControlBillingStatus;
  enforcementEnabled: boolean;
  monthlyPrice: number;
  nextDueDate: string | null;
  manualReleaseUntil: string | null;
  asaasCustomerId: string | null;
  asaasSubscriptionId: string | null;
  lastPaymentAt: string | null;
  latestInvoice: ControlBillingInvoice | null;
}

export interface ControlBillingDashboard {
  environment: "sandbox" | "production";
  summary: {
    companies: number;
    configured: number;
    active: number;
    dueSoon: number;
    overdue: number;
    suspended: number;
    manualRelease: number;
    monthlyRecurringRevenue: number;
  };
  companies: ControlBillingCompany[];
}

export interface SaveControlSubscriptionInput {
  companyId: string;
  monthlyValue: number;
  nextDueDate: string;
  enforcementEnabled: boolean;
}
