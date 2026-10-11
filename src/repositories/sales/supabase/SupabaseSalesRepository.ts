import { supabase } from "../../../lib/supabase";
import { getCurrentCompanyMembership } from "../../../services/auth/authService";
import type {
  CancelSaleInput,
  CreateSaleInput,
  Sale,
  SaleItem,
  SalesSummary,
} from "../../../domain/sales/Sale";
import type { SaleFilters } from "../../../domain/sales/SaleFilters";
import type { PaginatedResult } from "../../../types/Pagination";
import type { Tables } from "../../../types/database.types";
import type { SalesRepository } from "../SalesRepository";

type SaleRow = Tables<"sales">;
type SaleItemRow = Tables<"sale_items">;

function roundValue(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatSaleNumber(number: number): string {
  return `VEN-${String(number).padStart(6, "0")}`;
}

function isUuid(value: string | number | undefined): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getCompanyId(): Promise<string> {
  const membership = await getCurrentCompanyMembership();
  if (!membership) throw new Error("Nenhuma empresa ativa foi encontrada.");
  return membership.company_id;
}

function mapItem(row: SaleItemRow): SaleItem {
  const quantity = Number(row.quantity);
  const unitCost = Number(row.unit_cost);
  const unitPrice = Number(row.unit_price);
  const discount = Number(row.discount);
  const grossTotal = roundValue(quantity * unitPrice);
  const total = Number(row.total);

  return {
    id: row.id,
    productId: row.product_id,
    productCode: row.product_code ?? "",
    productName: row.product_name,
    quantity,
    unit: row.unit as SaleItem["unit"],
    unitCost,
    unitPrice,
    grossTotal,
    discount,
    total,
    profit: roundValue(total - quantity * unitCost),
  };
}

function mapSale(row: SaleRow, itemRows: SaleItemRow[]): Sale {
  const items = itemRows.map(mapItem);
  const cost = roundValue(
    items.reduce((total, item) => total + item.quantity * item.unitCost, 0),
  );
  const total = Number(row.total);

  return {
    id: row.id,
    number: formatSaleNumber(row.number),
    status: row.status,
    paymentMethod: row.payment_method as Sale["paymentMethod"],
    customerId: row.customer_id ?? undefined,
    customerName: row.customer_name,
    items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    total,
    cost,
    profit: roundValue(total - cost),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at ?? undefined,
    createdBy: row.created_by ? "Usuário do sistema" : "Sistema",
  };
}

function createSummary(sales: Sale[]): SalesSummary {
  const completedSales = sales.filter((sale) => sale.status === "completed");

  return {
    totalSales: sales.length,
    completedSales: completedSales.length,
    cancelledSales: sales.filter((sale) => sale.status === "cancelled").length,
    pendingSales: sales.filter((sale) => sale.status === "pending").length,
    grossRevenue: roundValue(
      completedSales.reduce((total, sale) => total + sale.subtotal, 0),
    ),
    discounts: roundValue(
      completedSales.reduce((total, sale) => total + sale.discount, 0),
    ),
    netRevenue: roundValue(
      completedSales.reduce((total, sale) => total + sale.total, 0),
    ),
    totalCost: roundValue(
      completedSales.reduce((total, sale) => total + sale.cost, 0),
    ),
    totalProfit: roundValue(
      completedSales.reduce((total, sale) => total + sale.profit, 0),
    ),
    averageTicket: completedSales.length
      ? roundValue(
          completedSales.reduce((total, sale) => total + sale.total, 0) /
            completedSales.length,
        )
      : 0,
  };
}

async function loadSales(): Promise<Sale[]> {
  const companyId = await getCompanyId();
  const [salesResult, itemsResult] = await Promise.all([
    supabase
      .from("sales")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sale_items")
      .select("*")
      .eq("company_id", companyId),
  ]);

  if (salesResult.error) throw salesResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const itemsBySale = new Map<string, SaleItemRow[]>();
  for (const item of itemsResult.data) {
    const current = itemsBySale.get(item.sale_id) ?? [];
    current.push(item);
    itemsBySale.set(item.sale_id, current);
  }

  return salesResult.data.map((sale) => mapSale(sale, itemsBySale.get(sale.id) ?? []));
}

export class SupabaseSalesRepository implements SalesRepository {
  async list(filters: SaleFilters): Promise<PaginatedResult<Sale>> {
    const search = filters.search.trim().toLocaleLowerCase("pt-BR");

    let sales = (await loadSales()).filter((sale) => {
      const matchesSearch = !search || [
        sale.number,
        sale.customerName ?? "",
        ...sale.items.map((item) => `${item.productCode} ${item.productName}`),
      ].join(" ").toLocaleLowerCase("pt-BR").includes(search);
      const matchesStatus = filters.status === "all" || sale.status === filters.status;
      const matchesPayment = filters.paymentMethod === "all" ||
        sale.paymentMethod === filters.paymentMethod;
      const date = sale.createdAt.slice(0, 10);
      return matchesSearch && matchesStatus && matchesPayment &&
        (!filters.dateFrom || date >= filters.dateFrom) &&
        (!filters.dateTo || date <= filters.dateTo);
    });

    sales.sort((first, second) => {
      const firstValue = filters.sortBy === "total"
        ? first.total
        : filters.sortBy === "number" ? first.number : first.createdAt;
      const secondValue = filters.sortBy === "total"
        ? second.total
        : filters.sortBy === "number" ? second.number : second.createdAt;
      const comparison = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;
      return filters.sortDirection === "asc" ? comparison : comparison * -1;
    });

    const totalItems = sales.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
    const page = Math.min(Math.max(filters.page, 1), totalPages);
    const items = sales.slice((page - 1) * filters.pageSize, page * filters.pageSize);

    return {
      items,
      page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  async getById(saleId: string): Promise<Sale> {
    const sale = (await loadSales()).find((item) => item.id === saleId);
    if (!sale) throw new Error("Venda não encontrada.");
    return sale;
  }

  async create(input: CreateSaleInput): Promise<Sale> {
    const companyId = await getCompanyId();
    const customerId = isUuid(input.customerId) ? input.customerId : undefined;

    const { data, error } = await supabase.rpc("complete_sale", {
      p_company_id: companyId,
      p_payment_method: input.paymentMethod,
      p_customer_id: customerId,
      p_customer_name: input.customerName ?? "Cliente balcão",
      p_discount: input.discount,
      p_notes: input.notes ?? "",
      p_items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
      })),
    });

    if (error) throw error;
    if (!data) throw new Error("A venda não foi registrada.");
    return this.getById(data.id);
  }

  async cancel(input: CancelSaleInput): Promise<Sale> {
    const companyId = await getCompanyId();
    const { data, error } = await supabase.rpc("cancel_sale", {
      p_company_id: companyId,
      p_sale_id: input.saleId,
      p_reason: input.reason,
    });

    if (error) throw error;
    if (!data) throw new Error("A venda não foi cancelada.");
    return this.getById(data.id);
  }

  async getSummary(filters?: Partial<SaleFilters>): Promise<SalesSummary> {
    const sales = (await loadSales()).filter((sale) =>
      (!filters?.status || filters.status === "all" || sale.status === filters.status) &&
      (!filters?.paymentMethod || filters.paymentMethod === "all" ||
        sale.paymentMethod === filters.paymentMethod),
    );
    return createSummary(sales);
  }
}
