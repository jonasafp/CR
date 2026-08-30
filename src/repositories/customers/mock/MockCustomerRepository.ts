import {
  ApiError,
} from "../../../api/errors/ApiError";

import {
  STORAGE_KEYS,
} from "../../../constants/storageKeys";

import {
  initialCustomers,
} from "../../../data/customersMock";

import {
  createEmptyCustomerAddress,
} from "../../../domain/customers/Customer";

import type {
  ChangeCustomerStatusInput,
  CreateCustomerInput,
  Customer,
  CustomerAddress,
  UpdateCustomerInput,
} from "../../../domain/customers/Customer";

import type {
  CustomerFilters,
} from "../../../domain/customers/CustomerFilters";

import {
  readLocalStorage,
  writeLocalStorage,
} from "../../../services/storage/localStorageService";

import type {
  PaginatedResult,
} from "../../../types/Pagination";

import type {
  CustomerRepository,
} from "../CustomerRepository";

export const CUSTOMERS_UPDATED_EVENT =
  "gestor-facil:customers-updated";

function delay(
  milliseconds = 250,
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

function normalizeDocument(
  value: string,
): string {
  return value.replace(
    /\D/g,
    "",
  );
}

function normalizePhone(
  value: string,
): string {
  return value.replace(
    /\D/g,
    "",
  );
}

function normalizeAddress(
  address?: Partial<CustomerAddress>,
): CustomerAddress {
  const emptyAddress =
    createEmptyCustomerAddress();

  return {
    postalCode:
      address?.postalCode
        ?.trim() ??
      emptyAddress.postalCode,

    street:
      address?.street
        ?.trim() ??
      emptyAddress.street,

    number:
      address?.number
        ?.trim() ??
      emptyAddress.number,

    complement:
      address?.complement
        ?.trim() ??
      emptyAddress.complement,

    neighborhood:
      address?.neighborhood
        ?.trim() ??
      emptyAddress.neighborhood,

    city:
      address?.city
        ?.trim() ??
      emptyAddress.city,

    state:
      address?.state
        ?.trim()
        .toUpperCase() ??
      emptyAddress.state,
  };
}

function readCustomers():
  Customer[] {
  return readLocalStorage<
    Customer[]
  >(
    STORAGE_KEYS.customers,
    initialCustomers,
  );
}

function saveCustomers(
  customers: Customer[],
): void {
  writeLocalStorage(
    STORAGE_KEYS.customers,
    customers,
  );

  window.dispatchEvent(
    new CustomEvent<Customer[]>(
      CUSTOMERS_UPDATED_EVENT,
      {
        detail:
          customers,
      },
    ),
  );
}

function createCustomerId(
  customers: Customer[],
): number {
  if (
    customers.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...customers.map(
        (customer) =>
          customer.id,
      ),
    ) + 1
  );
}

function validateName(
  name: string,
): string {
  const normalizedName =
    name.trim();

  if (
    normalizedName.length < 2
  ) {
    throw new ApiError(
      "Informe um nome válido para o cliente.",
      400,
      "INVALID_CUSTOMER_NAME",
      {
        name: [
          "O nome precisa ter pelo menos 2 caracteres.",
        ],
      },
    );
  }

  return normalizedName;
}

function validateEmail(
  email: string,
): string {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  if (
    normalizedEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalizedEmail,
    )
  ) {
    throw new ApiError(
      "Informe um endereço de e-mail válido.",
      400,
      "INVALID_CUSTOMER_EMAIL",
      {
        email: [
          "O endereço de e-mail informado não é válido.",
        ],
      },
    );
  }

  return normalizedEmail;
}

function ensureDocumentIsUnique(
  customers: Customer[],
  document: string,
  ignoredCustomerId?: number,
): void {
  if (!document) {
    return;
  }

  const duplicatedCustomer =
    customers.find(
      (customer) =>
        customer.id !==
          ignoredCustomerId &&
        normalizeDocument(
          customer.document,
        ) === document,
    );

  if (
    duplicatedCustomer
  ) {
    throw new ApiError(
      `O documento informado já pertence ao cliente ${duplicatedCustomer.name}.`,
      409,
      "CUSTOMER_DOCUMENT_ALREADY_EXISTS",
      {
        document: [
          "Já existe um cliente cadastrado com este documento.",
        ],
      },
    );
  }
}

function findCustomerOrThrow(
  customers: Customer[],
  customerId: number,
): Customer {
  const customer =
    customers.find(
      (item) =>
        item.id ===
        customerId,
    );

  if (!customer) {
    throw new ApiError(
      "Cliente não encontrado.",
      404,
      "CUSTOMER_NOT_FOUND",
    );
  }

  return customer;
}

