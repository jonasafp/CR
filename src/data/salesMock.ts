import type {
  Sale,
} from "../domain/sales/Sale";

export const initialSales: Sale[] = [
  {
    id: 1,
    number: "VEN-000001",

    status: "completed",
    paymentMethod: "pix",

    customerName: "Cliente balcão",

    items: [
      {
        id: 1,

        productId: 1,
        productCode: "RAC-001",
        productName:
          "Ração Premium para Cães",

        quantity: 15,
        unit: "kg",

        unitCost: 4.5,
        unitPrice: 7.5,

        grossTotal: 112.5,
        discount: 0,
        total: 112.5,

        profit: 45,
      },
    ],

    subtotal: 112.5,
    discount: 0,
    total: 112.5,

    cost: 67.5,
    profit: 45,

    notes: "",

    createdAt:
      "2026-07-28T10:15:00",

    updatedAt:
      "2026-07-28T10:15:00",

    completedAt:
      "2026-07-28T10:15:00",

    createdBy: "Administrador",
  },

  {
    id: 2,
    number: "VEN-000002",

    status: "completed",
    paymentMethod: "cash",

    customerName: "Cliente balcão",

    items: [
      {
        id: 2,

        productId: 2,
        productCode: "RAC-002",
        productName:
          "Ração Premium para Gatos",

        quantity: 8,
        unit: "kg",

        unitCost: 5.2,
        unitPrice: 8.9,

        grossTotal: 71.2,
        discount: 1.2,
        total: 70,

        profit: 28.4,
      },

      {
        id: 3,

        productId: 6,
        productCode: "ACE-001",
        productName:
          "Areia Higiênica para Gatos",

        quantity: 2,
        unit: "pct",

        unitCost: 8.5,
        unitPrice: 14.9,

        grossTotal: 29.8,
        discount: 0,
        total: 29.8,

        profit: 12.8,
      },
    ],

    subtotal: 101,
    discount: 1.2,
    total: 99.8,

    cost: 58.6,
    profit: 41.2,

    notes: "",

    createdAt:
      "2026-07-29T14:40:00",

    updatedAt:
      "2026-07-29T14:40:00",

    completedAt:
      "2026-07-29T14:40:00",

    createdBy: "Administrador",
  },
];