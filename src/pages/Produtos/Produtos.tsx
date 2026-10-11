import {
  Boxes,
  CircleDollarSign,
  Package,
  PackagePlus,
  Plus,
  Power,
  TriangleAlert,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState/ErrorState";
import LoadingState from "../../components/common/LoadingState/LoadingState";
import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import TableCard from "../../components/common/TableCard/TableCard";

import ProductFilters from "../../components/products/ProductFilters/ProductFilters";
import ProductFormModal from "../../components/products/ProductFormModal/ProductFormModal";
import ProductsTable from "../../components/products/ProductsTable/ProductsTable";

import { useProducts } from "../../hooks/useProducts";
import { useInventory } from "../../hooks/useInventory";
import { useNotifications } from "../../hooks/useNotifications";
import { useSettings, } from "../../hooks/useSettings";

import type {
  Product,
  ProductFormData,
} from "../../types/Product";

import {
  defaultProductFilters,
} from "../../types/ProductFilters";

import type {
  ProductFiltersState,
} from "../../types/ProductFilters";

import {
  formatCurrency,
  formatNumber,
} from "../../utils/formatters";
import { getErrorMessage } from "../../utils/errors";

import {
  filterProducts,
  getProductCategories,
  isProductLowStock,
  isProductOutOfStock,
} from "../../utils/productFilters";

import styles from "./Produtos.module.css";

interface ProductConfirmation {
  type: "delete" | "toggle-status";
  product: Product;
}

export default function Produtos() {
  const notifications = useNotifications();

  const {
  settings,
} = useSettings();

  const {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    isLoading,
    error,
    refreshProducts,
  } = useProducts();

  const [filters, setFilters] =
    useState<ProductFiltersState>({
      ...defaultProductFilters,
    });

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [confirmation, setConfirmation] =
    useState<ProductConfirmation | null>(null);

  const categories = useMemo(
    () => getProductCategories(products),
    [products],
  );

  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [filters, products],
  );

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.status === "active",
      ).length,
    [products],
  );

  const lowStockProducts =
    useMemo(
      () =>
        settings.inventory
          .lowStockAlertsEnabled
          ? products.filter(
            (product) =>
              isProductLowStock(
                product,
              ),
          ).length
          : 0,
      [
        products,

        settings.inventory
          .lowStockAlertsEnabled,
      ],
    );

  const outOfStockProducts = useMemo(
    () =>
      products.filter((product) =>
        isProductOutOfStock(product),
      ).length,
    [products],
  );

  const estimatedStockValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total +
          product.stockQuantity *
          product.purchasePrice,
        0,
      ),
    [products],
  );

  const { movements } = useInventory();

  function openCreateForm() {
    setEditingProduct(null);
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  async function handleSaveProduct(
    data: ProductFormData,
  ) {
    try {
      if (editingProduct) {
        const product = await updateProduct(
          editingProduct.id,
          data,
        );

        notifications.success(
          "Produto atualizado",
          `${product.name} foi atualizado com sucesso.`,
        );
      } else {
        const product = await createProduct(data);

        notifications.success(
          "Produto cadastrado",
          `${product.name} foi cadastrado com sucesso.`,
        );
      }

      closeForm();
    } catch (saveError) {
      notifications.error(
        editingProduct
          ? "Não foi possível atualizar o produto"
          : "Não foi possível cadastrar o produto",
        getErrorMessage(saveError),
      );
    }
  }

  function requestToggleStatus(product: Product) {
    setConfirmation({
      type: "toggle-status",
      product,
    });
  }

  function requestDelete(
    product: Product,
  ) {
    const hasMovements = movements.some(
      (movement) =>
        movement.productId === product.id,
    );

    if (hasMovements) {
      setConfirmation({
        type: "toggle-status",
        product,
      });

      return;
    }

    setConfirmation({
      type: "delete",
      product,
    });
  }

  async function handleConfirmAction() {
    if (!confirmation) {
      return;
    }

    try {
      if (confirmation.type === "delete") {
        await deleteProduct(confirmation.product.id);

        notifications.success(
          "Produto excluído",
          `${confirmation.product.name} foi excluído com sucesso.`,
        );
      }

      if (confirmation.type === "toggle-status") {
        await toggleProductStatus(confirmation.product.id);

        notifications.success(
          "Situação atualizada",
          `${confirmation.product.name} foi atualizado com sucesso.`,
        );
      }

      setConfirmation(null);
    } catch (actionError) {
      notifications.error(
        "Não foi possível alterar o produto",
        getErrorMessage(actionError),
      );
    }
  }

  const confirmationTitle =
    confirmation?.type === "delete"
      ? "Excluir produto"
      : confirmation?.product.status === "active"
        ? "Desativar produto"
        : "Ativar produto";

  const confirmationDescription =
    confirmation?.type === "delete"
      ? `O produto “${confirmation.product.name}” será removido da listagem. Esta operação não poderá ser desfeita nesta simulação.`
      : confirmation
        ? `O produto “${confirmation.product.name}” será ${confirmation.product.status === "active"
          ? "desativado e deixará de estar disponível para novas operações"
          : "ativado novamente para uso no sistema"
        }.`
        : "";

  if (isLoading) {
    return (
      <LoadingState
        title="Carregando produtos"
        description="Buscando o catálogo da empresa no banco de dados."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Não foi possível carregar os produtos"
        description={error}
        onRetry={() => void refreshProducts()}
      />
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            Catálogo comercial
          </span>

          <h2>Produtos</h2>

          <p>
            Cadastre produtos, acompanhe valores e
            controle a disponibilidade do catálogo.
          </p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Novo produto
        </button>
      </div>

      <div className={styles.metricsGrid}>
        <StatisticCard
          title="Produtos cadastrados"
          value={formatNumber(products.length, 0)}
          description="Quantidade total no catálogo"
          icon={Package}
          color="blue"
        />

        <StatisticCard
          title="Produtos ativos"
          value={formatNumber(activeProducts, 0)}
          description="Disponíveis para operações"
          icon={Power}
          color="green"
        />

        {settings.inventory
          .lowStockAlertsEnabled && (
            <StatisticCard
              title="Estoque baixo"
              value={formatNumber(
                lowStockProducts,
                0,
              )}
              description="Produtos próximos do mínimo"
              icon={TriangleAlert}
              color="orange"
            />
          )}

        <StatisticCard
          title="Sem estoque"
          value={formatNumber(
            outOfStockProducts,
            0,
          )}
          description="Produtos sem disponibilidade"
          icon={Boxes}
          color="red"
        />

        <StatisticCard
          title="Valor do estoque"
          value={formatCurrency(
            estimatedStockValue,
          )}
          description="Custo estimado dos itens atuais"
          icon={CircleDollarSign}
          color="purple"
          highlighted
        />
      </div>

      <div className={styles.tableArea}>
        <TableCard
          title="Catálogo de produtos"
          description="Consulte, edite e gerencie os produtos cadastrados."
          icon={PackagePlus}
          badge={`${filteredProducts.length} resultados`}
          noPadding
        >
          <ProductFilters
            filters={filters}
            categories={categories}
            resultCount={filteredProducts.length}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                ...defaultProductFilters,
              })
            }
          />

          <ProductsTable
            products={filteredProducts}
            onEdit={openEditForm}
            onToggleStatus={requestToggleStatus}
            onDelete={requestDelete}
            onCreate={openCreateForm}
          />
        </TableCard>
      </div>

      <ProductFormModal
        isOpen={isFormOpen}
        product={editingProduct}
        categories={categories}
        existingProducts={products}
        defaultStockUnit={
          settings.general
            .principalStockUnit
        }
        defaultMinimumStock={
          settings.inventory
            .defaultMinimumStock
        }
        allowNegativeStock={
          settings.inventory
            .allowNegativeStock
        }
        onClose={closeForm}
        onSubmit={handleSaveProduct}
      />

      <ConfirmDialog
        isOpen={confirmation !== null}
        title={confirmationTitle}
        description={confirmationDescription}
        confirmLabel={
          confirmation?.type === "delete"
            ? "Excluir produto"
            : "Confirmar alteração"
        }
        variant={
          confirmation?.type === "delete"
            ? "danger"
            : "warning"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmation(null)}
      />
    </section>
  );
}