function applyFilters(
  customers: Customer[],
  filters: CustomerFilters,
): Customer[] {
  const search =
    normalizeText(
      filters.search,
    );

  const filteredCustomers =
    customers.filter(
      (customer) => {
        const searchableContent =
          normalizeText(
            [
              customer.name,
              customer.document,
              customer.phone,
              customer.email,
              customer.address.city,
              customer.address.state,
            ].join(" "),
          );

        const matchesSearch =
          !search ||
          searchableContent.includes(
            search,
          );

        const matchesStatus =
          filters.status ===
            "all" ||
          customer.status ===
            filters.status;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );

  return filteredCustomers.sort(
    (
      firstCustomer,
      secondCustomer,
    ) => {
      let comparison =
        0;

      if (
        filters.sortBy ===
        "name"
      ) {
        comparison =
          firstCustomer.name.localeCompare(
            secondCustomer.name,
            "pt-BR",
          );
      } else {
        comparison =
          firstCustomer[
            filters.sortBy
          ].localeCompare(
            secondCustomer[
              filters.sortBy
            ],
          );
      }

      return filters.sortDirection ===
        "asc"
        ? comparison
        : comparison * -1;
    },
  );
}

export class MockCustomerRepository
  implements CustomerRepository {
  async list(
    filters: CustomerFilters,
  ): Promise<
    PaginatedResult<Customer>
  > {
    await delay();

    const customers =
      applyFilters(
        readCustomers(),
        filters,
      );

    const page =
      Math.max(
        1,
        filters.page,
      );

    const pageSize =
      Math.max(
        1,
        filters.pageSize,
      );

    const totalItems =
      customers.length;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          totalItems /
          pageSize,
        ),
      );

    const validPage =
      Math.min(
        page,
        totalPages,
      );

    const startIndex =
      (
        validPage -
        1
      ) * pageSize;

    return {
      items:
        customers.slice(
          startIndex,
          startIndex +
            pageSize,
        ),

      page:
        validPage,

      pageSize,

      totalItems,

      totalPages,

      hasPreviousPage:
        validPage > 1,

      hasNextPage:
        validPage <
        totalPages,
    };
  }

  async listActive():
    Promise<Customer[]> {
    await delay();

    return readCustomers()
      .filter(
        (customer) =>
          customer.status ===
          "active",
      )
      .sort(
        (
          firstCustomer,
          secondCustomer,
        ) =>
          firstCustomer.name.localeCompare(
            secondCustomer.name,
            "pt-BR",
          ),
      );
  }

  async getById(
    customerId: number,
  ): Promise<Customer> {
    await delay();

    return findCustomerOrThrow(
      readCustomers(),
      customerId,
    );
  }

  async create(
    input: CreateCustomerInput,
  ): Promise<Customer> {
    await delay();

    const customers =
      readCustomers();

    const name =
      validateName(
        input.name,
      );

    const document =
      normalizeDocument(
        input.document ?? "",
      );

    const email =
      validateEmail(
        input.email ?? "",
      );

    ensureDocumentIsUnique(
      customers,
      document,
    );

    const now =
      new Date()
        .toISOString();

    const customer: Customer = {
      id:
        createCustomerId(
          customers,
        ),

      name,

      document,

      phone:
        normalizePhone(
          input.phone ?? "",
        ),

      email,

      address:
        normalizeAddress(
          input.address,
        ),

      notes:
        input.notes
          ?.trim() ?? "",

      status:
        "active",

      createdAt:
        now,

      updatedAt:
        now,
    };

    saveCustomers(
      [
        customer,
        ...customers,
      ],
    );

    return customer;
  }

  async update(
    input: UpdateCustomerInput,
  ): Promise<Customer> {
    await delay();

    const customers =
      readCustomers();

    const currentCustomer =
      findCustomerOrThrow(
        customers,
        input.id,
      );

    const name =
      validateName(
        input.name,
      );

    const document =
      normalizeDocument(
        input.document ?? "",
      );

    const email =
      validateEmail(
        input.email ?? "",
      );

    ensureDocumentIsUnique(
      customers,
      document,
      input.id,
    );

    const updatedCustomer:
      Customer = {
      ...currentCustomer,

      name,

      document,

      phone:
        normalizePhone(
          input.phone ?? "",
        ),

      email,

      address:
        normalizeAddress(
          input.address,
        ),

      notes:
        input.notes
          ?.trim() ?? "",

      status:
        input.status,

      updatedAt:
        new Date()
          .toISOString(),
    };

    saveCustomers(
      customers.map(
        (customer) =>
          customer.id ===
          updatedCustomer.id
            ? updatedCustomer
            : customer,
      ),
    );

    return updatedCustomer;
  }

  async changeStatus(
    input: ChangeCustomerStatusInput,
  ): Promise<Customer> {
    await delay();

    const customers =
      readCustomers();

    const currentCustomer =
      findCustomerOrThrow(
        customers,
        input.customerId,
      );

    if (
      currentCustomer.id === 1 &&
      input.status === "inactive"
    ) {
      throw new ApiError(
        'O cadastro "Cliente balcão" não pode ser inativado.',
        400,
        "DEFAULT_CUSTOMER_CANNOT_BE_DISABLED",
      );
    }

    const updatedCustomer:
      Customer = {
      ...currentCustomer,

      status:
        input.status,

      updatedAt:
        new Date()
          .toISOString(),
    };

    saveCustomers(
      customers.map(
        (customer) =>
          customer.id ===
          updatedCustomer.id
            ? updatedCustomer
            : customer,
      ),
    );

    return updatedCustomer;
  }
}