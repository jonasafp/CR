import type {
  PaymentMethod,
  Sale,
} from "../../domain/sales/Sale";

import type {
  BusinessSettings,
  ReceiptPaperSize,
  ReceiptSettings,
} from "../../domain/settings/SystemSettings";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../utils/formatters";

import {
  settingsStorageService,
} from "../settings/settingsStorageService";

const paymentMethodLabels:
  Record<PaymentMethod, string> = {
    cash: "Dinheiro",
    pix: "Pix",

    credit_card:
      "Cartão de crédito",

    debit_card:
      "Cartão de débito",

    bank_transfer:
      "Transferência bancária",

    other: "Outro",
  };

function escapeHtml(
  value: string | number,
): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

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

    business.complement,
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

function getPaperStyles(
  paperSize:
    ReceiptPaperSize,
) {
  if (
    paperSize === "58mm"
  ) {
    return {
      pageSize: "58mm auto",
      contentWidth: "50mm",
      margin: "4mm",
    };
  }

  if (
    paperSize === "80mm"
  ) {
    return {
      pageSize: "80mm auto",
      contentWidth: "72mm",
      margin: "4mm",
    };
  }

  return {
    pageSize: "A4 portrait",
    contentWidth: "190mm",
    margin: "10mm",
  };
}

function createReceiptHtml(
  sale: Sale,
  business:
    BusinessSettings,
  receipt:
    ReceiptSettings,
): string {
  const paper =
    getPaperStyles(
      receipt.paperSize,
    );

  const address =
    getAddress(business);

  const itemsHtml =
    sale.items
      .map(
        (item) => `
          <div class="item">
            <strong>
              ${escapeHtml(
                item.productName,
              )}
            </strong>

            <div>
              <span>
                ${escapeHtml(
                  formatStockQuantity(
                    item.quantity,
                    item.unit,
                  ),
                )}
                ×
                ${escapeHtml(
                  formatCurrency(
                    item.unitPrice,
                  ),
                )}
              </span>

              <strong>
                ${escapeHtml(
                  formatCurrency(
                    item.total,
                  ),
                )}
              </strong>
            </div>

            ${
              item.discount > 0
                ? `
                  <small>
                    Desconto:
                    ${escapeHtml(
                      formatCurrency(
                        item.discount,
                      ),
                    )}
                  </small>
                `
                : ""
            }
          </div>
        `,
      )
      .join("");

  return `
    <!doctype html>

    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />

        <title>
          Comprovante
          ${escapeHtml(
            sale.number,
          )}
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            width:
              ${paper.contentWidth};

            margin: 0 auto;

            color: #111827;

            font-family:
              Arial,
              sans-serif;

            font-size: 11px;
          }

          header {
            padding-bottom: 10px;

            border-bottom:
              1px dashed #64748b;

            text-align: center;
          }

          header img {
            display: block;

            max-width: 42mm;
            max-height: 22mm;

            margin:
              0 auto 7px;

            object-fit: contain;
          }

          header strong,
          header span {
            display: block;
          }

          header strong {
            font-size: 14px;
          }

          header span {
            margin-top: 3px;

            font-size: 9px;
          }

          .title {
            padding: 10px 0;

            border-bottom:
              1px dashed #64748b;

            text-align: center;
          }

          .title strong,
          .title span {
            display: block;
          }

          .title span {
            margin-top: 3px;

            font-size: 9px;
          }

          .cancelled {
            margin-top: 5px;

            font-weight: 700;
          }

          .people {
            padding: 8px 0;

            border-bottom:
              1px dashed #64748b;
          }

          .people span {
            display: block;

            margin: 2px 0;
          }

          .items {
            padding: 4px 0;

            border-bottom:
              1px dashed #64748b;
          }

          .item {
            padding: 6px 0;
          }

          .item > strong {
            display: block;

            margin-bottom: 3px;
          }

          .item div,
          .totals span {
            display: flex;

            justify-content:
              space-between;

            gap: 10px;
          }

          .item small {
            display: block;

            margin-top: 2px;
          }

          .totals {
            padding: 8px 0;
          }

          .totals span {
            margin: 4px 0;
          }

          .total {
            padding-top: 5px;

            border-top:
              1px solid #111827;

            font-size: 14px;
          }

          .notes {
            padding: 7px 0;

            border-top:
              1px dashed #64748b;
          }

          footer {
            padding-top: 9px;

            border-top:
              1px dashed #64748b;

            text-align: center;

            white-space: pre-wrap;
          }

          @page {
            size:
              ${paper.pageSize};

            margin:
              ${paper.margin};
          }

          @media print {
            body {
              width: 100%;
            }
          }
        </style>
      </head>

      <body>
        <header>
          ${
            receipt.showLogo &&
            business.logo
              ? `
                <img
                  src="${escapeHtml(
                    business.logo,
                  )}"
                  alt="Logotipo"
                />
              `
              : ""
          }

          <strong>
            ${escapeHtml(
              business.tradeName ||
                business.legalName ||
                "Estabelecimento",
            )}
          </strong>

          ${
            receipt.showLegalName &&
            business.legalName
              ? `
                <span>
                  ${escapeHtml(
                    business.legalName,
                  )}
                </span>
              `
              : ""
          }

          ${
            receipt.showDocument &&
            business.document
              ? `
                <span>
                  ${escapeHtml(
                    business.document,
                  )}
                </span>
              `
              : ""
          }

          ${
            receipt.showAddress &&
            address
              ? `
                <span>
                  ${escapeHtml(
                    address,
                  )}
                </span>
              `
              : ""
          }

          ${
            receipt.showPhone &&
            business.phone
              ? `
                <span>
                  ${escapeHtml(
                    business.phone,
                  )}
                </span>
              `
              : ""
          }
        </header>

        <section class="title">
          <strong>
            COMPROVANTE DE VENDA
          </strong>

          <span>
            ${escapeHtml(
              sale.number,
            )}
            ·
            ${escapeHtml(
              formatDateTime(
                sale.completedAt ??
                  sale.createdAt,
              ),
            )}
          </span>

          ${
            sale.status ===
            "cancelled"
              ? `
                <span
                  class="cancelled"
                >
                  VENDA CANCELADA
                </span>
              `
              : ""
          }
        </section>

        ${
          receipt.showCustomer ||
          receipt.showSeller
            ? `
              <section
                class="people"
              >
                ${
                  receipt
                    .showCustomer
                    ? `
                      <span>
                        Cliente:
                        ${escapeHtml(
                          sale.customerName ||
                            "Cliente balcão",
                        )}
                      </span>
                    `
                    : ""
                }

                ${
                  receipt
                    .showSeller
                    ? `
                      <span>
                        Vendedor:
                        ${escapeHtml(
                          sale.createdBy,
                        )}
                      </span>
                    `
                    : ""
                }
              </section>
            `
            : ""
        }

        <section class="items">
          ${itemsHtml}
        </section>

        <section class="totals">
          <span>
            Subtotal

            <strong>
              ${escapeHtml(
                formatCurrency(
                  sale.subtotal,
                ),
              )}
            </strong>
          </span>

          <span>
            Desconto

            <strong>
              ${escapeHtml(
                formatCurrency(
                  sale.discount,
                ),
              )}
            </strong>
          </span>

          <span class="total">
            Total

            <strong>
              ${escapeHtml(
                formatCurrency(
                  sale.total,
                ),
              )}
            </strong>
          </span>

          <span>
            Pagamento

            <strong>
              ${escapeHtml(
                paymentMethodLabels[
                  sale.paymentMethod
                ],
              )}
            </strong>
          </span>
        </section>

        ${
          sale.notes
            ? `
              <section
                class="notes"
              >
                <strong>
                  Observações:
                </strong>

                ${escapeHtml(
                  sale.notes,
                )}
              </section>
            `
            : ""
        }

        ${
          receipt.footerMessage
            .trim()
            ? `
              <footer>
                ${escapeHtml(
                  receipt
                    .footerMessage
                    .trim(),
                )}
              </footer>
            `
            : ""
        }
      </body>
    </html>
  `;
}

function openWindow():
  Window | null {
  const printWindow =
    window.open(
      "",
      "_blank",
    );

  if (printWindow) {
    printWindow.opener =
      null;

    printWindow.document.write(
      `
        <p
          style="
            font-family: Arial;
            padding: 24px;
          "
        >
          Finalizando venda e
          preparando comprovante...
        </p>
      `,
    );
  }

  return printWindow;
}

function print(
  sale: Sale,
  existingWindow?:
    Window | null,
): void {
  const printWindow =
    existingWindow ??
    openWindow();

  if (!printWindow) {
    throw new Error(
      "O navegador bloqueou a janela do comprovante. Permita pop-ups para imprimir.",
    );
  }

  const settings =
    settingsStorageService.read();

  printWindow.document.open();

  printWindow.document.write(
    createReceiptHtml(
      sale,
      settings.business,
      settings.receipt,
    ),
  );

  printWindow.document.close();

  printWindow.onafterprint =
    () => {
      printWindow.close();
    };

  printWindow.setTimeout(
    () => {
      printWindow.focus();
      printWindow.print();
    },
    250,
  );
}

export const receiptPrintService = {
  openWindow,
  print,
};