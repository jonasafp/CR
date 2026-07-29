import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  PackageX,
  Plus,
  TriangleAlert,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import StatisticCard from "../../components/common/StatisticCard/StatisticCard";
import TableCard from "../../components/common/TableCard/TableCard";

import InventoryFilters from "../../components/inventory/InventoryFilters/InventoryFilters";
import InventoryMovementModal from "../../components/inventory/InventoryMovementModal/InventoryMovementModal";
import InventoryMovementsTable from "../../components/inventory/InventoryMovementsTable/InventoryMovementsTable";
import InventoryProductsTable from "../../components/inventory/InventoryProductsTable/InventoryProductsTable";

import { initialInventoryMovements } from "../../data/inventoryMock";
import { products as initialProducts } from "../../data/mock";

import type {
  InventoryFiltersState,
  InventoryMovement,
  InventoryMovementFormData,
} from "../../types/Inventory";

import type { Product } from "../../types/Product";

import {
  applyInventoryMovementToProduct,
  calculateStockAfterMovement,
  createInventorySummary,
} from "../../utils/inventoryCalculations";

import {
  formatCurrency,
  formatNumber,
} from "../../utils/formatters";

import {
  isProductAvailable,
  isProductLowStock,
  isProductOutOfStock,
} from "../../utils/productFilters";

import styles from "./Estoque.module.css";

