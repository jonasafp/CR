import { supabase } from "../../lib/supabase";

import type {
  InventoryMovement,
  InventoryMovementFormData,
  InventoryMovementReason,
  InventoryMovementType,
} from "../../types/Inventory";
import type { Product } from "../../types/Product";
import type { Tables } from "../../types/database.types";

type InventoryMovementRow = Tables<"inventory_movements">;
type DatabaseMovementType =
  | "entry"
  | "exit"
  | "adjustment"
  | "sale"
  | "sale_cancellation";

function getFormMovementType(row: InventoryMovementRow): InventoryMovementType {
  if (row.movement_type === "adjustment") {
    return Number(row.stock_after) >= Number(row.stock_before)
      ? "adjustment_positive"
      : "adjustment_negative";
  }

  if (row.movement_type === "sale") return "exit";
  if (row.movement_type === "sale_cancellation") return "entry";
  return row.movement_type;
}

function getMovementReason(row: InventoryMovementRow): InventoryMovementReason {
  if (row.movement_type === "sale") return "sale";
  if (row.movement_type === "sale_cancellation") return "return";

  const validReasons: InventoryMovementReason[] = [
    "purchase",
    "sale",
    "manual_adjustment",
    "loss",
    "damage",
    "expiration",
    "return",
    "initial_balance",
    "other",
  ];

  return validReasons.includes(row.reason as InventoryMovementReason)
    ? (row.reason as InventoryMovementReason)
    : "other";
}

function toInventoryMovement(
  row: InventoryMovementRow,
  product: Product,
): InventoryMovement {
  const unitCost = Number(row.unit_cost ?? 0);

  return {
    id: row.id,
    productId: row.product_id,
    productName: product.name,
    productCode: product.code,
    type: getFormMovementType(row),
    reason: getMovementReason(row),
    quantity: Number(row.quantity),
    unit: product.stockUnit,
    previousStock: Number(row.stock_before),
    currentStock: Number(row.stock_after),
    unitCost,
    totalValue: Number(row.quantity) * unitCost,
    notes: row.notes ?? "",
    saleId: row.sale_id ?? undefined,
    purchaseId: row.purchase_id ?? undefined,
    createdAt: row.created_at,
    createdBy: row.created_by ? "Usuário do sistema" : "Sistema",
  };
}

function toDatabaseMovementType(
  data: InventoryMovementFormData,
): DatabaseMovementType {
  if (data.type === "adjustment_positive" || data.type === "adjustment_negative") {
    return "adjustment";
  }

  if (data.type === "exit" && data.reason === "sale") return "sale";
  return data.type;
}

function getStockChange(data: InventoryMovementFormData): number {
  return data.type === "exit" || data.type === "adjustment_negative"
    ? -data.quantity
    : data.quantity;
}

export async function listInventoryMovements(
  companyId: string,
  products: Product[],
): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const productsById = new Map(products.map((product) => [product.id, product]));

  return data.flatMap((row) => {
    const product = productsById.get(row.product_id);
    return product ? [toInventoryMovement(row, product)] : [];
  });
}

export async function createInventoryMovement(
  companyId: string,
  product: Product,
  data: InventoryMovementFormData,
  updatePurchasePrice: boolean,
): Promise<InventoryMovement> {
  const { data: createdMovement, error } = await supabase.rpc(
    "record_inventory_movement",
    {
      p_company_id: companyId,
      p_product_id: product.id,
      p_movement_type: toDatabaseMovementType(data),
      p_quantity: data.quantity,
      p_stock_change: getStockChange(data),
      p_reason: data.reason,
      p_unit_cost: data.unitCost,
      p_notes: data.notes.trim() || undefined,
      p_update_purchase_price: updatePurchasePrice,
    },
  );

  if (error) throw error;
  if (!createdMovement) throw new Error("A movimentação não foi registrada.");

  return toInventoryMovement(createdMovement, product);
}
