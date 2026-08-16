import {
  BarChart3,
  CalendarDays,
  Clock3,
  TableProperties,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useReportFilterOptionsQuery,
} from "../../application/reports/useReportFilterOptionsQuery";

import {
  useReportQuery,
} from "../../application/reports/useReportQuery";

import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import SectionCard from "../../components/common/SectionCard/SectionCard";
import TableCard from "../../components/common/TableCard/TableCard";

import ReportAnalytics from "../../components/reports/ReportAnalytics/ReportAnalytics";
import ReportExportActions from "../../components/reports/ReportExportActions/ReportExportActions";
import ReportFilters from "../../components/reports/ReportFilters/ReportFilters";
import ReportOverviewCards from "../../components/reports/ReportOverviewCards/ReportOverviewCards";
import ReportTable from "../../components/reports/ReportTable/ReportTable";
import ReportTypeSelector from "../../components/reports/ReportTypeSelector/ReportTypeSelector";

import type {
  FinancialReportRow,
  InventoryReportRow,
  ProductReportRow,
  ReportType,
  SalesReportRow,
} from "../../domain/reports/Report";

import {
  createDefaultReportFilters,
} from "../../domain/reports/ReportFilters";

import type {
  ReportFilters as ReportFiltersState,
} from "../../domain/reports/ReportFilters";

import {
  getReportPeriodLabel,
} from "../../domain/reports/ReportPeriod";

import {
  formatNumber,
} from "../../utils/formatters";

import {
  useSettings,
} from "../../hooks/useSettings";

import styles from "./Relatorios.module.css";

type ReportRow =
  | SalesReportRow
  | FinancialReportRow
  | ProductReportRow
  | InventoryReportRow;

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Não foi possível gerar o relatório solicitado.";
}

function formatGeneratedAt(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(date);
}

export default function Relatorios() {
  const { settings } =
    useSettings();

  const reportSettings =
    settings.reports;

  const [filters, setFilters] =
    useState<ReportFiltersState>(() =>
      createDefaultReportFilters({
        periodPreset:
          reportSettings
            .defaultPeriod,

        groupBy:
          reportSettings
            .defaultGroupBy,

        pageSize:
          reportSettings
            .defaultPageSize,

        includeCancelledRecords:
          reportSettings
            .includeCancelledRecords,
      }),
    );
  const reportQuery =
    useReportQuery(filters);

  const filterOptionsQuery =
    useReportFilterOptionsQuery();

  const report =
    reportQuery.data;

  function handleReportTypeChange(
    reportType: ReportType,
  ) {
    setFilters(
      (
        currentFilters,
      ) => {
        const defaultFilters =
          createDefaultReportFilters({
            periodPreset:
              reportSettings
                .defaultPeriod,

            groupBy:
              reportSettings
                .defaultGroupBy,

            pageSize:
              reportSettings
                .defaultPageSize,

            includeCancelledRecords:
              reportSettings
                .includeCancelledRecords,
          });

        return {
          ...defaultFilters,

          reportType,

          periodPreset:
            currentFilters
              .periodPreset,

          dateFrom:
            currentFilters.dateFrom,

          dateTo:
            currentFilters.dateTo,

          groupBy:
            currentFilters.groupBy,
        };
      },
    );
  }

  function handleResetFilters() {
    setFilters((currentFilters) => ({
      ...createDefaultReportFilters({
        periodPreset:
          reportSettings
            .defaultPeriod,

        groupBy:
          reportSettings
            .defaultGroupBy,

        pageSize:
          reportSettings
            .defaultPageSize,

        includeCancelledRecords:
          reportSettings
            .includeCancelledRecords,
      }),

      reportType:
        currentFilters.reportType,
    }));
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div
          className={
            styles.pageIntroduction
          }
        >
          <span className={styles.eyebrow}>
            Inteligência do negócio
          </span>

          <h2>Relatórios</h2>

          <p>
            Analise vendas, finanças, produtos e movimentações
            de estoque em um único ambiente.
          </p>
        </div>

        <ReportExportActions
          filters={filters}
          disabled={
            reportQuery.isLoading ||
            reportQuery.isError ||
            !report ||
            report.totalItems === 0
          }
        />
      </div>

      <div
        className={
          styles.selectorArea
        }
      >
        <ReportTypeSelector
          value={filters.reportType}
          onChange={
            handleReportTypeChange
          }
        />
      </div>

      <div
        className={
          styles.filtersArea
        }
      >
        <ReportFilters
          filters={filters}
          options={
            filterOptionsQuery.data
          }
          isLoadingOptions={
            filterOptionsQuery
              .isLoading
          }
          onChange={setFilters}
          onReset={
            handleResetFilters
          }
        />
      </div>

      {reportQuery.isLoading ? (
        <div
          className={
            styles.stateArea
          }
        >
          <SectionCard>
            <LoadingState
              title="Gerando relatório"
              description="Consolidando os dados dos módulos do sistema."
            />
          </SectionCard>
        </div>
      ) : reportQuery.isError ? (
        <div
          className={
            styles.stateArea
          }
        >
          <SectionCard>
            <ErrorState
              title="Não foi possível gerar o relatório"
              description={getErrorMessage(
                reportQuery.error,
              )}
              onRetry={() =>
                void reportQuery
                  .refetch()
              }
            />
          </SectionCard>
        </div>
      ) : report ? (
        <div
          className={
            styles.resultArea
          }
        >
          <div
            className={
              styles.resultHeader
            }
          >
            <div
              className={
                styles.resultTitle
              }
            >
              <div
                className={
                  styles.resultIcon
                }
              >
                <BarChart3 size={21} />
              </div>

              <div>
                <strong>
                  {report.title}
                </strong>

                <span>
                  {report.description}
                </span>
              </div>
            </div>

            <div
              className={
                styles.resultMetadata
              }
            >
              <span>
                <CalendarDays
                  size={14}
                />

                {getReportPeriodLabel(
                  report.period,
                )}
              </span>

              <span>
                <Clock3 size={14} />

                Atualizado em{" "}
                {formatGeneratedAt(
                  report.generatedAt,
                )}
              </span>
            </div>
          </div>

          <div
            className={
              styles.overviewArea
            }
          >
            <ReportOverviewCards
              reportType={
                report.reportType
              }
              overview={
                report.overview
              }
            />
          </div>

          <div
            className={
              styles.analyticsArea
            }
          >
            <ReportAnalytics
              reportType={
                report.reportType
              }
              timeSeries={
                report.timeSeries
              }
              categories={
                report.categories
              }
              paymentMethods={
                report.paymentMethods
              }
            />
          </div>

          <div
            className={
              styles.tableArea
            }
          >
            <TableCard
              title="Dados analíticos"
              description="Registros que compõem o relatório selecionado."
              icon={
                TableProperties
              }
              badge={`${formatNumber(
                report.totalItems,
                0,
              )} registros`}
              noPadding
            >
              <ReportTable
                reportType={
                  report.reportType
                }
                rows={
                  report.rows as
                  ReportRow[]
                }
                page={report.page}
                pageSize={
                  report.pageSize
                }
                totalItems={
                  report.totalItems
                }
                totalPages={
                  report.totalPages
                }
                onPageChange={(
                  page,
                ) =>
                  setFilters(
                    (
                      currentFilters,
                    ) => ({
                      ...currentFilters,
                      page,
                    }),
                  )
                }
              />
            </TableCard>
          </div>
        </div>
      ) : null}
    </section>
  );
}