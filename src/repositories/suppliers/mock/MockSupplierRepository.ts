import {
  ApiError,
} from "../../../api/errors/ApiError";

import {
  STORAGE_KEYS,
} from "../../../constants/storageKeys";

import {
  initialSuppliers,
} from "../../../data/suppliersMock";

import {
  createEmptySupplierAddress,
  getSupplierDisplayName,
} from "../../../domain/suppliers/Supplier";

import type {
  ChangeSupplierStatusInput,
  CreateSupplierInput,
  Supplier,
  SupplierAddress,
  UpdateSupplierInput,
} from "../../../domain/suppliers/Supplier";

import type {
  SupplierFilters,
} from "../../../domain/suppliers/SupplierFilters";

import {
  readLocalStorage,
  writeLocalStorage,
} from "../../../services/storage/localStorageService";

import type {
  PaginatedResult,
} from "../../../types/Pagination";

import type {
  SupplierRepository,
} from "../SupplierRepository";

export const SUPPLIERS_UPDATED_EVENT =
  "gestor-facil:suppliers-updated";

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
  address?: Partial<SupplierAddress>,
): SupplierAddress {
  const emptyAddress =
    createEmptySupplierAddress();

  return {
    postalCode:
      address?.postalCode?.trim() ??
      emptyAddress.postalCode,

    street:
      address?.street?.trim() ??
      emptyAddress.street,

    number:
      address?.number?.trim() ??
      emptyAddress.number,

    complement:
      address?.complement?.trim() ??
      emptyAddress.complement,

    neighborhood:
      address?.neighborhood?.trim() ??
      emptyAddress.neighborhood,

    city:
      address?.city?.trim() ??
      emptyAddress.city,

    state:
      address?.state
        ?.trim()
        .toUpperCase() ??
      emptyAddress.state,
  };
}

function readSuppliers():
  Supplier[] {
  return readLocalStorage<
    Supplier[]
  >(
    STORAGE_KEYS.suppliers,
    initialSuppliers,
  );
}

function saveSuppliers(
  suppliers: Supplier[],
): void {
  writeLocalStorage(
    STORAGE_KEYS.suppliers,
    suppliers,
  );

  window.dispatchEvent(
    new CustomEvent<Supplier[]>(
      SUPPLIERS_UPDATED_EVENT,
      {
        detail:
          suppliers,
      },
    ),
  );
}

function createSupplierId(
  suppliers: Supplier[],
): number {
  if (
    suppliers.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...suppliers.map(
        (supplier) =>
          supplier.id,
      ),
    ) + 1
  );
}

