import type { DashboardPeriod } from "../../../types/Dashboard";

import styles from "./PeriodSelector.module.css";

interface PeriodOption {
  value: DashboardPeriod;
  label: string;
}

interface PeriodSelectorProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

const periodOptions: PeriodOption[] = [
  {
    value: "today",
    label: "Hoje",
  },
  {
    value: "week",
    label: "Semana",
  },
  {
    value: "month",
    label: "Mês",
  },
  {
    value: "year",
    label: "Ano",
  },
];

export default function PeriodSelector({
  value,
  onChange,
}: PeriodSelectorProps) {
  return (
    <div
      className={styles.selector}
      aria-label="Selecionar período do Dashboard"
    >
      {periodOptions.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={`${styles.option} ${
              isActive ? styles.optionActive : ""
            }`}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}