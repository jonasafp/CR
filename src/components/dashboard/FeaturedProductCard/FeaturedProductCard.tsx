import {
  ArrowUpRight,
  BadgeDollarSign,
  Boxes,
  Package,
  ShoppingBag,
} from "lucide-react";

import SectionCard from "../../common/SectionCard/SectionCard";

import type { Product } from "../../../types/Product";

import { calculateProductFinancialData } from "../../../utils/productCalculations";

import {
  formatCurrency,
  formatPercentage,
  formatStockQuantity,
} from "../../../utils/formatters";

import styles from "./FeaturedProductCard.module.css";

interface FeaturedProductCardProps {
  product: Product;
}

export default function FeaturedProductCard({
  product,
}: FeaturedProductCardProps) {
  const financialData =
    calculateProductFinancialData(product);

  return (
    <SectionCard
      title="Produto em destaque"
      description="Produto com maior volume vendido no período."
      icon={Package}
      badge="Destaque"
      className={styles.card}
    >
      <div className={styles.content}>
        <div className={styles.productHeader}>
          <div className={styles.productImage}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <Package size={38} strokeWidth={1.6} />
            )}
          </div>

          <div className={styles.productInformation}>
            <span className={styles.code}>
              {product.code}
            </span>

            <h4>{product.name}</h4>

            <p>{product.category}</p>
          </div>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricIcon}>
              <Boxes size={17} />
            </span>

            <div>
              <small>Estoque atual</small>

              <strong>
                {formatStockQuantity(
                  product.stockQuantity,
                  product.stockUnit,
                )}
              </strong>
            </div>
          </div>

          <div className={styles.metric}>
            <span className={styles.metricIcon}>
              <ShoppingBag size={17} />
            </span>

            <div>
              <small>Quantidade vendida</small>

              <strong>
                {formatStockQuantity(
                  product.soldQuantity,
                  product.stockUnit,
                )}
              </strong>
            </div>
          </div>

          <div className={styles.metric}>
            <span className={styles.metricIcon}>
              <BadgeDollarSign size={17} />
            </span>

            <div>
              <small>Lucro realizado</small>

              <strong>
                {formatCurrency(
                  financialData.realizedProfit,
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className={styles.priceArea}>
          <div>
            <small>Preço de compra</small>

            <span>
              {formatCurrency(product.purchasePrice)}
            </span>
          </div>

          <ArrowUpRight
            size={20}
            className={styles.priceArrow}
          />

          <div>
            <small>Preço de venda</small>

            <strong>
              {formatCurrency(product.salePrice)}
            </strong>
          </div>
        </div>

        <div className={styles.margin}>
          <div className={styles.marginHeader}>
            <span>Margem de lucro</span>

            <strong>
              {formatPercentage(
                financialData.profitMarginPercentage,
              )}
            </strong>
          </div>

          <div className={styles.progressTrack}>
            <div
              className={styles.progressValue}
              style={{
                width: `${Math.min(
                  financialData.profitMarginPercentage,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}