const defaultFilters: InventoryFiltersState = {
  search: "",
  stock: "all",
  movementType: "all",
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function Estoque() {
  const [products, setProducts] =
    useState<Product[]>(initialProducts);

  const [movements, setMovements] =
    useState<InventoryMovement[]>(
      initialInventoryMovements,
    );

  const [filters, setFilters] =
    useState<InventoryFiltersState>({
      ...defaultFilters,
    });

  const [isMovementModalOpen, setIsMovementModalOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const summary = useMemo(
    () =>
      createInventorySummary(
        products,
        movements,
      ),
    [movements, products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      normalizeText(filters.search);

    return products.filter((product) => {
      const searchableContent = normalizeText(
        [
          product.name,
          product.code,
          product.category,
        ].join(" "),
      );

      const matchesSearch =
        !normalizedSearch ||
        searchableContent.includes(
          normalizedSearch,
        );

      let matchesStock = true;

      if (filters.stock === "available") {
        matchesStock =
          isProductAvailable(product);
      }

      if (filters.stock === "low") {
        matchesStock =
          isProductLowStock(product);
      }

      if (filters.stock === "out") {
        matchesStock =
          isProductOutOfStock(product);
      }

      return matchesSearch && matchesStock;
    });
  }, [filters.search, filters.stock, products]);

  const filteredMovements = useMemo(() => {
    const normalizedSearch =
      normalizeText(filters.search);

    return movements.filter((movement) => {
      const searchableContent = normalizeText(
        [
          movement.productName,
          movement.productCode,
          movement.notes ?? "",
        ].join(" "),
      );

      const matchesSearch =
        !normalizedSearch ||
        searchableContent.includes(
          normalizedSearch,
        );

      const matchesType =
        filters.movementType === "all" ||
        movement.type ===
          filters.movementType;

      return matchesSearch && matchesType;
    });
  }, [
    filters.movementType,
    filters.search,
    movements,
  ]);

  function openMovementModal(
    product: Product | null = null,
  ) {
    setSelectedProduct(product);
    setIsMovementModalOpen(true);
  }

  function closeMovementModal() {
    setIsMovementModalOpen(false);
    setSelectedProduct(null);
  }

  function handleCreateMovement(
    data: InventoryMovementFormData,
  ) {
    const product = products.find(
      (item) => item.id === data.productId,
    );

    if (!product) {
      return;
    }

    const previousStock =
      product.stockQuantity;

    const currentStock =
      calculateStockAfterMovement(
        previousStock,
        data.quantity,
        data.type,
      );

    if (currentStock < 0) {
      return;
    }

    const nextId =
      movements.length > 0
        ? Math.max(
            ...movements.map(
              (movement) => movement.id,
            ),
          ) + 1
        : 1;

    const newMovement: InventoryMovement = {
      id: nextId,

      productId: product.id,
      productName: product.name,
      productCode: product.code,

      type: data.type,
      reason: data.reason,

      quantity: data.quantity,
      unit: product.stockUnit,

      previousStock,
      currentStock,

      unitCost: data.unitCost,
      totalValue:
        data.quantity * data.unitCost,

      notes: data.notes,

      createdAt: new Date().toISOString(),
      createdBy: "Administrador",
    };

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === product.id
          ? applyInventoryMovementToProduct(
              currentProduct,
              data,
            )
          : currentProduct,
      ),
    );

    setMovements((currentMovements) => [
      newMovement,
      ...currentMovements,
    ]);

    closeMovementModal();
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>
            Controle operacional
          </span>

          <h2>Estoque</h2>

          <p>
            Acompanhe saldos, valores e todas as
            movimentações dos produtos.
          </p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() =>
            openMovementModal()
          }
        >
          <Plus size={18} />
          Nova movimentação
        </button>
      </div>

      <div className={styles.metricsGrid}>
        <StatisticCard
          title="Produtos disponíveis"
          value={formatNumber(
            summary.availableProducts,
            0,
          )}
          description="Produtos acima do estoque mínimo"
          icon={PackageCheck}
          color="green"
        />

        <StatisticCard
          title="Estoque baixo"
          value={formatNumber(
            summary.lowStockProducts,
            0,
          )}
          description="Produtos que precisam de atenção"
          icon={TriangleAlert}
          color="orange"
        />

        <StatisticCard
          title="Sem estoque"
          value={formatNumber(
            summary.outOfStockProducts,
            0,
          )}
          description="Produtos sem saldo disponível"
          icon={PackageX}
          color="red"
        />

        <StatisticCard
          title="Custo do estoque"
          value={formatCurrency(
            summary.totalStockCost,
          )}
          description="Valor investido nos produtos atuais"
          icon={CircleDollarSign}
          color="purple"
          highlighted
        />

        <StatisticCard
          title="Entradas registradas"
          value={formatNumber(
            summary.totalEntries,
            2,
          )}
          description="Quantidade acumulada de entradas"
          icon={ArrowDownToLine}
          color="blue"
        />

        <StatisticCard
          title="Saídas registradas"
          value={formatNumber(
            summary.totalExits,
            2,
          )}
          description="Quantidade acumulada de saídas"
          icon={ArrowUpFromLine}
          color="orange"
        />
      </div>

      <div className={styles.contentArea}>
        <InventoryFilters
          filters={filters}
          resultCount={
            filteredProducts.length +
            filteredMovements.length
          }
          onChange={setFilters}
          onReset={() =>
            setFilters({
              ...defaultFilters,
            })
          }
        />

        <div className={styles.tables}>
          <TableCard
            title="Posição atual do estoque"
            description="Saldos, custos e rentabilidade potencial de cada produto."
            icon={Boxes}
            badge={`${filteredProducts.length} produtos`}
            noPadding
          >
            <InventoryProductsTable
              products={filteredProducts}
              onCreateMovement={
                openMovementModal
              }
            />
          </TableCard>

          <TableCard
            title="Histórico de movimentações"
            description="Entradas, saídas e ajustes registrados no estoque."
            icon={ArrowRightLeft}
            badge={`${filteredMovements.length} registros`}
            noPadding
          >
            <InventoryMovementsTable
              movements={filteredMovements}
            />
          </TableCard>
        </div>
      </div>

      <InventoryMovementModal
        isOpen={isMovementModalOpen}
        products={products}
        initialProduct={selectedProduct}
        onClose={closeMovementModal}
        onSubmit={handleCreateMovement}
      />
    </section>
  );
}