import {
  Building2,
  ImagePlus,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  BusinessSettings,
} from "../../../domain/settings/SystemSettings";

import type {
  BusinessType,
} from "../../../types/Business";

import styles from "./BusinessSettingsForm.module.css";

interface BusinessSettingsFormProps {
  value: BusinessSettings;

  disabled?: boolean;

  onChange: (
    value: BusinessSettings,
  ) => void;
}

const businessTypeOptions:
  SelectOption<BusinessType>[] = [
    {
      value: "pet_store",
      label:
        "Casa de rações / Pet shop",
      icon: <Building2 size={14} />,
    },
    {
      value: "convenience_store",
      label:
        "Loja de conveniência",
      icon: <Building2 size={14} />,
    },
    {
      value: "small_market",
      label: "Mercado",
      icon: <Building2 size={14} />,
    },
    {
      value: "general_store",
      label: "Comércio geral",
      icon: <Building2 size={14} />,
    },
    {
      value: "bakery",
      label: "Padaria",
      icon: <Building2 size={14} />,
    },
    {
      value: "clothing_store",
      label: "Loja de roupas",
      icon: <Building2 size={14} />,
    },
    {
      value: "other",
      label: "Outro segmento",
      icon: <Building2 size={14} />,
    },
  ];

function onlyDigits(
  value: string,
): string {
  return value.replace(/\D/g, "");
}

function formatDocument(
  value: string,
): string {
  const digits =
    onlyDigits(value).slice(
      0,
      14,
    );

  if (digits.length <= 11) {
    return digits
      .replace(
        /(\d{3})(\d)/,
        "$1.$2",
      )
      .replace(
        /(\d{3})(\d)/,
        "$1.$2",
      )
      .replace(
        /(\d{3})(\d{1,2})$/,
        "$1-$2",
      );
  }

  return digits
    .replace(
      /(\d{2})(\d)/,
      "$1.$2",
    )
    .replace(
      /(\d{3})(\d)/,
      "$1.$2",
    )
    .replace(
      /(\d{3})(\d)/,
      "$1/$2",
    )
    .replace(
      /(\d{4})(\d{1,2})$/,
      "$1-$2",
    );
}

function formatPhone(
  value: string,
): string {
  const digits =
    onlyDigits(value).slice(
      0,
      11,
    );

  if (digits.length <= 10) {
    return digits
      .replace(
        /(\d{2})(\d)/,
        "($1) $2",
      )
      .replace(
        /(\d{4})(\d)/,
        "$1-$2",
      );
  }

  return digits
    .replace(
      /(\d{2})(\d)/,
      "($1) $2",
    )
    .replace(
      /(\d{5})(\d)/,
      "$1-$2",
    );
}

function formatPostalCode(
  value: string,
): string {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(
      /(\d{5})(\d)/,
      "$1-$2",
    );
}

