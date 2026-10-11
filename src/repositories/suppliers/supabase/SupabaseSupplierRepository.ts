import { supabase } from "../../../lib/supabase";
import { getCurrentCompanyMembership } from "../../../services/auth/authService";
import type { ChangeSupplierStatusInput, CreateSupplierInput, Supplier, SupplierAddress, UpdateSupplierInput } from "../../../domain/suppliers/Supplier";
import { createEmptySupplierAddress } from "../../../domain/suppliers/Supplier";
import type { SupplierFilters } from "../../../domain/suppliers/SupplierFilters";
import type { PaginatedResult } from "../../../types/Pagination";
import type { Tables, TablesInsert, TablesUpdate } from "../../../types/database.types";
import type { SupplierRepository } from "../SupplierRepository";

type SupplierRow = Tables<"suppliers">;
const normalizeText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const onlyDigits = (value = "") => value.replace(/\D/g, "");
const nullable = (value: string) => value || null;

async function getCompanyId(): Promise<string> {
  const membership = await getCurrentCompanyMembership();
  if (!membership) throw new Error("Nenhuma empresa ativa foi encontrada.");
  return membership.company_id;
}

function normalizeAddress(address?: Partial<SupplierAddress>): SupplierAddress {
  const empty = createEmptySupplierAddress();
  return {
    postalCode: address?.postalCode?.trim() ?? empty.postalCode,
    street: address?.street?.trim() ?? empty.street,
    number: address?.number?.trim() ?? empty.number,
    complement: address?.complement?.trim() ?? empty.complement,
    neighborhood: address?.neighborhood?.trim() ?? empty.neighborhood,
    city: address?.city?.trim() ?? empty.city,
    state: address?.state?.trim().toUpperCase() ?? empty.state,
  };
}

function mapSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id, legalName: row.name, tradeName: row.trade_name ?? "",
    document: row.document ?? "", stateRegistration: row.state_registration ?? "",
    contactName: row.contact_name ?? "", phone: row.phone ?? "", email: row.email ?? "",
    address: { postalCode: row.postal_code ?? "", street: row.street ?? "", number: row.address_number ?? "", complement: row.complement ?? "", neighborhood: row.neighborhood ?? "", city: row.city ?? "", state: row.state ?? "" },
    notes: row.notes ?? "", status: row.status, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toRow(input: CreateSupplierInput): Omit<TablesInsert<"suppliers">, "company_id"> {
  const name = input.legalName.trim();
  if (name.length < 2) throw new Error("Informe uma razão social válida.");
  const email = input.email?.trim().toLowerCase() ?? "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  const address = normalizeAddress(input.address);
  return { name, trade_name: nullable(input.tradeName?.trim() ?? ""), document: nullable(onlyDigits(input.document)), state_registration: nullable(input.stateRegistration?.trim() ?? ""), contact_name: nullable(input.contactName?.trim() ?? ""), phone: nullable(onlyDigits(input.phone)), email: nullable(email), postal_code: nullable(onlyDigits(address.postalCode)), street: nullable(address.street), address_number: nullable(address.number), complement: nullable(address.complement), neighborhood: nullable(address.neighborhood), city: nullable(address.city), state: nullable(address.state), notes: nullable(input.notes?.trim() ?? "") };
}

export class SupabaseSupplierRepository implements SupplierRepository {
  private async loadAll(): Promise<Supplier[]> {
    const companyId = await getCompanyId();
    const { data, error } = await supabase.from("suppliers").select("*").eq("company_id", companyId);
    if (error) throw error;
    return data.map(mapSupplier);
  }
  async list(filters: SupplierFilters): Promise<PaginatedResult<Supplier>> {
    const search = normalizeText(filters.search);
    const rows = (await this.loadAll()).filter((supplier) => (!search || normalizeText([supplier.legalName,supplier.tradeName,supplier.document,supplier.contactName,supplier.phone,supplier.email].join(" ")).includes(search)) && (filters.status === "all" || supplier.status === filters.status)).sort((a,b) => {
      const av = a[filters.sortBy];
      const bv = b[filters.sortBy];
      const result = String(av).localeCompare(String(bv), "pt-BR"); return filters.sortDirection === "asc" ? result : -result;
    });
    const pageSize=Math.max(1,filters.pageSize), totalItems=rows.length, totalPages=Math.max(1,Math.ceil(totalItems/pageSize)), page=Math.min(Math.max(1,filters.page),totalPages);
    return { items: rows.slice((page-1)*pageSize,page*pageSize), page, pageSize, totalItems, totalPages, hasPreviousPage: page>1, hasNextPage: page<totalPages };
  }
  async listActive(): Promise<Supplier[]> { return (await this.loadAll()).filter(x=>x.status==="active").sort((a,b)=>(a.tradeName||a.legalName).localeCompare(b.tradeName||b.legalName,"pt-BR")); }
  async getById(supplierId: string | number): Promise<Supplier> { const companyId=await getCompanyId(); const {data,error}=await supabase.from("suppliers").select("*").eq("company_id",companyId).eq("id",String(supplierId)).single(); if(error) throw error; return mapSupplier(data); }
  async create(input: CreateSupplierInput): Promise<Supplier> { const companyId=await getCompanyId(); const row: TablesInsert<"suppliers">={...toRow(input),company_id:companyId,status:"active"}; const {data,error}=await supabase.from("suppliers").insert(row).select("*").single(); if(error) throw error; return mapSupplier(data); }
  async update(input: UpdateSupplierInput): Promise<Supplier> { const companyId=await getCompanyId(); const row: TablesUpdate<"suppliers">={...toRow(input),status:input.status}; const {data,error}=await supabase.from("suppliers").update(row).eq("company_id",companyId).eq("id",String(input.id)).select("*").single(); if(error) throw error; return mapSupplier(data); }
  async changeStatus(input: ChangeSupplierStatusInput): Promise<Supplier> { const companyId=await getCompanyId(); const {data,error}=await supabase.from("suppliers").update({status:input.status}).eq("company_id",companyId).eq("id",String(input.supplierId)).select("*").single(); if(error) throw error; return mapSupplier(data); }
}
