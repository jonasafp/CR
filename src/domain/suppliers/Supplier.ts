export type SupplierStatus =
  | "active"
  | "inactive";

export interface SupplierAddress {
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Supplier {
  id: number;

  legalName: string;
  tradeName: string;

  document: string;
  stateRegistration: string;

  contactName: string;
  phone: string;
  email: string;

  address:
    SupplierAddress;

  notes: string;

  status:
    SupplierStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  legalName: string;
  tradeName?: string;

  document?: string;
  stateRegistration?: string;

  contactName?: string;
  phone?: string;
  email?: string;

  address?: Partial<
    SupplierAddress
  >;

  notes?: string;
}

export interface UpdateSupplierInput {
  id: number;

  legalName: string;
  tradeName?: string;

  document?: string;
  stateRegistration?: string;

  contactName?: string;
  phone?: string;
  email?: string;

  address?: Partial<
    SupplierAddress
  >;

  notes?: string;

  status:
    SupplierStatus;
}

export interface ChangeSupplierStatusInput {
  supplierId: number;

  status:
    SupplierStatus;
}

export function createEmptySupplierAddress():
  SupplierAddress {
  return {
    postalCode:
      "",

    street:
      "",

    number:
      "",

    complement:
      "",

    neighborhood:
      "",

    city:
      "",

    state:
      "",
  };
}

export function getSupplierDisplayName(
  supplier: Pick<
    Supplier,
    "legalName" |
    "tradeName"
  >,
): string {
  return (
    supplier.tradeName.trim() ||
    supplier.legalName.trim()
  );
}