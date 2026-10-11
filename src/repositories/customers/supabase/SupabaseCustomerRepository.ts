import { supabase } from "../../../lib/supabase";
import { getCurrentCompanyMembership } from "../../../services/auth/authService";
import type {
  ChangeCustomerStatusInput,
  CreateCustomerInput,
  Customer,
  CustomerAddress,
  UpdateCustomerInput,
} from "../../../domain/customers/Customer";
import { createEmptyCustomerAddress } from "../../../domain/customers/Customer";
import type { CustomerFilters } from "../../../domain/customers/CustomerFilters";
import type { PaginatedResult } from "../../../types/Pagination";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../../../types/database.types";
import type { CustomerRepository } from "../CustomerRepository";

type CustomerRow = Tables<"customers">;

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function normalizeDocument(value = ""): string {
  return value.replace(/\D/g, "");
}

function normalizePhone(value = ""): string {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value = ""): string {
  const email = value.trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Informe um endereço de e-mail válido.");
  }
  return email;
}

function normalizeName(value: string): string {
  const name = value.trim();
  if (name.length < 2) throw new Error("Informe um nome válido para o cliente.");
  return name;
}

function normalizeAddress(address?: Partial<CustomerAddress>): CustomerAddress {
  const empty = createEmptyCustomerAddress();
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

function nullableText(value: string): string | null {
  return value || null;
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    document: row.document ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: {
      postalCode: row.postal_code ?? "",
      street: row.street ?? "",
      number: row.address_number ?? "",
      complement: row.complement ?? "",
      neighborhood: row.neighborhood ?? "",
      city: row.city ?? "",
      state: row.state ?? "",
    },
    notes: row.notes ?? "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCompanyId(): Promise<string> {
  const membership = await getCurrentCompanyMembership();
  if (!membership) throw new Error("Nenhuma empresa ativa foi encontrada.");
  return membership.company_id;
}

async function ensureDocumentIsUnique(
  companyId: string,
  document: string,
  ignoredCustomerId?: string,
): Promise<void> {
  if (!document) return;

  let query = supabase
    .from("customers")
    .select("id, name")
    .eq("company_id", companyId)
    .eq("document", document);

  if (ignoredCustomerId) query = query.neq("id", ignoredCustomerId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (data) {
    throw new Error(`O documento informado já pertence ao cliente ${data.name}.`);
  }
}

function toDatabaseInput(
  input: CreateCustomerInput,
): Omit<TablesInsert<"customers">, "company_id"> {
  const address = normalizeAddress(input.address);
  const document = normalizeDocument(input.document);
  return {
    name: normalizeName(input.name),
    document: nullableText(document),
    phone: nullableText(normalizePhone(input.phone)),
    email: nullableText(normalizeEmail(input.email)),
    postal_code: nullableText(address.postalCode),
    street: nullableText(address.street),
    address_number: nullableText(address.number),
    complement: nullableText(address.complement),
    neighborhood: nullableText(address.neighborhood),
    city: nullableText(address.city),
    state: nullableText(address.state),
    notes: nullableText(input.notes?.trim() ?? ""),
  };
}

export class SupabaseCustomerRepository implements CustomerRepository {
  private async loadAll(): Promise<Customer[]> {
    const companyId = await getCompanyId();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("company_id", companyId);
    if (error) throw error;
    return data.map(mapCustomer);
  }

  async list(filters: CustomerFilters): Promise<PaginatedResult<Customer>> {
    const search = normalizeText(filters.search);
    const customers = (await this.loadAll())
      .filter((customer) => {
        const content = normalizeText([
          customer.name,
          customer.document,
          customer.phone,
          customer.email,
          customer.address.city,
          customer.address.state,
        ].join(" "));
        return (!search || content.includes(search)) &&
          (filters.status === "all" || customer.status === filters.status);
      })
      .sort((first, second) => {
        const comparison = filters.sortBy === "name"
          ? first.name.localeCompare(second.name, "pt-BR")
          : first[filters.sortBy].localeCompare(second[filters.sortBy]);
        return filters.sortDirection === "asc" ? comparison : comparison * -1;
      });

    const pageSize = Math.max(1, filters.pageSize);
    const totalItems = customers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(1, filters.page), totalPages);

    return {
      items: customers.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  async listActive(): Promise<Customer[]> {
    return (await this.loadAll())
      .filter((customer) => customer.status === "active")
      .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
  }

  async getById(customerId: string): Promise<Customer> {
    const companyId = await getCompanyId();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", customerId)
      .single();
    if (error) throw error;
    return mapCustomer(data);
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const companyId = await getCompanyId();
    const values = toDatabaseInput(input);
    await ensureDocumentIsUnique(companyId, values.document ?? "");

    const row: TablesInsert<"customers"> = {
      ...values,
      company_id: companyId,
      status: "active",
    };
    const { data, error } = await supabase
      .from("customers")
      .insert(row)
      .select("*")
      .single();
    if (error) throw error;
    return mapCustomer(data);
  }

  async update(input: UpdateCustomerInput): Promise<Customer> {
    const companyId = await getCompanyId();
    const values = toDatabaseInput(input);
    await ensureDocumentIsUnique(companyId, values.document ?? "", input.id);

    const row: TablesUpdate<"customers"> = { ...values, status: input.status };
    const { data, error } = await supabase
      .from("customers")
      .update(row)
      .eq("company_id", companyId)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapCustomer(data);
  }

  async changeStatus(input: ChangeCustomerStatusInput): Promise<Customer> {
    const companyId = await getCompanyId();
    const { data, error } = await supabase
      .from("customers")
      .update({ status: input.status })
      .eq("company_id", companyId)
      .eq("id", input.customerId)
      .select("*")
      .single();
    if (error) throw error;
    return mapCustomer(data);
  }
}
