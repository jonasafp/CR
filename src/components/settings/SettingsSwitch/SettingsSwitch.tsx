import type {
  ReactNode,
} from "react";

import styles from "./SettingsSwitch.module.css";

interface SettingsSwitchProps {
  checked: boolean;

  title: string;
  description: string;

  icon?: ReactNode;
  disabled?: boolean;

  onChange: (
    checked: boolean,
  ) => void;
}

export default function SettingsSwitch({
  checked,
  title,
  description,
  icon,
  disabled = false,
  onChange,
}: SettingsSwitchProps) {
  return (
    <label
      className={`${styles.option} ${
        disabled
          ? styles.disabled
          : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.checked,
          )
        }
      />

      {icon && (
        <span
          className={styles.icon}
        >
          {icon}
        </span>
      )}

      <span
        className={
          styles.information
        }
      >
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>

      <span
        className={styles.switch}
        aria-hidden="true"
      >
        <span />
      </span>
    </label>
  );
}