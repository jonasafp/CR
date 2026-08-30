export type CustomerStatus =
  | "active"
  | "inactive";

export interface CustomerAddress {
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Customer {
  id: number;

  name: string;
  document: string;

  phone: string;
  email: string;

  address:
    CustomerAddress;

  notes: string;

  status:
    CustomerStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  document?: string;

  phone?: string;
  email?: string;

  address?: Partial<
    CustomerAddress
  >;

  notes?: string;
}

export interface UpdateCustomerInput {
  id: number;

  name: string;
  document?: string;

  phone?: string;
  email?: string;

  address?: Partial<
    CustomerAddress
  >;

  notes?: string;

  status:
    CustomerStatus;
}

export interface ChangeCustomerStatusInput {
  customerId: number;

  status:
    CustomerStatus;
}

export function createEmptyCustomerAddress():
  CustomerAddress {
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