import {
  Check,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import type {
  KeyboardEvent,
  ReactNode,
} from "react";

import styles from "./Select.module.css";

export interface SelectOption<Value extends string> {
  value: Value;
  label: string;

  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectProps<Value extends string> {
  value: Value;
  options: SelectOption<Value>[];

  onChange: (value: Value) => void;

  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;

  disabled?: boolean;
  required?: boolean;

  name?: string;
  id?: string;

  className?: string;
  buttonClassName?: string;

  ariaLabel?: string;
}

export default function Select<Value extends string>({
  value,
  options,
  onChange,

  label,
  placeholder = "Selecione uma opção",
  helperText,
  error,

  disabled = false,
  required = false,

  name,
  id,

  className = "",
  buttonClassName = "",

  ariaLabel,
}: SelectProps<Value>) {
  const generatedId = useId();

  const selectId =
    id ?? `custom-select-${generatedId}`;

  const listboxId = `${selectId}-listbox`;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const containerRef =
    useRef<HTMLDivElement>(null);

  const buttonRef =
    useRef<HTMLButtonElement>(null);

  const optionRefs =
    useRef<Array<HTMLButtonElement | null>>([]);

  const [isOpen, setIsOpen] = useState(false);

  const [highlightedIndex, setHighlightedIndex] =
    useState(-1);

  const [dropdownDirection, setDropdownDirection] =
    useState<"down" | "up">("down");

  const selectedIndex = options.findIndex(
    (option) => option.value === value,
  );

  const selectedOption =
    selectedIndex >= 0
      ? options[selectedIndex]
      : undefined;

  function getFirstEnabledIndex(): number {
    return options.findIndex(
      (option) => !option.disabled,
    );
  }

  function getLastEnabledIndex(): number {
    for (
      let index = options.length - 1;
      index >= 0;
      index -= 1
    ) {
      if (!options[index].disabled) {
        return index;
      }
    }

    return -1;
  }

  function getNextEnabledIndex(
    currentIndex: number,
    direction: 1 | -1,
  ): number {
    if (options.length === 0) {
      return -1;
    }

    let nextIndex = currentIndex;

    for (
      let count = 0;
      count < options.length;
      count += 1
    ) {
      nextIndex =
        (nextIndex + direction + options.length) %
        options.length;

      if (!options[nextIndex].disabled) {
        return nextIndex;
      }
    }

    return currentIndex;
  }

  function calculateDropdownDirection() {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const rect =
      container.getBoundingClientRect();

    const estimatedDropdownHeight = Math.min(
      options.length * 48 + 16,
      280,
    );

    const availableBelow =
      window.innerHeight - rect.bottom;

    const availableAbove = rect.top;

    if (
      availableBelow < estimatedDropdownHeight &&
      availableAbove > availableBelow
    ) {
      setDropdownDirection("up");
      return;
    }

    setDropdownDirection("down");
  }

  function openDropdown() {
    if (disabled || options.length === 0) {
      return;
    }

    calculateDropdownDirection();

    setIsOpen(true);

    setHighlightedIndex(
      selectedIndex >= 0 &&
        !options[selectedIndex]?.disabled
        ? selectedIndex
        : getFirstEnabledIndex(),
    );
  }

  function closeDropdown(
    restoreFocus = false,
  ) {
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (restoreFocus) {
      buttonRef.current?.focus();
    }
  }

  function toggleDropdown() {
    if (isOpen) {
      closeDropdown();
      return;
    }

    openDropdown();
  }

  function selectOption(
    option: SelectOption<Value>,
  ) {
    if (option.disabled) {
      return;
    }

    onChange(option.value);
    closeDropdown(true);
  }

  function handleTriggerKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (disabled) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      if (!isOpen) {
        openDropdown();
        return;
      }

      const highlightedOption =
        options[highlightedIndex];

      if (highlightedOption) {
        selectOption(highlightedOption);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        openDropdown();
        return;
      }

      setHighlightedIndex((currentIndex) =>
        getNextEnabledIndex(
          currentIndex >= 0
            ? currentIndex
            : getFirstEnabledIndex(),
          1,
        ),
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        openDropdown();
        return;
      }

      setHighlightedIndex((currentIndex) =>
        getNextEnabledIndex(
          currentIndex >= 0
            ? currentIndex
            : getLastEnabledIndex(),
          -1,
        ),
      );

      return;
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      setHighlightedIndex(
        getFirstEnabledIndex(),
      );
      return;
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      setHighlightedIndex(
        getLastEnabledIndex(),
      );
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeDropdown(true);
    }
  }

  useEffect(() => {
    function handleDocumentMouseDown(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        closeDropdown();
      }
    }

    function handleWindowResize() {
      if (isOpen) {
        calculateDropdownDirection();
      }
    }

    function handleWindowScroll() {
      if (isOpen) {
        calculateDropdownDirection();
      }
    }

    document.addEventListener(
      "mousedown",
      handleDocumentMouseDown,
    );

    window.addEventListener(
      "resize",
      handleWindowResize,
    );

    window.addEventListener(
      "scroll",
      handleWindowScroll,
      true,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentMouseDown,
      );

      window.removeEventListener(
        "resize",
        handleWindowResize,
      );

      window.removeEventListener(
        "scroll",
        handleWindowScroll,
        true,
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (
      !isOpen ||
      highlightedIndex < 0
    ) {
      return;
    }

    optionRefs.current[
      highlightedIndex
    ]?.scrollIntoView({
      block: "nearest",
    });
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    if (disabled && isOpen) {
      closeDropdown();
    }
  }, [disabled, isOpen]);

  const describedBy = [
    helperText ? helperId : "",
    error ? errorId : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
    >
      {label && (
        <label
          htmlFor={selectId}
          className={styles.label}
        >
          {label}

          {required && (
            <span
              className={styles.required}
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <input
        type="hidden"
        name={name}
        value={value}
      />

      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-label={
          ariaLabel ??
          label ??
          placeholder
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={
          isOpen ? listboxId : undefined
        }
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${selectId}-option-${highlightedIndex}`
            : undefined
        }
        aria-invalid={Boolean(error)}
        aria-describedby={
          describedBy || undefined
        }
        disabled={disabled}
        className={`${styles.trigger} ${
          isOpen ? styles.triggerOpen : ""
        } ${error ? styles.triggerError : ""} ${
          disabled ? styles.triggerDisabled : ""
        } ${buttonClassName}`}
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.selectedContent}>
          {selectedOption?.icon && (
            <span className={styles.optionIcon}>
              {selectedOption.icon}
            </span>
          )}

          <span
            className={`${styles.selectedText} ${
              selectedOption
                ? ""
                : styles.placeholder
            }`}
          >
            {selectedOption?.label ??
              placeholder}
          </span>
        </span>

        <ChevronDown
          size={17}
          strokeWidth={2.2}
          className={`${styles.chevron} ${
            isOpen
              ? styles.chevronOpen
              : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={
            label ? selectId : undefined
          }
          className={`${styles.dropdown} ${
            dropdownDirection === "up"
              ? styles.dropdownUp
              : styles.dropdownDown
          }`}
        >
          <div className={styles.optionsList}>
            {options.map((option, index) => {
              const isSelected =
                option.value === value;

              const isHighlighted =
                highlightedIndex === index;

              return (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] =
                      element;
                  }}
                  id={`${selectId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  className={`${styles.option} ${
                    isSelected
                      ? styles.optionSelected
                      : ""
                  } ${
                    isHighlighted
                      ? styles.optionHighlighted
                      : ""
                  } ${
                    option.disabled
                      ? styles.optionDisabled
                      : ""
                  }`}
                  onMouseEnter={() => {
                    if (!option.disabled) {
                      setHighlightedIndex(index);
                    }
                  }}
                  onClick={() =>
                    selectOption(option)
                  }
                >
                  <span
                    className={
                      styles.optionMainContent
                    }
                  >
                    {option.icon && (
                      <span
                        className={styles.optionIcon}
                      >
                        {option.icon}
                      </span>
                    )}

                    <span
                      className={
                        styles.optionInformation
                      }
                    >
                      <span
                        className={
                          styles.optionLabel
                        }
                      >
                        {option.label}
                      </span>

                      {option.description && (
                        <span
                          className={
                            styles.optionDescription
                          }
                        >
                          {option.description}
                        </span>
                      )}
                    </span>
                  </span>

                  {isSelected && (
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      className={styles.check}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error ? (
        <small
          id={errorId}
          className={styles.error}
        >
          {error}
        </small>
      ) : (
        helperText && (
          <small
            id={helperId}
            className={styles.helperText}
          >
            {helperText}
          </small>
        )
      )}
    </div>
  );
}