import {
  Download,
  FileText,
  LoaderCircle,
  Printer,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  ReportExportFormat,
} from "../../../domain/reports/Report";

import type {
  ReportFilters,
} from "../../../domain/reports/ReportFilters";

import {
  reportExportService,
} from "../../../services/reports/reportExportService";

import styles from "./ReportExportActions.module.css";

interface ReportExportActionsProps {
  filters: ReportFilters;
  disabled?: boolean;
}

export default function ReportExportActions({
  filters,
  disabled = false,
}: ReportExportActionsProps) {
  const [
    exportingFormat,
    setExportingFormat,
  ] = useState<
    ReportExportFormat | null
  >(null);

  const [
    error,
    setError,
  ] = useState("");

  async function handleExport(
    format:
      ReportExportFormat,
  ) {
    if (
      disabled ||
      exportingFormat
    ) {
      return;
    }

    setError("");

    setExportingFormat(
      format,
    );

    try {
      await reportExportService.export(
        filters,
        format,
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Não foi possível exportar o relatório.",
      );
    } finally {
      setExportingFormat(
        null,
      );
    }
  }

  function getIcon(
    format:
      ReportExportFormat,

    DefaultIcon:
      typeof Download,
  ) {
    if (
      exportingFormat === format
    ) {
      return (
        <LoaderCircle
          size={16}
          className={
            styles.spinning
          }
        />
      );
    }

    return (
      <DefaultIcon size={16} />
    );
  }

  return (
    <div
      className={
        styles.container
      }
    >
      <div
        className={
          styles.actions
        }
      >
        <button
          type="button"
          className={
            styles.secondaryButton
          }
          disabled={
            disabled ||
            exportingFormat !==
              null
          }
          onClick={() =>
            void handleExport(
              "csv",
            )
          }
        >
          {getIcon(
            "csv",
            Download,
          )}

          Exportar CSV
        </button>

        <button
          type="button"
          className={
            styles.secondaryButton
          }
          disabled={
            disabled ||
            exportingFormat !==
              null
          }
          onClick={() =>
            void handleExport(
              "print",
            )
          }
        >
          {getIcon(
            "print",
            Printer,
          )}

          Imprimir
        </button>

        <button
          type="button"
          className={
            styles.primaryButton
          }
          disabled={
            disabled ||
            exportingFormat !==
              null
          }
          onClick={() =>
            void handleExport(
              "pdf",
            )
          }
        >
          {getIcon(
            "pdf",
            FileText,
          )}

          Salvar em PDF
        </button>
      </div>

      {error && (
        <span
          className={
            styles.error
          }
        >
          {error}
        </span>
      )}
    </div>
  );
}