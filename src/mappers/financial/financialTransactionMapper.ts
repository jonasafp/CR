import {
  financialTransactionDtoSchema,
} from "../../dtos/financial/FinancialTransactionDto";

import type {
  FinancialTransaction,
} from "../../domain/financial/FinancialTransaction";

export function mapFinancialTransactionDtoToDomain(
  input: unknown,
): FinancialTransaction {
  const parsedTransaction =
    financialTransactionDtoSchema.parse(
      input,
    );

  return {
    id:
      parsedTransaction.id,

    number:
      parsedTransaction.number,

    type:
      parsedTransaction.type,

    status:
      parsedTransaction.status,

    source:
      parsedTransaction.source,

    description:
      parsedTransaction.description,

    category:
      parsedTransaction.category,

    amount:
      parsedTransaction.amount,

    dueDate:
      parsedTransaction.dueDate,

    paymentDate:
      parsedTransaction.paymentDate,

    paymentMethod:
      parsedTransaction.paymentMethod,

    customerOrSupplier:
      parsedTransaction.customerOrSupplier,

    notes:
      parsedTransaction.notes,

    saleId:
      parsedTransaction.saleId,

    saleNumber:
      parsedTransaction.saleNumber,

    inventoryMovementId:
      parsedTransaction.inventoryMovementId,

    createdAt:
      parsedTransaction.createdAt,

    updatedAt:
      parsedTransaction.updatedAt,

    createdBy:
      parsedTransaction.createdBy,
  };
}