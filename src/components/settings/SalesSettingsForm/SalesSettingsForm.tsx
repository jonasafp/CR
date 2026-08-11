import {
  BadgePercent,
  CircleDollarSign,
  Printer,
  RefreshCw,
  Scale,
  ShoppingCart,
  Tag,
  UserRoundCheck,
} from "lucide-react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  SalesSettings,
} from "../../../domain/settings/SystemSettings";

import type {
  PaymentMethod,
} from "../../../domain/sales/Sale";

import SettingsSwitch from "../SettingsSwitch/SettingsSwitch";

import styles from "./SalesSettingsForm.module.css";

interface SalesSettingsFormProps {
  value: SalesSettings;

  disabled?: boolean;

  onChange: (
    value: SalesSettings,
  ) => void;
}

const paymentOptions:
  SelectOption<PaymentMethod>[] = [
    {
      value: "cash",
      label: "Dinheiro",
    },
    {
      value: "pix",
      label: "Pix",
    },
    {
      value: "credit_card",
      label:
        "Cartão de crédito",
    },
    {
      value: "debit_card",
      label:
        "Cartão de débito",
    },
    {
      value: "bank_transfer",
      label:
        "Transferência bancária",
    },
    {
      value: "other",
      label: "Outro",
    },
  ];

export default function SalesSettingsForm({
  value,
  disabled = false,
  onChange,
}: SalesSettingsFormProps) {
  function updateField<
    Key extends keyof SalesSettings,
  >(
    field: Key,

    fieldValue:
      SalesSettings[Key],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  function updateMaximumDiscount(
    rawValue: string,
  ) {
    const numericValue =
      Number(rawValue);

    updateField(
      "maximumDiscountPercentage",

      Number.isFinite(
        numericValue,
      )
        ? Math.min(
            Math.max(
              numericValue,
              0,
            ),
            100,
          )
        : 0,
    );
  }

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
          <ShoppingCart size={21} />
        </div>

        <div>
          <h3>
            Configurações de vendas
          </h3>

          <p>
            Defina o comportamento padrão e as permissões da tela de vendas.
          </p>
        </div>
      </header>

      <div
        className={styles.content}
      >
        <div
          className={
            styles.sectionTitle
          }
        >
          <CircleDollarSign
            size={16}
          />

          <div>
            <strong>
              Padrões da venda
            </strong>

            <span>
              Valores preenchidos automaticamente ao iniciar um atendimento.
            </span>
          </div>
        </div>

        <div
          className={styles.grid}
        >
          <Select
            label="Forma de pagamento padrão"
            value={
              value.defaultPaymentMethod
            }
            options={
              paymentOptions
            }
            disabled={disabled}
            onChange={(method) =>
              updateField(
                "defaultPaymentMethod",
                method,
              )
            }
          />

          <label
            className={
              styles.field
            }
          >
            <span>
              Cliente padrão
            </span>

            <input
              value={
                value.defaultCustomerName
              }
              maxLength={100}
              disabled={disabled}
              placeholder="Cliente balcão"
              onChange={(event) =>
                updateField(
                  "defaultCustomerName",
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
              Desconto máximo permitido
            </span>

            <div
              className={
                styles.percentageInput
              }
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  value.maximumDiscountPercentage
                }
                disabled={
                  disabled ||
                  (
                    !value.allowItemDiscount &&
                    !value.allowGeneralDiscount
                  )
                }
                onChange={(event) =>
                  updateMaximumDiscount(
                    event.target.value,
                  )
                }
              />

              <span>
                %
              </span>
            </div>

            <small>
              Limite aplicado aos descontos por item e ao desconto geral.
            </small>
          </label>
        </div>

        <div
          className={
            styles.sectionTitle
          }
        >
          <Scale size={16} />

          <div>
            <strong>
              Operação do PDV
            </strong>

            <span>
              Controle quais recursos estarão disponíveis durante a venda.
            </span>
          </div>
        </div>

        <div
          className={
            styles.switchGrid
          }
        >
          <SettingsSwitch
            checked={
              value.allowFractionalKgSales
            }
            title="Venda fracionada por quilograma"
            description="Permite informar quantidade em kg ou o valor desejado para produtos vendidos por quilo."
            icon={
              <Scale size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "allowFractionalKgSales",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.allowPriceChange
            }
            title="Alteração do preço unitário"
            description="Permite ajustar manualmente o preço de um item durante a venda."
            icon={
              <Tag size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "allowPriceChange",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.allowItemDiscount
            }
            title="Desconto por item"
            description="Libera a aplicação de desconto individual nos produtos do carrinho."
            icon={
              <BadgePercent
                size={17}
              />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "allowItemDiscount",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.allowGeneralDiscount
            }
            title="Desconto geral"
            description="Libera um desconto sobre o total completo da venda."
            icon={
              <BadgePercent
                size={17}
              />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "allowGeneralDiscount",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.requireCustomerIdentification
            }
            title="Exigir identificação do cliente"
            description="Impede a finalização enquanto o cliente da venda não estiver identificado."
            icon={
              <UserRoundCheck
                size={17}
              />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "requireCustomerIdentification",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.clearCartAfterSale
            }
            title="Limpar carrinho após finalizar"
            description="Prepara automaticamente a tela para iniciar o próximo atendimento."
            icon={
              <RefreshCw
                size={17}
              />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "clearCartAfterSale",
                checked,
              )
            }
          />

          <SettingsSwitch
            checked={
              value.autoPrintReceipt
            }
            title="Imprimir comprovante automaticamente"
            description="Solicita a impressão do comprovante imediatamente após concluir a venda."
            icon={
              <Printer size={17} />
            }
            disabled={disabled}
            onChange={(checked) =>
              updateField(
                "autoPrintReceipt",
                checked,
              )
            }
          />
        </div>

        <div
          className={styles.notice}
        >
          As permissões serão consumidas pela tela de vendas durante a integração final. A impressão automática utilizará a impressora configurada no ambiente desktop.
        </div>
      </div>
    </section>
  );
}