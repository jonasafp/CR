import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  Minus,
  Package,
  Plus,
  QrCode,
  Save,
  ShoppingCart,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import Select from "../../common/Select/Select";

import type {
  SelectOption,
} from "../../common/Select/Select";

import type {
  CreateSaleInput,
  PaymentMethod,
  SaleCartItem,
} from "../../../domain/sales/Sale";

import type {
  Product,
} from "../../../types/Product";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../../utils/formatters";

import styles from "./SaleFormModal.module.css";

interface SaleFormModalProps {
  isOpen: boolean;
  products: Product[];

  isSubmitting: boolean;
  submitError?: string;

  onClose: () => void;

  onSubmit: (
    input: CreateSaleInput,
  ) => void;
}

interface CartRow
  extends SaleCartItem {
  product: Product;
}

const paymentOptions: SelectOption<PaymentMethod>[] =
  [
    {
      value: "cash",
      label: "Dinheiro",
      icon: <Banknote size={14} />,
    },
    {
      value: "pix",
      label: "Pix",
      icon: <QrCode size={14} />,
    },
    {
      value: "credit_card",
      label: "Cartão de crédito",
      icon: <CreditCard size={14} />,
    },
    {
      value: "debit_card",
      label: "Cartão de débito",
      icon: <WalletCards size={14} />,
    },
    {
      value: "bank_transfer",
      label: "Transferência bancária",
    },
    {
      value: "other",
      label: "Outro",
    },
  ];

function roundValue(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) * 100,
    ) / 100
  );
}