function validateLegalName(
  legalName: string,
): string {
  const normalizedName =
    legalName.trim();

  if (
    normalizedName.length < 2
  ) {
    throw new ApiError(
      "Informe um nome válido para o fornecedor.",
      400,
      "INVALID_SUPPLIER_NAME",
      {
        legalName: [
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
      "INVALID_SUPPLIER_EMAIL",
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
  suppliers: Supplier[],
  document: string,
  ignoredSupplierId?: number,
): void {
  if (!document) {
    return;
  }

  const duplicate =
    suppliers.find(
      (supplier) =>
        supplier.id !==
          ignoredSupplierId &&
        normalizeDocument(
          supplier.document,
        ) === document,
    );

  if (duplicate) {
    throw new ApiError(
      `O documento informado já pertence ao fornecedor ${getSupplierDisplayName(duplicate)}.`,
      409,
      "SUPPLIER_DOCUMENT_ALREADY_EXISTS",
      {
        document: [
          "Já existe um fornecedor cadastrado com este documento.",
        ],
      },
    );
  }
}

function findSupplierOrThrow(
  suppliers: Supplier[],
  supplierId: number,
): Supplier {
  const supplier =
    suppliers.find(
      (item) =>
        item.id ===
        supplierId,
    );

  if (!supplier) {
    throw new ApiError(
      "Fornecedor não encontrado.",
      404,
      "SUPPLIER_NOT_FOUND",
    );
  }

  return supplier;
}

function applyFilters(
  suppliers: Supplier[],
  filters: SupplierFilters,
): Supplier[] {
  const search =
    normalizeText(
      filters.search,
    );

  return suppliers
    .filter(
      (supplier) => {
        const searchableContent =
          normalizeText(
            [
              supplier.legalName,
              supplier.tradeName,
              supplier.document,
              supplier.stateRegistration,
              supplier.contactName,
              supplier.phone,
              supplier.email,
              supplier.address.city,
              supplier.address.state,
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
          supplier.status ===
            filters.status;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    )
    .sort(
      (
        firstSupplier,
        secondSupplier,
      ) => {
        let comparison =
          0;

        if (
          filters.sortBy ===
          "tradeName"
        ) {
          comparison =
            getSupplierDisplayName(
              firstSupplier,
            ).localeCompare(
              getSupplierDisplayName(
                secondSupplier,
              ),
              "pt-BR",
            );
        } else {
          comparison =
            firstSupplier[
              filters.sortBy
            ].localeCompare(
              secondSupplier[
                filters.sortBy
              ],
              "pt-BR",
            );
        }

        return filters.sortDirection ===
          "asc"
          ? comparison
          : comparison * -1;
      },
    );
}

export class MockSupplierRepository
  implements SupplierRepository {
  async list(
    filters: SupplierFilters,
  ): Promise<
    PaginatedResult<Supplier>
  > {
    await delay();

    const suppliers =
      applyFilters(
        readSuppliers(),
        filters,
      );

    const pageSize =
      Math.max(
        1,
        filters.pageSize,
      );

    const totalItems =
      suppliers.length;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          totalItems /
          pageSize,
        ),
      );

    const page =
      Math.min(
        Math.max(
          1,
          filters.page,
        ),
        totalPages,
      );

    const startIndex =
      (
        page -
        1
      ) * pageSize;

    return {
      items:
        suppliers.slice(
          startIndex,
          startIndex +
            pageSize,
        ),

      page,
      pageSize,
      totalItems,
      totalPages,

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page <
        totalPages,
    };
  }

  async listActive():
    Promise<Supplier[]> {
    await delay();

    return readSuppliers()
      .filter(
        (supplier) =>
          supplier.status ===
          "active",
      )
      .sort(
        (
          firstSupplier,
          secondSupplier,
        ) =>
          getSupplierDisplayName(
            firstSupplier,
          ).localeCompare(
            getSupplierDisplayName(
              secondSupplier,
            ),
            "pt-BR",
          ),
      );
  }

  async getById(
    supplierId: number,
  ): Promise<Supplier> {
    await delay();

    return findSupplierOrThrow(
      readSuppliers(),
      supplierId,
    );
  }

  async create(
    input: CreateSupplierInput,
  ): Promise<Supplier> {
    await delay();

    const suppliers =
      readSuppliers();

    const legalName =
      validateLegalName(
        input.legalName,
      );

    const document =
      normalizeDocument(
        input.document ?? "",
      );

    ensureDocumentIsUnique(
      suppliers,
      document,
    );

    const now =
      new Date()
        .toISOString();

    const supplier:
      Supplier = {
      id:
        createSupplierId(
          suppliers,
        ),

      legalName,

      tradeName:
        input.tradeName
          ?.trim() ?? "",

      document,

      stateRegistration:
        input.stateRegistration
          ?.trim() ?? "",

      contactName:
        input.contactName
          ?.trim() ?? "",

      phone:
        normalizePhone(
          input.phone ?? "",
        ),

      email:
        validateEmail(
          input.email ?? "",
        ),

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

    saveSuppliers([
      supplier,
      ...suppliers,
    ]);

    return supplier;
  }

  async update(
    input: UpdateSupplierInput,
  ): Promise<Supplier> {
    await delay();

    const suppliers =
      readSuppliers();

    const currentSupplier =
      findSupplierOrThrow(
        suppliers,
        input.id,
      );

    const document =
      normalizeDocument(
        input.document ?? "",
      );

    ensureDocumentIsUnique(
      suppliers,
      document,
      input.id,
    );

    const updatedSupplier:
      Supplier = {
      ...currentSupplier,

      legalName:
        validateLegalName(
          input.legalName,
        ),

      tradeName:
        input.tradeName
          ?.trim() ?? "",

      document,

      stateRegistration:
        input.stateRegistration
          ?.trim() ?? "",

      contactName:
        input.contactName
          ?.trim() ?? "",

      phone:
        normalizePhone(
          input.phone ?? "",
        ),

      email:
        validateEmail(
          input.email ?? "",
        ),

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

    saveSuppliers(
      suppliers.map(
        (supplier) =>
          supplier.id ===
          updatedSupplier.id
            ? updatedSupplier
            : supplier,
      ),
    );

    return updatedSupplier;
  }

  async changeStatus(
    input: ChangeSupplierStatusInput,
  ): Promise<Supplier> {
    await delay();

    const suppliers =
      readSuppliers();

    const currentSupplier =
      findSupplierOrThrow(
        suppliers,
        input.supplierId,
      );

    const updatedSupplier:
      Supplier = {
      ...currentSupplier,

      status:
        input.status,

      updatedAt:
        new Date()
          .toISOString(),
    };

    saveSuppliers(
      suppliers.map(
        (supplier) =>
          supplier.id ===
          updatedSupplier.id
            ? updatedSupplier
            : supplier,
      ),
    );

    return updatedSupplier;
  }
}