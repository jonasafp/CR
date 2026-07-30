import { apiConfig } from "../../api/apiConfig";

import { ApiSalesRepository } from "./api/ApiSalesRepository";
import { MockSalesRepository } from "./mock/MockSalesRepository";

import type {
  SalesRepository,
} from "./SalesRepository";

function createSalesRepository(): SalesRepository {
  if (
    apiConfig.dataSource === "api"
  ) {
    return new ApiSalesRepository();
  }

  return new MockSalesRepository();
}

export const salesRepository =
  createSalesRepository();