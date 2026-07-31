import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  Landmark,
  QrCode,
  WalletCards,
} from "lucide-react";

import type {
  PaymentMethod,
} from "../../../domain/sales/Sale";

import styles from "./PaymentMethodBadge.module.css";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

const methodConfig = {
  cash: {
    label: "Dinheiro",
    icon: Banknote,
  },

  pix: {
    label: "Pix",
    icon: QrCode,
  },

  credit_card: {
    label: "Crédito",
    icon: CreditCard,
  },

  debit_card: {
    label: "Débito",
    icon: WalletCards,
  },

  bank_transfer: {
    label: "Transferência",
    icon: Landmark,
  },

  other: {
    label: "Outro",
    icon: CircleDollarSign,
  },
} satisfies Record<
  PaymentMethod,
  {
    label: string;
    icon: typeof Banknote;
  }
>;

export default function PaymentMethodBadge({
  method,
}: PaymentMethodBadgeProps) {
  const config =
    methodConfig[method];

  const Icon = config.icon;

  return (
    <span className={styles.badge}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}