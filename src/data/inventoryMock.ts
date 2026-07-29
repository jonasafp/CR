import type { InventoryMovement } from "../types/Inventory";

export const initialInventoryMovements: InventoryMovement[] =
  [
    {
      id: 1,

      productId: 1,
      productName: "Ração Premium para Cães",
      productCode: "RAC-001",

      type: "entry",
      reason: "purchase",

      quantity: 120,
      unit: "kg",

      previousStock: 200,
      currentStock: 320,

      unitCost: 4.5,
      totalValue: 540,

      notes:
        "Entrada referente à compra do fornecedor principal.",

      createdAt: "2026-07-20T09:30:00",
      createdBy: "Administrador",
    },

    {
      id: 2,

      productId: 2,
      productName: "Ração Premium para Gatos",
      productCode: "RAC-002",

      type: "exit",
      reason: "sale",

      quantity: 18,
      unit: "kg",

      previousStock: 138,
      currentStock: 120,

      unitCost: 5.2,
      totalValue: 93.6,

      notes: "Saída consolidada de vendas.",

      createdAt: "2026-07-21T16:40:00",
      createdBy: "Administrador",
    },

    {
      id: 3,

      productId: 3,
      productName: "Ração para Filhotes",
      productCode: "RAC-003",

      type: "adjustment_negative",
      reason: "damage",

      quantity: 7,
      unit: "kg",

      previousStock: 45,
      currentStock: 38,

      unitCost: 4.8,
      totalValue: 33.6,

      notes:
        "Ajuste devido a embalagem danificada.",

      createdAt: "2026-07-22T10:15:00",
      createdBy: "Administrador",
    },

    {
      id: 4,

      productId: 4,
      productName: "Ração para Aves",
      productCode: "RAC-004",

      type: "entry",
      reason: "purchase",

      quantity: 15,
      unit: "kg",

      previousStock: 7,
      currentStock: 22,

      unitCost: 3.6,
      totalValue: 54,

      createdAt: "2026-07-22T14:20:00",
      createdBy: "Administrador",
    },

    {
      id: 5,

      productId: 5,
      productName: "Ração para Peixes",
      productCode: "RAC-005",

      type: "adjustment_negative",
      reason: "expiration",

      quantity: 6,
      unit: "kg",

      previousStock: 6,
      currentStock: 0,

      unitCost: 7.2,
      totalValue: 43.2,

      notes:
        "Produto retirado por vencimento.",

      createdAt: "2026-07-23T08:50:00",
      createdBy: "Administrador",
    },
  ];