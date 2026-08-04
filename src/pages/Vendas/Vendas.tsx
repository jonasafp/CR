import {
  Banknote,
  Check,
  CircleDollarSign,
  CreditCard,
  History,
  Minus,
  Package,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShoppingBasket,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import Pagination from "../../components/common/Pagination/Pagination";
import SaleFilters from "../../components/sales/SaleFilters/SaleFilters";
import SalesTable from "../../components/sales/SalesTable/SalesTable";

import {
  useCancelSaleMutation,
} from "../../application/sales/useCancelSaleMutation";

import {
  useCreateSaleMutation,
} from "../../application/sales/useCreateSaleMutation";

import {
  useSalesQuery,
} from "../../application/sales/useSalesQuery";

import type {
  CreateSaleInput,
  PaymentMethod,
  Sale,
} from "../../domain/sales/Sale";

import {
  defaultSaleFilters,
} from "../../domain/sales/SaleFilters";

import type {
  SaleFilters as SaleFiltersState,
} from "../../domain/sales/SaleFilters";

import {
  useProducts,
} from "../../hooks/useProducts";

import type {
  Product,
} from "../../types/Product";

import {
  formatCurrency,
  formatStockQuantity,
} from "../../utils/formatters";

import styles from "./Vendas.module.css";

interface CartRow {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

const paymentMethods: Array<{
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}> = [
  {
    value: "pix",
    label: "Pix",
    icon: QrCode,
  },
  {
    value: "cash",
    label: "Dinheiro",
    icon: Banknote,
  },
  {
    value: "debit_card",
    label: "Débito",
    icon: WalletCards,
  },
  {
    value: "credit_card",
    label: "Crédito",
    icon: CreditCard,
  },
  {
    value: "bank_transfer",
    label: "Transferência",
    icon: CircleDollarSign,
  },
  {
    value: "other",
    label: "Outro",
    icon: ReceiptText,
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

function roundQuantity(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) *
        1_000_000,
    ) / 1_000_000
  );
}

function normalize(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase();
}

function getErrorMessage(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}

export default function Vendas() {
  const { products } =
    useProducts();

  const searchRef =
    useRef<HTMLInputElement>(null);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("Todos");

  const [cart, setCart] =
    useState<CartRow[]>([]);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>(
    "pix",
  );

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    generalDiscount,
    setGeneralDiscount,
  ] = useState(0);

  const [notes, setNotes] =
    useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    isHistoryOpen,
    setIsHistoryOpen,
  ] = useState(false);

  const [
    selectedSale,
    setSelectedSale,
  ] = useState<Sale | null>(
    null,
  );

  const [
    saleToCancel,
    setSaleToCancel,
  ] = useState<Sale | null>(
    null,
  );

  const [filters, setFilters] =
    useState<SaleFiltersState>({
      ...defaultSaleFilters,
    });

  const {
    salesQuery,
  } = useSalesQuery(filters);

  const createSaleMutation =
    useCreateSaleMutation();

  const cancelSaleMutation =
    useCancelSaleMutation();

  const availableProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.status ===
              "active" &&
            product.stockQuantity > 0,
        ),
      [products],
    );

  const categories =
    useMemo(
      () => [
        "Todos",

        ...Array.from(
          new Set(
            availableProducts.map(
              (product) =>
                product.category,
            ),
          ),
        ).sort(),
      ],
      [availableProducts],
    );

  const filteredProducts =
    useMemo(() => {
      const term =
        normalize(
          search.trim(),
        );

      return availableProducts.filter(
        (product) => {
          const matchesCategory =
            category === "Todos" ||
            product.category ===
              category;

          const searchable =
            normalize(
              `${
                product.code
              } ${
                product.barcode ??
                ""
              } ${
                product.name
              } ${
                product.category
              }`,
            );

          return (
            matchesCategory &&
            (
              !term ||
              searchable.includes(
                term,
              )
            )
          );
        },
      );
    }, [
      availableProducts,
      category,
      search,
    ]);

  const subtotal =
    roundValue(
      cart.reduce(
        (total, item) =>
          total +
          item.quantity *
            item.unitPrice -
          item.discount,
        0,
      ),
    );

  const validDiscount =
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
        validDiscount,
    );

  const totalUnits =
    cart.reduce(
      (totalItems, item) =>
        totalItems +
        item.quantity,
      0,
    );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  function addProduct(
    product: Product,
  ) {
    setCart(
      (currentCart) => {
        const existingItem =
          currentCart.find(
            (item) =>
              item.product.id ===
              product.id,
          );

        if (existingItem) {
          const nextQuantity =
            existingItem.quantity +
            1;

          if (
            nextQuantity >
            product.stockQuantity
          ) {
            setLocalError(
              "A quantidade solicitada ultrapassa o estoque disponível.",
            );

            return currentCart;
          }

          return currentCart.map(
            (item) =>
              item.product.id ===
              product.id
                ? {
                    ...item,

                    quantity:
                      roundQuantity(
                        nextQuantity,
                      ),
                  }
                : item,
          );
        }

        return [
          ...currentCart,

          {
            product,
            quantity: 1,
            unitPrice:
              product.salePrice,
            discount: 0,
          },
        ];
      },
    );

    setSearch("");
    setLocalError("");
    setSuccessMessage("");

    window.setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
  }

  function updateQuantity(
    productId: number,
    quantity: number,
  ) {
    setLocalError("");

    setCart(
      (currentCart) =>
        currentCart.map(
          (item) => {
            if (
              item.product.id !==
              productId
            ) {
              return item;
            }

            const safeQuantity =
              Number.isFinite(
                quantity,
              )
                ? quantity
                : 0.01;

            const limitedQuantity =
              Math.min(
                Math.max(
                  safeQuantity,
                  0.01,
                ),
                item.product
                  .stockQuantity,
              );

            if (
              safeQuantity >
              item.product
                .stockQuantity
            ) {
              setLocalError(
                `A quantidade informada ultrapassa o estoque disponível de “${item.product.name}”.`,
              );
            }

            return {
              ...item,

              quantity:
                roundQuantity(
                  limitedQuantity,
                ),
            };
          },
        ),
    );
  }

  function updateItemValue(
    productId: number,
    requestedValue: number,
  ) {
    setLocalError("");

    setCart(
      (currentCart) =>
        currentCart.map(
          (item) => {
            if (
              item.product.id !==
                productId ||
              item.product
                .stockUnit !==
                "kg"
            ) {
              return item;
            }

            const safeValue =
              Number.isFinite(
                requestedValue,
              )
                ? Math.max(
                    requestedValue,
                    0.01,
                  )
                : 0.01;

            const requestedQuantity =
              safeValue /
              item.unitPrice;

            if (
              requestedQuantity >
              item.product
                .stockQuantity
            ) {
              setLocalError(
                `O valor informado ultrapassa o estoque disponível de “${item.product.name}”.`,
              );

              return {
                ...item,

                quantity:
                  roundQuantity(
                    item.product
                      .stockQuantity,
                  ),
              };
            }

            return {
              ...item,

              quantity:
                roundQuantity(
                  requestedQuantity,
                ),
            };
          },
        ),
    );
  }

  function removeProduct(
    productId: number,
  ) {
    setCart(
      (currentCart) =>
        currentCart.filter(
          (item) =>
            item.product.id !==
            productId,
        ),
    );

    setLocalError("");
  }

  function resetSale() {
    setCart([]);
    setPaymentMethod("pix");
    setCustomerName("");
    setGeneralDiscount(0);
    setNotes("");
    setLocalError("");

    createSaleMutation.reset();

    window.setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
  }

  function finishSale() {
    if (cart.length === 0) {
      setLocalError(
        "Adicione ao menos um produto para finalizar a venda.",
      );

      return;
    }

    const hasInvalidItem =
      cart.some(
        (item) =>
          item.quantity <= 0 ||
          item.quantity >
            item.product
              .stockQuantity,
      );

    if (hasInvalidItem) {
      setLocalError(
        "Existem produtos com quantidade inválida ou superior ao estoque.",
      );

      return;
    }

    const input:
      CreateSaleInput = {
        paymentMethod,

        customerName:
          customerName.trim() ||
          "Cliente balcão",

        items: cart.map(
          (item) => ({
            productId:
              item.product.id,

            quantity:
              item.quantity,

            unitPrice:
              item.unitPrice,

            discount:
              item.discount,
          }),
        ),

        discount:
          validDiscount,

        notes:
          notes.trim(),
      };

    createSaleMutation.mutate(
      input,
      {
        onSuccess: (
          sale,
        ) => {
          resetSale();

          setSuccessMessage(
            `Venda ${sale.number} finalizada com sucesso.`,
          );

          window.setTimeout(
            () => {
              setSuccessMessage(
                "",
              );
            },
            4500,
          );
        },
      },
    );
  }

  function handleConfirmCancel() {
    if (!saleToCancel) {
      return;
    }

    cancelSaleMutation.mutate(
      {
        saleId:
          saleToCancel.id,

        reason:
          "Cancelamento manual realizado pelo administrador.",
      },
      {
        onSuccess: () => {
          setSaleToCancel(null);
        },
      },
    );
  }

  return (
    <section
      className={styles.page}
    >
      <header
        className={
          styles.posHeader
        }
      >
        <div
          className={
            styles.titleBlock
          }
        >
          <div
            className={
              styles.titleIcon
            }
          >
            <ShoppingBasket
              size={21}
            />
          </div>

          <div>
            <span>
              Frente de caixa
            </span>

            <h2>Nova venda</h2>
          </div>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <div
            className={
              styles.operatorStatus
            }
          >
            <i />

            <span>
              Caixa disponível
            </span>
          </div>

          <button
            type="button"
            className={
              styles.historyButton
            }
            onClick={() =>
              setIsHistoryOpen(
                true,
              )
            }
          >
            <History size={17} />

            Histórico
          </button>
        </div>
      </header>

      {successMessage && (
        <div
          className={
            styles.successToast
          }
        >
          <Check size={17} />

          {successMessage}
        </div>
      )}

      <div
        className={
          styles.posGrid
        }
      >
        <main
          className={
            styles.catalogPanel
          }
        >
          <div
            className={
              styles.searchArea
            }
          >
            <div
              className={
                styles.searchBox
              }
            >
              <Search size={20} />

              <input
                ref={searchRef}
                value={search}
                placeholder="Busque por produto, código ou código de barras"
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                      "Enter" &&
                    filteredProducts.length ===
                      1
                  ) {
                    addProduct(
                      filteredProducts[0],
                    );
                  }
                }}
              />
            </div>

            <div
              className={
                styles.categories
              }
            >
              {categories.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      category ===
                      item
                        ? styles.categoryActive
                        : ""
                    }
                    onClick={() =>
                      setCategory(
                        item,
                      )
                    }
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>

          <div
            className={
              styles.catalogHeading
            }
          >
            <div>
              <strong>
                Produtos
              </strong>

              <span>
                Selecione para
                adicionar à venda
              </span>
            </div>

            <span>
              {
                filteredProducts.length
              }{" "}
              disponíveis
            </span>
          </div>

          {filteredProducts.length ===
          0 ? (
            <div
              className={
                styles.emptyProducts
              }
            >
              <Package size={35} />

              <strong>
                Nenhum produto
                encontrado
              </strong>

              <span>
                Tente outro nome,
                código ou categoria.
              </span>
            </div>
          ) : (
            <div
              className={
                styles.productsGrid
              }
            >
              {filteredProducts.map(
                (product) => (
                  <button
                    key={
                      product.id
                    }
                    type="button"
                    className={
                      styles.productCard
                    }
                    onClick={() =>
                      addProduct(
                        product,
                      )
                    }
                  >
                    <div
                      className={
                        styles.productVisual
                      }
                    >
                      {product.image ? (
                        <img
                          src={
                            product.image
                          }
                          alt=""
                        />
                      ) : (
                        <Package
                          size={26}
                        />
                      )}

                      <span>
                        {
                          product.code
                        }
                      </span>
                    </div>

                    <div
                      className={
                        styles.productInfo
                      }
                    >
                      <strong>
                        {
                          product.name
                        }
                      </strong>

                      <span>
                        {
                          product.category
                        }
                      </span>

                      <div>
                        <b>
                          {formatCurrency(
                            product.salePrice,
                          )}
                        </b>

                        <small>
                          {formatStockQuantity(
                            product.stockQuantity,
                            product.stockUnit,
                          )}{" "}
                          em estoque
                        </small>
                      </div>
                    </div>

                    <span
                      className={
                        styles.quickAdd
                      }
                    >
                      <Plus
                        size={15}
                      />
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </main>

        <aside
          className={
            styles.checkoutPanel
          }
        >
          <div
            className={
              styles.cartHeader
            }
          >
            <div>
              <ShoppingBasket
                size={18}
              />

              <strong>
                Itens da venda
              </strong>
            </div>

            <span>
              {cart.length}{" "}
              {cart.length === 1
                ? "produto"
                : "produtos"}
            </span>
          </div>

          <div
            className={
              styles.cartList
            }
          >
            {cart.length === 0 ? (
              <div
                className={
                  styles.emptyCart
                }
              >
                <div>
                  <ShoppingBasket
                    size={29}
                  />
                </div>

                <strong>
                  Sua venda está
                  vazia
                </strong>

                <span>
                  Busque um produto
                  ou selecione-o no
                  catálogo para
                  começar.
                </span>
              </div>
            ) : (
              cart.map((item) => {
                const isKilogram =
                  item.product
                    .stockUnit ===
                  "kg";

                const itemTotal =
                  roundValue(
                    item.quantity *
                      item.unitPrice -
                      item.discount,
                  );

                return (
                  <article
                    key={
                      item.product.id
                    }
                    className={
                      styles.cartItem
                    }
                  >
                    <div
                      className={
                        styles.cartItemTop
                      }
                    >
                      <div>
                        <strong>
                          {
                            item.product
                              .name
                          }
                        </strong>

                        <span>
                          {
                            item.product
                              .code
                          }{" "}
                          ·{" "}
                          {formatCurrency(
                            item.unitPrice,
                          )}
                          /
                          {
                            item.product
                              .stockUnit
                          }
                        </span>
                      </div>

                      <button
                        type="button"
                        title="Remover item"
                        onClick={() =>
                          removeProduct(
                            item.product
                              .id,
                          )
                        }
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>

                    <div
                      className={
                        styles.cartItemBottom
                      }
                    >
                      <div
                        className={
                          styles.itemCalculations
                        }
                      >
                        <label
                          className={
                            styles.quantityField
                          }
                        >
                          <span>
                            {isKilogram
                              ? "Quantidade (kg)"
                              : "Quantidade"}
                          </span>

                          <div
                            className={
                              styles.quantityControl
                            }
                          >
                            <button
                              type="button"
                              aria-label="Diminuir quantidade"
                              onClick={() =>
                                updateQuantity(
                                  item
                                    .product
                                    .id,
                                  item.quantity -
                                    1,
                                )
                              }
                            >
                              <Minus
                                size={14}
                              />
                            </button>

                            <input
                              type="number"
                              min="0.01"
                              step={
                                isKilogram
                                  ? "0.001"
                                  : "1"
                              }
                              value={
                                item.quantity
                              }
                              aria-label={
                                isKilogram
                                  ? "Quantidade em quilos"
                                  : "Quantidade"
                              }
                              onChange={(
                                event,
                              ) =>
                                updateQuantity(
                                  item
                                    .product
                                    .id,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                )
                              }
                            />

                            <button
                              type="button"
                              aria-label="Aumentar quantidade"
                              onClick={() =>
                                updateQuantity(
                                  item
                                    .product
                                    .id,
                                  item.quantity +
                                    1,
                                )
                              }
                            >
                              <Plus
                                size={14}
                              />
                            </button>
                          </div>
                        </label>

                        {isKilogram && (
                          <label
                            className={
                              styles.valueField
                            }
                          >
                            <span>
                              Venda por valor
                            </span>

                            <div
                              className={
                                styles.valueInput
                              }
                            >
                              <span>
                                R$
                              </span>

                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={roundValue(
                                  item.quantity *
                                    item.unitPrice,
                                )}
                                aria-label="Valor desejado em reais"
                                onChange={(
                                  event,
                                ) =>
                                  updateItemValue(
                                    item
                                      .product
                                      .id,
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                  )
                                }
                              />
                            </div>
                          </label>
                        )}
                      </div>

                      <strong>
                        {formatCurrency(
                          itemTotal,
                        )}
                      </strong>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div
            className={
              styles.checkoutForm
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>Cliente</span>

              <input
                value={customerName}
                placeholder="Cliente balcão"
                onChange={(
                  event,
                ) =>
                  setCustomerName(
                    event.target
                      .value,
                  )
                }
              />
            </label>

            <div
              className={
                styles.paymentBlock
              }
            >
              <span>
                Forma de pagamento
              </span>

              <div
                className={
                  styles.paymentGrid
                }
              >
                {paymentMethods.map(
                  ({
                    value,
                    label,
                    icon: Icon,
                  }) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        paymentMethod ===
                        value
                          ? styles.paymentActive
                          : ""
                      }
                      onClick={() =>
                        setPaymentMethod(
                          value,
                        )
                      }
                    >
                      <Icon
                        size={16}
                      />

                      <span>
                        {label}
                      </span>

                      {paymentMethod ===
                        value && (
                        <Check
                          size={12}
                        />
                      )}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div
              className={
                styles.secondaryFields
              }
            >
              <label
                className={
                  styles.field
                }
              >
                <span>
                  Desconto
                </span>

                <div
                  className={
                    styles.moneyInput
                  }
                >
                  <span>R$</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      generalDiscount
                    }
                    onChange={(
                      event,
                    ) =>
                      setGeneralDiscount(
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                  />
                </div>
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Observação
                </span>

                <input
                  value={notes}
                  placeholder="Opcional"
                  onChange={(
                    event,
                  ) =>
                    setNotes(
                      event.target
                        .value,
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div
            className={
              styles.totals
            }
          >
            <div>
              <span>Itens</span>

              <strong>
                {totalUnits.toLocaleString(
                  "pt-BR",
                  {
                    maximumFractionDigits: 3,
                  },
                )}
              </strong>
            </div>

            <div>
              <span>Subtotal</span>

              <strong>
                {formatCurrency(
                  subtotal,
                )}
              </strong>
            </div>

            <div>
              <span>Desconto</span>

              <strong>
                -{" "}
                {formatCurrency(
                  validDiscount,
                )}
              </strong>
            </div>

            <div
              className={
                styles.grandTotal
              }
            >
              <span>
                Total a receber
              </span>

              <strong>
                {formatCurrency(
                  total,
                )}
              </strong>
            </div>
          </div>

          {(localError ||
            createSaleMutation.isError) && (
            <div
              className={
                styles.errorMessage
              }
            >
              {localError ||
                getErrorMessage(
                  createSaleMutation.error,
                )}
            </div>
          )}

          <div
            className={
              styles.checkoutActions
            }
          >
            <button
              type="button"
              className={
                styles.clearButton
              }
              disabled={
                cart.length === 0 ||
                createSaleMutation.isPending
              }
              onClick={
                resetSale
              }
            >
              Limpar
            </button>

            <button
              type="button"
              className={
                styles.finishButton
              }
              disabled={
                cart.length === 0 ||
                createSaleMutation.isPending
              }
              onClick={
                finishSale
              }
            >
              <Check size={18} />

              {createSaleMutation.isPending
                ? "Finalizando..."
                : "Finalizar venda"}
            </button>
          </div>
        </aside>
      </div>

      {isHistoryOpen && (
        <div
          className={
            styles.historyOverlay
          }
          onMouseDown={() =>
            setIsHistoryOpen(
              false,
            )
          }
        >
          <section
            className={
              styles.historyDrawer
            }
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <header
              className={
                styles.historyHeader
              }
            >
              <div>
                <div
                  className={
                    styles.historyIcon
                  }
                >
                  <History
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Consulta
                  </span>

                  <h3>
                    Histórico de
                    vendas
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsHistoryOpen(
                    false,
                  )
                }
              >
                <X size={20} />
              </button>
            </header>

            <SaleFilters
              filters={filters}
              onChange={
                setFilters
              }
              onReset={() =>
                setFilters({
                  ...defaultSaleFilters,
                })
              }
            />

            <div
              className={
                styles.historyContent
              }
            >
              {salesQuery.isLoading ? (
                <LoadingState
                  title="Carregando vendas"
                  description="Consultando as operações registradas."
                />
              ) : salesQuery.isError ? (
                <ErrorState
                  description={getErrorMessage(
                    salesQuery.error,
                  )}
                  onRetry={() =>
                    void salesQuery.refetch()
                  }
                />
              ) : (
                <>
                  <SalesTable
                    sales={
                      salesQuery.data
                        ?.items ?? []
                    }
                    onCreate={() =>
                      setIsHistoryOpen(
                        false,
                      )
                    }
                    onView={
                      setSelectedSale
                    }
                    onCancel={
                      setSaleToCancel
                    }
                  />

                  <Pagination
                    page={
                      salesQuery.data
                        ?.page ??
                      filters.page
                    }
                    totalPages={
                      salesQuery.data
                        ?.totalPages ??
                      1
                    }
                    totalItems={
                      salesQuery.data
                        ?.totalItems ??
                      0
                    }
                    pageSize={
                      salesQuery.data
                        ?.pageSize ??
                      filters.pageSize
                    }
                    onPageChange={(
                      page,
                    ) =>
                      setFilters(
                        (
                          current,
                        ) => ({
                          ...current,
                          page,
                        }),
                      )
                    }
                  />
                </>
              )}
            </div>
          </section>
        </div>
      )}

      <ConfirmDialog
        isOpen={
          saleToCancel !== null
        }
        title="Cancelar venda"
        description={
          saleToCancel
            ? `A venda “${saleToCancel.number}” será cancelada e os produtos retornarão ao estoque.`
            : ""
        }
        confirmLabel={
          cancelSaleMutation.isPending
            ? "Cancelando..."
            : "Cancelar venda"
        }
        variant="danger"
        onCancel={() => {
          if (
            !cancelSaleMutation.isPending
          ) {
            setSaleToCancel(null);
          }
        }}
        onConfirm={
          handleConfirmCancel
        }
      />

      {selectedSale && (
        <div
          className={
            styles.detailsOverlay
          }
          onMouseDown={() =>
            setSelectedSale(
              null,
            )
          }
        >
          <div
            className={
              styles.detailsModal
            }
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  Detalhes da venda
                </span>

                <h3>
                  {
                    selectedSale.number
                  }
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSale(
                    null,
                  )
                }
              >
                Fechar
              </button>
            </header>

            <div
              className={
                styles.detailsContent
              }
            >
              {selectedSale.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className={
                      styles.detailItem
                    }
                  >
                    <div>
                      <strong>
                        {
                          item.productName
                        }
                      </strong>

                      <span>
                        {item.quantity}{" "}
                        {item.unit} ×{" "}
                        {formatCurrency(
                          item.unitPrice,
                        )}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        item.total,
                      )}
                    </strong>
                  </div>
                ),
              )}

              <div
                className={
                  styles.detailTotals
                }
              >
                <span>
                  Subtotal

                  <strong>
                    {formatCurrency(
                      selectedSale.subtotal,
                    )}
                  </strong>
                </span>

                <span>
                  Desconto

                  <strong>
                    {formatCurrency(
                      selectedSale.discount,
                    )}
                  </strong>
                </span>

                <span>
                  Total

                  <strong>
                    {formatCurrency(
                      selectedSale.total,
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}