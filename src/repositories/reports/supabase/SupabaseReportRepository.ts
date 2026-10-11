import { STORAGE_KEYS } from "../../../constants/storageKeys";
import { defaultFinancialFilters } from "../../../domain/financial/FinancialFilters";
import type { AnyReportResult } from "../../../domain/reports/Report";
import type { ReportFilters } from "../../../domain/reports/ReportFilters";
import { defaultSaleFilters } from "../../../domain/sales/SaleFilters";
import { listInventoryMovements } from "../../inventory/SupabaseInventoryRepository";
import { listProducts } from "../../products/SupabaseProductsRepository";
import { getCurrentCompanyMembership } from "../../../services/auth/authService";
import { writeLocalStorage } from "../../../services/storage/localStorageService";
import { financialRepository } from "../../financial/financialRepositoryFactory";
import { salesRepository } from "../../sales/salesRepositoryFactory";
import type { ReportFilterOptions, ReportRepository } from "../ReportRepository";
import { MockReportRepository } from "../mock/MockReportRepository";

export class SupabaseReportRepository implements ReportRepository{
 private readonly engine=new MockReportRepository();
 private async synchronize(){const membership=await getCurrentCompanyMembership();if(!membership)throw new Error("Nenhuma empresa ativa foi encontrada.");const products=await listProducts(membership.company_id);const [movements,sales,financial]=await Promise.all([listInventoryMovements(membership.company_id,products),salesRepository.list({...defaultSaleFilters,pageSize:10000}),financialRepository.list({...defaultFinancialFilters,pageSize:10000})]);writeLocalStorage(STORAGE_KEYS.products,products);writeLocalStorage(STORAGE_KEYS.inventoryMovements,movements);writeLocalStorage(STORAGE_KEYS.sales,sales.items);writeLocalStorage(STORAGE_KEYS.financialTransactions,financial.items);}
 async generate(filters:ReportFilters):Promise<AnyReportResult>{await this.synchronize();return this.engine.generate(filters);}
 async getFilterOptions():Promise<ReportFilterOptions>{await this.synchronize();return this.engine.getFilterOptions();}
}
