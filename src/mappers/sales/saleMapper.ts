import type {
  Sale,
} from "../../domain/sales/Sale";

import {
  saleDtoSchema,
} from "../../dtos/sales/SaleDto";

import type {
  SaleDto,
} from "../../dtos/sales/SaleDto";

export function mapSaleDtoToDomain(
  data: unknown,
): Sale {
  const parsed =
    saleDtoSchema.parse(data);

  return {
    ...parsed,
  };
}

export function mapSaleDomainToDto(
  sale: Sale,
): SaleDto {
  return saleDtoSchema.parse({
    ...sale,
  });
}