export default function BusinessSettingsForm({
  value,
  disabled = false,
  onChange,
}: BusinessSettingsFormProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    fileError,
    setFileError,
  ] = useState("");

  function updateField<
    Key extends keyof BusinessSettings,
  >(
    field: Key,
    fieldValue:
      BusinessSettings[Key],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function handleLogoChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setFileError(
        "Selecione um arquivo de imagem válido.",
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setFileError(
        "A imagem deve possuir no máximo 2 MB.",
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !==
        "string"
      ) {
        setFileError(
          "Não foi possível carregar a imagem.",
        );

        return;
      }

      setFileError("");

      updateField(
        "logo",
        reader.result,
      );
    };

    reader.onerror = () => {
      setFileError(
        "Não foi possível carregar a imagem.",
      );
    };

    reader.readAsDataURL(file);
  }

  const initials =
    value.shortName.trim() ||
    value.tradeName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) => word[0],
      )
      .join("")
      .toUpperCase() ||
    "GF";

  return (
    <section
      className={styles.card}
    >
      <header
        className={styles.header}
      >
        <div
          className={
            styles.headerIcon
          }
        >
          <Building2 size={21} />
        </div>

        <div>
          <h3>
            Dados do estabelecimento
          </h3>

          <p>
            Informações utilizadas no sistema,
            relatórios e comprovantes.
          </p>
        </div>
      </header>

      <div
        className={styles.content}
      >
        <section
          className={
            styles.logoSection
          }
        >
          <div
            className={
              styles.logoPreview
            }
          >
            {value.logo ? (
              <img
                src={value.logo}
                alt="Logotipo do estabelecimento"
              />
            ) : (
              <strong>
                {initials}
              </strong>
            )}
          </div>

          <div
            className={
              styles.logoInformation
            }
          >
            <strong>
              Logotipo
            </strong>

            <span>
              PNG, JPG ou WebP com até 2 MB.
            </span>

            <div
              className={
                styles.logoActions
              }
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  fileInputRef
                    .current
                    ?.click()
                }
              >
                <ImagePlus
                  size={15}
                />

                Selecionar imagem
              </button>

              {value.logo && (
                <button
                  type="button"
                  className={
                    styles.removeButton
                  }
                  disabled={disabled}
                  onClick={() =>
                    updateField(
                      "logo",
                      "",
                    )
                  }
                >
                  <Trash2
                    size={15}
                  />

                  Remover
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={
                handleLogoChange
              }
            />

            {fileError && (
              <small
                className={
                  styles.error
                }
              >
                {fileError}
              </small>
            )}
          </div>
        </section>

        <div
          className={
            styles.divider
          }
        />

        <div
          className={styles.grid}
        >
          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              Razão social *
            </span>

            <input
              value={
                value.legalName
              }
              maxLength={150}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "legalName",
                  event.target.value,
                )
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              Nome fantasia *
            </span>

            <input
              value={
                value.tradeName
              }
              maxLength={100}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "tradeName",
                  event.target.value,
                )
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Sigla *
            </span>

            <input
              value={
                value.shortName
              }
              maxLength={5}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "shortName",
                  event.target.value
                    .replace(
                      /[^a-zA-Z0-9]/g,
                      "",
                    )
                    .toUpperCase(),
                )
              }
            />
          </label>

          <div
            className={
              styles.twoColumns
            }
          >
            <Select
              label="Segmento"
              value={
                value.businessType
              }
              options={
                businessTypeOptions
              }
              disabled={disabled}
              onChange={(
                businessType,
              ) =>
                updateField(
                  "businessType",
                  businessType,
                )
              }
            />
          </div>

          <label
            className={
              styles.field
            }
          >
            <span>
              CNPJ ou CPF
            </span>

            <input
              value={
                value.document
              }
              inputMode="numeric"
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "document",
                  formatDocument(
                    event.target.value,
                  ),
                )
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Inscrição estadual
            </span>

            <input
              value={
                value.stateRegistration
              }
              maxLength={30}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "stateRegistration",
                  event.target.value,
                )
              }
            />
          </label>
        </div>

        <div
          className={
            styles.sectionTitle
          }
        >
          <Phone size={16} />

          <div>
            <strong>
              Contato
            </strong>

            <span>
              Canais de atendimento do estabelecimento.
            </span>
          </div>
        </div>

        <div
          className={styles.grid}
        >
          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              Telefone
            </span>

            <div
              className={
                styles.inputWithIcon
              }
            >
              <Phone size={16} />

              <input
                value={
                  value.phone
                }
                inputMode="tel"
                disabled={disabled}
                onChange={(event) =>
                  updateField(
                    "phone",
                    formatPhone(
                      event.target.value,
                    ),
                  )
                }
              />
            </div>
          </label>

          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              E-mail
            </span>

            <div
              className={
                styles.inputWithIcon
              }
            >
              <Mail size={16} />

              <input
                type="email"
                value={
                  value.email
                }
                maxLength={150}
                disabled={disabled}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
              />
            </div>
          </label>
        </div>

        <div
          className={
            styles.sectionTitle
          }
        >
          <MapPin size={16} />

          <div>
            <strong>
              Endereço
            </strong>

            <span>
              Localização exibida em documentos e comprovantes.
            </span>
          </div>
        </div>

        <div
          className={styles.grid}
        >
          <label
            className={
              styles.field
            }
          >
            <span>
              CEP
            </span>

            <input
              value={
                value.postalCode
              }
              inputMode="numeric"
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "postalCode",
                  formatPostalCode(
                    event.target.value,
                  ),
                )
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              Logradouro
            </span>

            <input
              value={
                value.street
              }
              maxLength={120}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "street",
                  event.target.value,
                )
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Número
            </span>

            <input
              value={
                value.number
              }
              maxLength={15}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "number",
                  event.target.value,
                )
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              Complemento
            </span>

            <input
              value={
                value.complement
              }
              maxLength={80}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "complement",
                  event.target.value,
                )
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              Bairro
            </span>

            <input
              value={
                value.neighborhood
              }
              maxLength={80}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "neighborhood",
                  event.target.value,
                )
              }
            />
          </label>

          <label
            className={`${styles.field} ${styles.twoColumns}`}
          >
            <span>
              Cidade
            </span>

            <input
              value={
                value.city
              }
              maxLength={80}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value,
                )
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Estado
            </span>

            <input
              value={
                value.state
              }
              maxLength={2}
              disabled={disabled}
              onChange={(event) =>
                updateField(
                  "state",
                  event.target.value
                    .replace(
                      /[^a-zA-Z]/g,
                      "",
                    )
                    .toUpperCase(),
                )
              }
            />
          </label>
        </div>
      </div>
    </section>
  );
}