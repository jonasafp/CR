import {
  Building2,
  FileText,
  MessageSquareText,
  ReceiptText,
  UserRound,
  Printer,
  RefreshCw,
} from "lucide-react";

import { useEffect, useState } from "react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  BusinessSettings,
  ReceiptPaperSize,
  ReceiptSettings,
} from "../../../domain/settings/SystemSettings";

import {
  formatCurrency,
} from "../../../utils/formatters";

import SettingsSwitch from "../SettingsSwitch/SettingsSwitch";
import { printerService } from "../../../services/printing/printerService";

import styles from "./ReceiptSettingsForm.module.css";

interface ReceiptSettingsFormProps {
  value: ReceiptSettings;
  business: BusinessSettings;

  disabled?: boolean;

  onChange: (
    value: ReceiptSettings,
  ) => void;
}

const paperSizeOptions:
  SelectOption<ReceiptPaperSize>[] = [
    {
      value: "58mm",
      label: "Bobina térmica — 58 mm",
    },
    {
      value: "80mm",
      label: "Bobina térmica — 80 mm",
    },
    {
      value: "a4",
      label: "Folha A4",
    },
  ];

function getAddress(
  business: BusinessSettings,
): string {
  return [
    [
      business.street,
      business.number,
    ]
      .filter(Boolean)
      .join(", "),

    business.neighborhood,

    [
      business.city,
      business.state,
    ]
      .filter(Boolean)
      .join(" - "),

    business.postalCode
      ? `CEP ${business.postalCode}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function ReceiptSettingsForm({
  value,
  business,
  disabled = false,
  onChange,
}: ReceiptSettingsFormProps) {
  const [printerOptions, setPrinterOptions] = useState([
    { value: "system-default", label: "Impressora escolhida no diálogo do sistema" },
  ]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  async function loadPrinters() {
    setLoadingPrinters(true);
    try {
      const options = await printerService.list();
      setPrinterOptions(
        value.printerName !== "system-default" &&
        !options.some((option) => option.value === value.printerName)
          ? [...options, { value: value.printerName, label: value.printerName }]
          : options,
      );
    } finally {
      setLoadingPrinters(false);
    }
  }

  useEffect(() => {
    void loadPrinters();
    // A lista é carregada ao abrir a aba; o botão permite atualizar sob demanda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function updateField<
    Key extends keyof ReceiptSettings,
  >(
    field: Key,
    fieldValue: ReceiptSettings[Key],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  const address =
    getAddress(business);

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <ReceiptText size={21} />
        </div>

        <div>
          <h3>
            Configurações do comprovante
          </h3>

          <p>
            Personalize as informações entregues ao cliente após a venda.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.configuration}>
          <div className={styles.sectionTitle}>
            <FileText size={16} />

            <div>
              <strong>
                Formato e conteúdo
              </strong>

              <span>
                Escolha o papel e as informações apresentadas.
              </span>
            </div>
          </div>

          <div className={styles.paperField}>
            <Select
              label="Impressora dos comprovantes e relatórios térmicos"
              value={value.printerName}
              options={printerOptions}
              disabled={disabled || loadingPrinters}
              onChange={(printerName) => updateField("printerName", printerName)}
            />

            <button
              type="button"
              className={styles.refreshPrinters}
              disabled={disabled || loadingPrinters}
              onClick={() => void loadPrinters()}
            >
              {loadingPrinters ? <RefreshCw size={16} /> : <Printer size={16} />}
              {loadingPrinters ? "Buscando..." : "Atualizar impressoras"}
            </button>

            <Select
              label="Tamanho do papel"
              value={value.paperSize}
              options={paperSizeOptions}
              disabled={disabled}
              onChange={(paperSize) =>
                updateField(
                  "paperSize",
                  paperSize,
                )
              }
            />
          </div>

          <div className={styles.switchGrid}>
            <SettingsSwitch
              checked={value.showLogo}
              title="Exibir logotipo"
              description="Mostra o logotipo cadastrado no cabeçalho."
              icon={
                <Building2 size={17} />
              }
              disabled={disabled}
              onChange={(checked) =>
                updateField(
                  "showLogo",
                  checked,
                )
              }
            />

            <SettingsSwitch
              checked={value.showLegalName}
              title="Exibir razão social"
              description="Mostra a razão social abaixo do nome fantasia."
              icon={
                <Building2 size={17} />
              }
              disabled={disabled}
              onChange={(checked) =>
                updateField(
                  "showLegalName",
                  checked,
                )
              }
            />

            <SettingsSwitch
              checked={value.showDocument}
              title="Exibir CNPJ ou CPF"
              description="Inclui o documento do estabelecimento."
              icon={
                <FileText size={17} />
              }
              disabled={disabled}
              onChange={(checked) =>
                updateField(
                  "showDocument",
                  checked,
                )
              }
            />

            <SettingsSwitch
              checked={value.showAddress}
              title="Exibir endereço"
              description="Inclui o endereço informado nas configurações."
              icon={
                <Building2 size={17} />
              }
              disabled={disabled}
              onChange={(checked) =>
                updateField(
                  "showAddress",
                  checked,
                )
              }
            />

            <SettingsSwitch
              checked={value.showPhone}
              title="Exibir telefone"
              description="Inclui o telefone de atendimento."
              icon={
                <MessageSquareText
                  size={17}
                />
              }
              disabled={disabled}
              onChange={(checked) =>
                updateField(
                  "showPhone",
                  checked,
                )
              }
            />

            <SettingsSwitch
              checked={value.showSeller}
              title="Exibir vendedor"
              description="Identifica o responsável pela operação."
              icon={
                <UserRound size={17} />
              }
              disabled={disabled}
              onChange={(checked) =>
                updateField(
                  "showSeller",
                  checked,
                )
              }
            />

            <SettingsSwitch
              checked={value.showCustomer}
              title="Exibir cliente"
              description="Mostra o cliente associado à venda."
              icon={
                <UserRound size={17} />
              }
              disabled={disabled}
              onChange={(checked) =>
                updateField(
                  "showCustomer",
                  checked,
                )
              }
            />
          </div>

          <label className={styles.field}>
            <span>
              Mensagem do rodapé
            </span>

            <textarea
              rows={3}
              maxLength={240}
              value={value.footerMessage}
              disabled={disabled}
              placeholder="Obrigado pela preferência!"
              onChange={(event) =>
                updateField(
                  "footerMessage",
                  event.target.value,
                )
              }
            />

            <small>
              {value.footerMessage.length}/240 caracteres
            </small>
          </label>
        </div>

        <aside className={styles.previewArea}>
          <span className={styles.previewLabel}>
            Pré-visualização
          </span>

          <div
            className={`${styles.receipt} ${
              styles[value.paperSize]
            }`}
          >
            <div className={styles.receiptHeader}>
              {value.showLogo && (
                business.logo ? (
                  <img
                    src={business.logo}
                    alt="Logotipo"
                  />
                ) : (
                  <div className={styles.logoFallback}>
                    {business.shortName || "GF"}
                  </div>
                )
              )}

              <strong>
                {business.tradeName ||
                  "Nome do estabelecimento"}
              </strong>

              {value.showLegalName && (
                <span>
                  {business.legalName ||
                    "Razão social"}
                </span>
              )}

              {value.showDocument &&
                business.document && (
                  <span>
                    {business.document}
                  </span>
                )}

              {value.showAddress &&
                address && (
                  <span>
                    {address}
                  </span>
                )}

              {value.showPhone &&
                business.phone && (
                  <span>
                    {business.phone}
                  </span>
                )}
            </div>

            <div className={styles.receiptTitle}>
              <strong>
                COMPROVANTE DE VENDA
              </strong>

              <span>
                VEN-000128 · 11/08/2026 14:32
              </span>
            </div>

            <div className={styles.receiptPeople}>
              {value.showCustomer && (
                <span>
                  Cliente: Cliente balcão
                </span>
              )}

              {value.showSeller && (
                <span>
                  Vendedor: Administrador
                </span>
              )}
            </div>

            <div className={styles.receiptItems}>
              <div>
                <span>
                  1,000 kg · Ração Premium
                </span>

                <strong>
                  {formatCurrency(24)}
                </strong>
              </div>

              <div>
                <span>
                  2 un · Petisco para cães
                </span>

                <strong>
                  {formatCurrency(15.8)}
                </strong>
              </div>
            </div>

            <div className={styles.receiptTotals}>
              <span>
                Subtotal

                <strong>
                  {formatCurrency(39.8)}
                </strong>
              </span>

              <span>
                Desconto

                <strong>
                  {formatCurrency(0)}
                </strong>
              </span>

              <span className={styles.receiptTotal}>
                Total

                <strong>
                  {formatCurrency(39.8)}
                </strong>
              </span>

              <span>
                Pagamento

                <strong>
                  Pix
                </strong>
              </span>
            </div>

            {value.footerMessage.trim() && (
              <p>
                {value.footerMessage}
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
