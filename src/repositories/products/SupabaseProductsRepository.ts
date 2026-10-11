import { supabase } from "../../lib/supabase";

import type {
  Product,
  ProductFormData,
  ProductStatus,
  StockUnit,
} from "../../types/Product";

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../../types/database.types";

type ProductRow = Tables<"products">;
type CategoryRow = Tables<"product_categories">;

function nullableText(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function toProduct(
  row: ProductRow,
  categoryName: string,
  soldQuantity = 0,
): Product {
  return {
    id: row.id,
    code: row.sku ?? "",
    barcode: row.barcode ?? "",
    name: row.name,
    description: row.notes ?? "",
    category: categoryName,
    stockUnit: row.unit as StockUnit,
    stockQuantity: Number(row.stock_quantity),
    minimumStock: Number(row.minimum_stock),
    soldQuantity,
    purchasePrice: Number(row.purchase_price),
    salePrice: Number(row.sale_price),
    status: row.status as ProductStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCategoryId(
  companyId: string,
  categoryName: string,
): Promise<string> {
  const normalizedName = categoryName.trim();

  const { data: existingCategory, error: selectError } =
    await supabase
      .from("product_categories")
      .select("id")
      .eq("company_id", companyId)
      .eq("name", normalizedName)
      .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingCategory) {
    return existingCategory.id;
  }

  const category: TablesInsert<"product_categories"> = {
    company_id: companyId,
    name: normalizedName,
    status: "active",
  };

  const { data: createdCategory, error: insertError } =
    await supabase
      .from("product_categories")
      .insert(category)
      .select("id")
      .single();

  if (insertError) {
    throw insertError;
  }

  return createdCategory.id;
}

async function findCategoryName(
  categoryId: string | null,
  categoriesById: Map<string, string>,
): Promise<string> {
  if (!categoryId) {
    return "Sem categoria";
  }

  return categoriesById.get(categoryId) ?? "Sem categoria";
}

export async function listProducts(
  companyId: string,
): Promise<Product[]> {
  const [productsResult, categoriesResult, salesResult, saleItemsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true }),
    supabase
      .from("product_categories")
      .select("id, name")
      .eq("company_id", companyId),
    supabase.from("sales").select("id").eq("company_id",companyId).eq("status","completed"),
    supabase.from("sale_items").select("sale_id, product_id, quantity").eq("company_id",companyId),
  ]);

  if (productsResult.error) {
    throw productsResult.error;
  }

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }
  if (salesResult.error) throw salesResult.error;
  if (saleItemsResult.error) throw saleItemsResult.error;

  const categoriesById = new Map(
    (categoriesResult.data as Pick<CategoryRow, "id" | "name">[])
      .map((category) => [category.id, category.name]),
  );
  const completedSaleIds=new Set(salesResult.data.map(sale=>sale.id));
  const soldByProduct=new Map<string,number>();
  for(const item of saleItemsResult.data){if(completedSaleIds.has(item.sale_id)){soldByProduct.set(item.product_id,(soldByProduct.get(item.product_id)??0)+Number(item.quantity));}}

  return Promise.all(
    productsResult.data.map(async (row) =>
      toProduct(
        row,
        await findCategoryName(row.category_id, categoriesById),
        soldByProduct.get(row.id) ?? 0,
      ),
    ),
  );
}

export async function createProduct(
  companyId: string,
  data: ProductFormData,
  allowNegativeStock: boolean,
): Promise<Product> {
  const categoryId = await getCategoryId(
    companyId,
    data.category,
  );

  const input: TablesInsert<"products"> = {
    company_id: companyId,
    category_id: categoryId,
    name: data.name.trim(),
    sku: nullableText(data.code),
    barcode: nullableText(data.barcode),
    unit: data.stockUnit,
    purchase_price: data.purchasePrice,
    sale_price: data.salePrice,
    stock_quantity: allowNegativeStock
      ? data.stockQuantity
      : Math.max(0, data.stockQuantity),
    minimum_stock: data.minimumStock,
    allow_negative_stock: allowNegativeStock,
    notes: nullableText(data.description),
    status: data.status,
  };

  const { data: createdProduct, error } = await supabase
    .from("products")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toProduct(createdProduct, data.category.trim());
}

export async function updateProduct(
  companyId: string,
  productId: string,
  data: ProductFormData,
  allowNegativeStock: boolean,
): Promise<Product> {
  const categoryId = await getCategoryId(
    companyId,
    data.category,
  );

  const input: TablesUpdate<"products"> = {
    category_id: categoryId,
    name: data.name.trim(),
    sku: nullableText(data.code),
    barcode: nullableText(data.barcode),
    unit: data.stockUnit,
    purchase_price: data.purchasePrice,
    sale_price: data.salePrice,
    stock_quantity: allowNegativeStock
      ? data.stockQuantity
      : Math.max(0, data.stockQuantity),
    minimum_stock: data.minimumStock,
    allow_negative_stock: allowNegativeStock,
    notes: nullableText(data.description),
    status: data.status,
  };

  const { data: updatedProduct, error } = await supabase
    .from("products")
    .update(input)
    .eq("company_id", companyId)
    .eq("id", productId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toProduct(updatedProduct, data.category.trim());
}

export async function deleteProduct(
  companyId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("company_id", companyId)
    .eq("id", productId);

  if (error) {
    throw error;
  }
}

export async function updateProductFields(
  companyId: string,
  productId: string,
  input: TablesUpdate<"products">,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update(input)
    .eq("company_id", companyId)
    .eq("id", productId);

  if (error) {
    throw error;
  }
}