export default function SaleFormModal({
  isOpen,
  products,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: SaleFormModalProps) {
  const [cart, setCart] =
    useState<CartRow[]>([]);

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("pix");

  const [customerName, setCustomerName] =
    useState("");

  const [generalDiscount, setGeneralDiscount] =
    useState(0);

  const [notes, setNotes] =
    useState("");

  const [localError, setLocalError] =
    useState("");

  const availableProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.status === "active" &&
            product.stockQuantity > 0,
        ),
      [products],
    );

  const productOptions: SelectOption<string>[] =
    availableProducts.map(
      (product) => ({
        value: String(product.id),

        label: product.name,

        description: `${product.code} · ${formatStockQuantity(
          product.stockQuantity,
          product.stockUnit,
        )} · ${formatCurrency(
          product.salePrice,
        )}`,

        icon: <Package size={14} />,
      }),
    );

  const subtotal = useMemo(
    () =>
      roundValue(
        cart.reduce(
          (total, item) =>
            total +
            item.quantity *
              item.unitPrice -
            item.discount,
          0,
        ),
      ),
    [cart],
  );

  const validGeneralDiscount =
    Math.min(
      Math.max(
        generalDiscount,
        0,
      ),
      subtotal,
    );

  const total =
    roundValue(
      subtotal -
        validGeneralDiscount,
    );

  function resetForm() {
    setCart([]);
    setSelectedProductId("");
    setPaymentMethod("pix");
    setCustomerName("");
    setGeneralDiscount(0);
    setNotes("");
    setLocalError("");
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  }

  function addSelectedProduct() {
    const productId =
      Number(selectedProductId);

    const product =
      availableProducts.find(
        (item) =>
          item.id === productId,
      );

    if (!product) {
      setLocalError(
        "Selecione um produto válido.",
      );

      return;
    }

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.productId ===
            product.id,
        );

      if (existingItem) {
        if (
          existingItem.quantity + 1 >
          product.stockQuantity
        ) {
          setLocalError(
            "A quantidade ultrapassa o estoque disponível.",
          );

          return currentCart;
        }

        return currentCart.map(
          (item) =>
            item.productId ===
            product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item,
        );
      }

      return [
        ...currentCart,

        {
          productId: product.id,
          product,

          quantity: 1,
          unitPrice:
            product.salePrice,

          discount: 0,
        },
      ];
    });

    setSelectedProductId("");
    setLocalError("");
  }

  function updateQuantity(
    productId: number,
    quantity: number,
  ) {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        const nextQuantity =
          Math.min(
            Math.max(quantity, 0.01),
            item.product.stockQuantity,
          );

        return {
          ...item,
          quantity:
            nextQuantity,
        };
      }),
    );
  }

  function updateItemPrice(
    productId: number,
    unitPrice: number,
  ) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId ===
        productId
          ? {
              ...item,
              unitPrice:
                Math.max(
                  unitPrice,
                  0,
                ),
            }
          : item,
      ),
    );
  }

  function updateItemDiscount(
    productId: number,
    discount: number,
  ) {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        const grossTotal =
          item.quantity *
          item.unitPrice;

        return {
          ...item,

          discount:
            Math.min(
              Math.max(
                discount,
                0,
              ),
              grossTotal,
            ),
        };
      }),
    );
  }

  function removeItem(
    productId: number,
  ) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.productId !==
          productId,
      ),
    );
  }

  function handleSubmit() {
    if (cart.length === 0) {
      setLocalError(
        "Adicione ao menos um produto à venda.",
      );

      return;
    }

    const hasInvalidItem =
      cart.some(
        (item) =>
          item.quantity <= 0 ||
          item.unitPrice < 0 ||
          item.quantity >
            item.product.stockQuantity,
      );

    if (hasInvalidItem) {
      setLocalError(
        "Existem itens com valores inválidos.",
      );

      return;
    }

    onSubmit({
      paymentMethod,

      customerName:
        customerName.trim() ||
        "Cliente balcão",

      items: cart.map(
        (item) => ({
          productId:
            item.productId,

          quantity:
            item.quantity,

          unitPrice:
            item.unitPrice,

          discount:
            item.discount,
        }),
      ),

      discount:
        validGeneralDiscount,

      notes: notes.trim(),
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={handleClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerIcon}>
              <ShoppingCart size={23} />
            </div>

            <div>
              <h2>Nova venda</h2>

              <p>
                Selecione os produtos e finalize o
                atendimento.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={21} />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.productSelection}>
            <div className={styles.productSelect}>
              <Select
                label="Adicionar produto"
                value={selectedProductId}
                placeholder="Pesquise e selecione um produto"
                options={productOptions}
                onChange={
                  setSelectedProductId
                }
              />
            </div>

            <button
              type="button"
              className={styles.addButton}
              onClick={addSelectedProduct}
            >
              <Plus size={17} />
              Adicionar
            </button>
          </section>

          <section className={styles.cart}>
            <div className={styles.cartHeader}>
              <strong>
                Produtos da venda
              </strong>

              <span>
                {cart.length}{" "}
                {cart.length === 1
                  ? "item"
                  : "itens"}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <ShoppingCart size={30} />

                <strong>
                  Carrinho vazio
                </strong>

                <span>
                  Adicione produtos para iniciar a venda.
                </span>
              </div>
            ) : (
              <div className={styles.cartItems}>
                {cart.map((item) => {
                  const grossTotal =
                    item.quantity *
                    item.unitPrice;

                  const itemTotal =
                    grossTotal -
                    item.discount;

                  return (
                    <article
                      key={item.productId}
                      className={styles.cartItem}
                    >
                      <div
                        className={
                          styles.productInformation
                        }
                      >
                        <div
                          className={
                            styles.productIcon
                          }
                        >
                          <Package size={19} />
                        </div>

                        <div>
                          <strong>
                            {item.product.name}
                          </strong>

                          <span>
                            Estoque:{" "}
                            {formatStockQuantity(
                              item.product
                                .stockQuantity,
                              item.product
                                .stockUnit,
                            )}
                          </span>
                        </div>
                      </div>

                      <label
                        className={styles.itemField}
                      >
                        <span>Quantidade</span>

                        <div
                          className={
                            styles.quantityControl
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity -
                                  1,
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>

                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(event) =>
                              updateQuantity(
                                item.productId,
                                Number(
                                  event.target
                                    .value,
                                ),
                              )
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity +
                                  1,
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </label>

                      <label
                        className={styles.itemField}
                      >
                        <span>Preço unitário</span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) =>
                            updateItemPrice(
                              item.productId,
                              Number(
                                event.target.value,
                              ),
                            )
                          }
                        />
                      </label>

                      <label
                        className={styles.itemField}
                      >
                        <span>Desconto</span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={(event) =>
                            updateItemDiscount(
                              item.productId,
                              Number(
                                event.target.value,
                              ),
                            )
                          }
                        />
                      </label>

                      <div className={styles.itemTotal}>
                        <span>Total</span>

                        <strong>
                          {formatCurrency(
                            itemTotal,
                          )}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className={
                          styles.removeButton
                        }
                        onClick={() =>
                          removeItem(
                            item.productId,
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className={styles.saleDetails}>
            <div className={styles.detailsGrid}>
              <div>
                <Select
                  label="Forma de pagamento"
                  required
                  value={paymentMethod}
                  options={paymentOptions}
                  onChange={
                    setPaymentMethod
                  }
                />
              </div>

              <label className={styles.field}>
                <span>Cliente</span>

                <input
                  value={customerName}
                  placeholder="Cliente balcão"
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Desconto geral</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={generalDiscount}
                  onChange={(event) =>
                    setGeneralDiscount(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <span>Observações</span>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.summary}>
            <div className={styles.summaryIcon}>
              <CircleDollarSign size={22} />
            </div>

            <div>
              <span>Subtotal</span>
              <strong>
                {formatCurrency(subtotal)}
              </strong>
            </div>

            <div>
              <span>Desconto geral</span>
              <strong>
                {formatCurrency(
                  validGeneralDiscount,
                )}
              </strong>
            </div>

            <div className={styles.totalSummary}>
              <span>Total da venda</span>
              <strong>
                {formatCurrency(total)}
              </strong>
            </div>
          </section>

          {(localError || submitError) && (
            <div className={styles.error}>
              {localError || submitError}
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              cart.length === 0
            }
          >
            <Save size={17} />

            {isSubmitting
              ? "Finalizando..."
              : "Finalizar venda"}
          </button>
        </footer>
      </div>
    </div>
  );
}