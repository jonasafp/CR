import { dashboardData } from "./mock";

import type {
  CategoryPerformanceItem,
  DashboardData,
  DashboardPeriod,
  DashboardVariations,
  SalesPerformancePoint,
  TopSellingProduct,
} from "../types/Dashboard";

interface PeriodConfiguration {
  soldMultiplier: number;
  revenueMultiplier: number;
  costMultiplier: number;

  variations: DashboardVariations;

  salesPerformance: SalesPerformancePoint[];
  categoryPerformance: CategoryPerformanceItem[];
}

const periodConfigurations: Record<
  DashboardPeriod,
  PeriodConfiguration
> = {
  today: {
    soldMultiplier: 0.035,
    revenueMultiplier: 0.04,
    costMultiplier: 0.039,

    variations: {
      stock: 0.8,
      soldQuantity: 4.6,
      revenue: 5.2,
      profit: 6.1,
      margin: 0.9,
      stockAlerts: -1.2,
    },

    salesPerformance: [
      {
        label: "08h",
        revenue: 180,
        cost: 102,
        profit: 78,
      },
      {
        label: "10h",
        revenue: 360,
        cost: 218,
        profit: 142,
      },
      {
        label: "12h",
        revenue: 590,
        cost: 346,
        profit: 244,
      },
      {
        label: "14h",
        revenue: 420,
        cost: 253,
        profit: 167,
      },
      {
        label: "16h",
        revenue: 710,
        cost: 416,
        profit: 294,
      },
      {
        label: "18h",
        revenue: 860,
        cost: 502,
        profit: 358,
      },
    ],

    categoryPerformance: [
      {
        category: "Cães",
        revenue: 1320,
        profit: 518,
        percentage: 42,
      },
      {
        category: "Gatos",
        revenue: 845,
        profit: 348,
        percentage: 27,
      },
      {
        category: "Aves",
        revenue: 445,
        profit: 183,
        percentage: 14,
      },
      {
        category: "Acessórios",
        revenue: 535,
        profit: 241,
        percentage: 17,
      },
    ],
  },

  week: {
    soldMultiplier: 0.22,
    revenueMultiplier: 0.24,
    costMultiplier: 0.23,

    variations: {
      stock: 2.4,
      soldQuantity: 8.7,
      revenue: 9.4,
      profit: 11.3,
      margin: 1.4,
      stockAlerts: -2.1,
    },

    salesPerformance: [
      {
        label: "Seg",
        revenue: 2350,
        cost: 1390,
        profit: 960,
      },
      {
        label: "Ter",
        revenue: 2780,
        cost: 1640,
        profit: 1140,
      },
      {
        label: "Qua",
        revenue: 2490,
        cost: 1475,
        profit: 1015,
      },
      {
        label: "Qui",
        revenue: 3180,
        cost: 1860,
        profit: 1320,
      },
      {
        label: "Sex",
        revenue: 3950,
        cost: 2290,
        profit: 1660,
      },
      {
        label: "Sáb",
        revenue: 4480,
        cost: 2570,
        profit: 1910,
      },
      {
        label: "Dom",
        revenue: 1820,
        cost: 1080,
        profit: 740,
      },
    ],

    categoryPerformance: [
      {
        category: "Cães",
        revenue: 8850,
        profit: 3480,
        percentage: 40,
      },
      {
        category: "Gatos",
        revenue: 5520,
        profit: 2290,
        percentage: 25,
      },
      {
        category: "Aves",
        revenue: 3310,
        profit: 1360,
        percentage: 15,
      },
      {
        category: "Acessórios",
        revenue: 4420,
        profit: 1940,
        percentage: 20,
      },
    ],
  },

  month: {
    soldMultiplier: 1,
    revenueMultiplier: 1,
    costMultiplier: 1,

    variations: {
      stock: 5.8,
      soldQuantity: 12.4,
      revenue: 8.7,
      profit: 10.2,
      margin: 1.6,
      stockAlerts: -2.3,
    },

    salesPerformance: [
      {
        label: "Sem. 1",
        revenue: 16800,
        cost: 9850,
        profit: 6950,
      },
      {
        label: "Sem. 2",
        revenue: 18400,
        cost: 10680,
        profit: 7720,
      },
      {
        label: "Sem. 3",
        revenue: 17650,
        cost: 10290,
        profit: 7360,
      },
      {
        label: "Sem. 4",
        revenue: 21300,
        cost: 12250,
        profit: 9050,
      },
    ],

    categoryPerformance: [
      {
        category: "Cães",
        revenue: 30200,
        profit: 12150,
        percentage: 41,
      },
      {
        category: "Gatos",
        revenue: 19100,
        profit: 7890,
        percentage: 26,
      },
      {
        category: "Aves",
        revenue: 10300,
        profit: 4210,
        percentage: 14,
      },
      {
        category: "Acessórios",
        revenue: 14000,
        profit: 6220,
        percentage: 19,
      },
    ],
  },

  year: {
    soldMultiplier: 10.7,
    revenueMultiplier: 11.3,
    costMultiplier: 10.9,

    variations: {
      stock: 18.5,
      soldQuantity: 24.8,
      revenue: 27.2,
      profit: 31.6,
      margin: 3.8,
      stockAlerts: -14.2,
    },

    salesPerformance: [
      {
        label: "Jan",
        revenue: 58400,
        cost: 34200,
        profit: 24200,
      },
      {
        label: "Fev",
        revenue: 62200,
        cost: 36100,
        profit: 26100,
      },
      {
        label: "Mar",
        revenue: 68800,
        cost: 39700,
        profit: 29100,
      },
      {
        label: "Abr",
        revenue: 65100,
        cost: 37800,
        profit: 27300,
      },
      {
        label: "Mai",
        revenue: 72400,
        cost: 41600,
        profit: 30800,
      },
      {
        label: "Jun",
        revenue: 76900,
        cost: 44100,
        profit: 32800,
      },
      {
        label: "Jul",
        revenue: 80500,
        cost: 45900,
        profit: 34600,
      },
      {
        label: "Ago",
        revenue: 83700,
        cost: 47600,
        profit: 36100,
      },
      {
        label: "Set",
        revenue: 79400,
        cost: 45200,
        profit: 34200,
      },
      {
        label: "Out",
        revenue: 88900,
        cost: 50100,
        profit: 38800,
      },
      {
        label: "Nov",
        revenue: 94600,
        cost: 52800,
        profit: 41800,
      },
      {
        label: "Dez",
        revenue: 106300,
        cost: 58800,
        profit: 47500,
      },
    ],

    categoryPerformance: [
      {
        category: "Cães",
        revenue: 377000,
        profit: 154000,
        percentage: 42,
      },
      {
        category: "Gatos",
        revenue: 224500,
        profit: 93500,
        percentage: 25,
      },
      {
        category: "Aves",
        revenue: 134700,
        profit: 55200,
        percentage: 15,
      },
      {
        category: "Acessórios",
        revenue: 161600,
        profit: 72400,
        percentage: 18,
      },
    ],
  },
};

function roundValue(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function scaleTopSellingProducts(
  multiplier: number,
): TopSellingProduct[] {
  return dashboardData.topSellingProducts.map(
    (product) => ({
      ...product,

      quantitySold: roundValue(
        product.quantitySold * multiplier,
      ),

      revenue: roundValue(
        product.revenue * multiplier,
      ),

      profit: roundValue(
        product.profit * multiplier,
      ),
    }),
  );
}

export function getDashboardDataByPeriod(
  period: DashboardPeriod,
): DashboardData {
  const configuration = periodConfigurations[period];

  const realizedRevenue = roundValue(
    dashboardData.summary.realizedRevenue *
      configuration.revenueMultiplier,
  );

  const realizedCost = roundValue(
    dashboardData.summary.realizedCost *
      configuration.costMultiplier,
  );

  const realizedProfit = roundValue(
    realizedRevenue - realizedCost,
  );

  const averageProfitMargin =
    realizedRevenue > 0
      ? roundValue(
          (realizedProfit / realizedRevenue) * 100,
        )
      : 0;

  const totalSoldQuantity = roundValue(
    dashboardData.summary.totalSoldQuantity *
      configuration.soldMultiplier,
  );

  return {
    ...dashboardData,

    summary: {
      ...dashboardData.summary,

      totalSoldQuantity,

      realizedRevenue,
      realizedCost,
      realizedProfit,
      averageProfitMargin,
    },

    financialSummary: {
      revenue: realizedRevenue,
      cost: realizedCost,
      profit: realizedProfit,
      profitMargin: averageProfitMargin,
    },

    topSellingProducts: scaleTopSellingProducts(
      configuration.soldMultiplier,
    ),

    salesPerformance: configuration.salesPerformance,
    categoryPerformance:
      configuration.categoryPerformance,

    variations: configuration.variations,
  };
}