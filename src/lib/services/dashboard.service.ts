import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { dateToCompare } from '../date';
import {
  DateFilter,
  ExtendedDateFilter,
  PerformanceMetricsResponse,
  SalesStatisticsResponse,
  PaymentMethodResponse,
  CategoryResponse,
  PaymentMethodCount,
  BatchGroupCount,
  SalesDataItem,
  GroupedSalesData,
} from '@/lib/types/dashboard';

export class DashboardService {
  static async getPerformanceMetrics(
    dateFilter?: DateFilter,
  ): Promise<PerformanceMetricsResponse> {
    // Default dates if no filter provided
    const defaultStart = '2024-09-01';
    const defaultEnd = '2024-09-02';
    // console.log('dateFilter', dateFilter);
    // Process dates - either use provided dates or defaults
    const dates =
      dateFilter?.from || dateFilter?.to
        ? dateToCompare(
            dateFilter.from || defaultStart,
            dateFilter.to || defaultEnd,
          )
        : dateToCompare(defaultStart, defaultEnd);
    // Format all dates at once
    const [startDate, endDate, prevStartDate, prevEndDate] = [
      dates.current.startDate,
      dates.current.endDate,
      dates.previous.startDate,
      dates.previous.endDate,
    ].map((date) => format(date, 'yyyy-MM-dd'));

    try {
      // Run current period queries in parallel
      const [
        currentSales,
        currentTransactionsAgg,
        currentAvgSales,
        currentItems,
      ] = await Promise.all([
        prisma.transaction.aggregate({
          _sum: {
            finalAmount: true,
          },
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
        prisma.transaction.aggregate({
          _count: {
            id: true,
          },
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
        prisma.transaction.aggregate({
          _avg: {
            finalAmount: true,
          },
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
        prisma.transactionItem.findMany({
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        }),
      ]);

      // Run previous period queries in parallel
      const [prevSales, prevTransactionsAgg, prevAvgSales, prevItems] =
        await Promise.all([
          prisma.transaction.aggregate({
            _sum: {
              finalAmount: true,
            },
            where: {
              createdAt: {
                gte: new Date(prevStartDate),
                lte: new Date(prevEndDate),
              },
            },
          }),
          prisma.transaction.aggregate({
            _count: {
              id: true,
            },
            where: {
              createdAt: {
                gte: new Date(prevStartDate),
                lte: new Date(prevEndDate),
              },
            },
          }),
          prisma.transaction.aggregate({
            _avg: {
              finalAmount: true,
            },
            where: {
              createdAt: {
                gte: new Date(prevStartDate),
                lte: new Date(prevEndDate),
              },
            },
          }),
          prisma.transactionItem.findMany({
            where: {
              createdAt: {
                gte: new Date(prevStartDate),
                lte: new Date(prevEndDate),
              },
            },
          }),
        ]);

      // Calculate total costs
      const currentTotalCost = currentItems.reduce(
        (acc: number, item: { cost: number }) => acc + item.cost,
        0,
      );
      const prevTotalCost = prevItems.reduce(
        (acc: number, item: { cost: number }) => acc + item.cost,
        0,
      );

      // Extract current values with fallback to 0
      const currentTotalSalesValue = currentSales._sum.finalAmount || 0;
      const currentAvgSalesValue = currentAvgSales._avg.finalAmount || 0;
      const currentTransactions = currentTransactionsAgg._count.id || 0;

      // Extract previous values with fallback to 0
      const prevTotalSalesValue = prevSales._sum.finalAmount || 0;
      const prevAvgSalesValue = prevAvgSales._avg.finalAmount || 0;
      const prevTransactions = prevTransactionsAgg._count.id || 0;

      // Calculate profits
      const currentProfit = currentTotalSalesValue - currentTotalCost;
      const prevProfit = prevTotalSalesValue - prevTotalCost;

      // Calculate profit margin
      const currentProfitMargin =
        currentTotalSalesValue > 0
          ? (currentProfit / currentTotalSalesValue) * 100
          : 0;
      const prevProfitMargin =
        prevTotalSalesValue > 0 ? (prevProfit / prevTotalSalesValue) * 100 : 0;

      // Calculate growth rates
      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      };

      const salesGrowth = calculateGrowth(
        currentTotalSalesValue,
        prevTotalSalesValue,
      );
      const transactionsGrowth = calculateGrowth(
        currentTransactions,
        prevTransactions,
      );
      const avgSalesGrowth = calculateGrowth(
        currentAvgSalesValue,
        prevAvgSalesValue,
      );
      const costGrowth = calculateGrowth(currentTotalCost, prevTotalCost);
      const profitGrowth = calculateGrowth(currentProfit, prevProfit);
      const profitMarginGrowth = calculateGrowth(
        currentProfitMargin,
        prevProfitMargin,
      );

      // Format date range for display
      const currentDateRange = `${format(
        new Date(startDate),
        'MMM d, yyyy',
      )} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
      const prevDateRange = `${format(
        new Date(startDate),
        'MMM d, yyyy',
      )} - ${format(new Date(endDate), 'MMM d, yyyy')}`;

      return {
        success: true,
        data: {
          currentPriod: currentDateRange,
          prevPeriod: prevDateRange,
          totalSales: {
            value: currentTotalSalesValue,
            growth: salesGrowth,
          },
          totalTransaction: {
            value: currentTransactions,
            growth: transactionsGrowth,
          },
          avgSales: {
            value: currentAvgSalesValue,
            growth: avgSalesGrowth,
          },
          totalCost: {
            value: currentTotalCost,
            growth: costGrowth,
          },
          profit: {
            value: currentProfit,
            growth: profitGrowth,
          },
          profitMargin: {
            value: currentProfitMargin,
            growth: profitMarginGrowth,
          },
        },
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      // Format date range for display
      const currentDateRange = `${format(
        new Date(startDate),
        'MMM d, yyyy',
      )} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
      const prevDateRange = `${format(
        new Date(startDate),
        'MMM d, yyyy',
      )} - ${format(new Date(endDate), 'MMM d, yyyy')}`;

      return {
        success: false,
        error: 'Failed to retrieve performance metrics',
        data: {
          currentPriod: currentDateRange,
          prevPeriod: prevDateRange,
          totalSales: { value: 0, growth: 0 },
          totalTransaction: { value: 0, growth: 0 },
          avgSales: { value: 0, growth: 0 },
          totalCost: { value: 0, growth: 0 },
          profit: { value: 0, growth: 0 },
          profitMargin: { value: 0, growth: 0 },
        },
      };
    }
  }
  static async getSalesStatistics(
    year: string,
  ): Promise<SalesStatisticsResponse> {
    // Current period
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    try {
      // Fetch transactions
      const transactions = await prisma.transaction.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        _count: {
          _all: true,
        },
        _sum: {
          finalAmount: true,
        },
        _avg: {
          finalAmount: true,
        },
      });

      // Fetch transaction items for cost calculation
      const transactionItems = await prisma.transactionItem.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        select: {
          cost: true,
          quantity: true,
          createdAt: true,
        },
      });

      // Map transactions to include date information
      const sales: SalesDataItem[] = transactions.map(
        (transaction: {
          createdAt: Date;
          _avg: { finalAmount: number | null };
          _count: { _all: number };
          _sum: { finalAmount: number | null };
        }) => {
          const year = transaction.createdAt.getFullYear();
          const month = transaction.createdAt.getMonth() + 1; // Months are 0-indexed in JavaScript
          const day = transaction.createdAt.getDate();
          return {
            year,
            month,
            day,
            avg_sales: transaction._avg.finalAmount,
            total_transactions: transaction._count._all,
            total_sales: transaction._sum.finalAmount,
          };
        },
      );

      // Group transaction items by year and month for cost calculation
      const costsByMonth: { [key: string]: number } = {};
      transactionItems.forEach(
        (item: { cost: number; quantity: number; createdAt: Date }) => {
          const year = item.createdAt.getFullYear();
          const month = item.createdAt.getMonth() + 1;
          const key = `${year}-${month}`;
          if (!costsByMonth[key]) {
            costsByMonth[key] = 0;
          }
          costsByMonth[key] += item.cost * item.quantity;
        },
      );

      // Remove the generic type parameter from reduce and use proper typing
      const groupedData = sales.reduce(
        (acc: { [key: string]: GroupedSalesData }, curr: SalesDataItem) => {
          const key = `${curr.year}-${curr.month}`;
          if (!acc[key]) {
            acc[key] = {
              year: curr.year,
              month: curr.month,
              total_transactions: 0,
              total_sales: 0,
              avg_sales_per_month: 0,
              total_cost: 0,
              profit_margin: 0,
            };
          }
          acc[key].total_transactions += curr.total_transactions;
          acc[key].total_sales += curr.total_sales || 0;
          acc[key].total_cost = costsByMonth[key] || 0;
          acc[key].profit_margin = acc[key].total_sales - acc[key].total_cost;
          return acc;
        },
        {},
      );

      // Calculate average sales per month after all data is aggregated
      Object.keys(groupedData).forEach((key) => {
        const data = groupedData[key];
        data.avg_sales_per_month =
          data.total_transactions > 0
            ? data.total_sales / data.total_transactions
            : 0;
      });

      return {
        success: true,
        data: groupedData,
      };
    } catch (error) {
      console.error('Error getting sales statistics:', error);
      return {
        success: false,
        error: 'Failed to retrieve sales statistics',
      };
    }
  }
  static async getTopPaymentMethods(
    dateFilter: ExtendedDateFilter,
  ): Promise<PaymentMethodResponse> {
    // Default dates if no filter provided
    const defaultStart = '2024-09-01';
    const defaultEnd = '2024-09-02';
    // Process dates - either use provided dates or defaults
    const dates =
      dateFilter?.filter?.from || dateFilter?.filter?.to
        ? dateToCompare(
            dateFilter.filter.from || defaultStart,
            dateFilter.filter.to || defaultEnd,
          )
        : dateToCompare(defaultStart, defaultEnd);

    // Format all dates at once
    const [startDate, endDate] = [
      dates.current.startDate,
      dates.current.endDate,
      dates.previous.startDate,
      dates.previous.endDate,
    ].map((date) => format(date, 'yyyy-MM-dd'));
    try {
      const paymentMethods = await prisma.transaction
        .groupBy({
          by: ['paymentMethod'],
          _count: {
            paymentMethod: true,
          },
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        })
        .then((results: PaymentMethodCount[]) =>
          results.map((item) => ({
            type: item.paymentMethod,
            total: item._count.paymentMethod,
          })),
        );

      return {
        success: true,
        data: paymentMethods,
      };
    } catch (error) {
      console.error('Error getting top payment methods:', error);
      return {
        success: false,
        error: error,
      };
    }
  }
  static async getTopCategories(
    dateFilter: ExtendedDateFilter,
  ): Promise<CategoryResponse> {
    // Default dates if no filter provided
    const defaultStart = '2024-09-01';
    const defaultEnd = '2024-09-02';
    // Process dates - either use provided dates or defaults
    const dates =
      dateFilter?.filter?.from || dateFilter?.filter?.to
        ? dateToCompare(
            dateFilter.filter.from || defaultStart,
            dateFilter.filter.to || defaultEnd,
          )
        : dateToCompare(defaultStart, defaultEnd);

    // Format all dates at once
    const [startDate, endDate] = [
      dates.current.startDate,
      dates.current.endDate,
      dates.previous.startDate,
      dates.previous.endDate,
    ].map((date) => format(date, 'yyyy-MM-dd'));
    try {
      const topCategories = await prisma.transactionItem.groupBy({
        by: ['batchId'],
        _count: {
          batchId: true,
        },
        orderBy: {
          _count: {
            batchId: 'desc',
          },
        },
        take: 5,
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
      const categoryDetails = await Promise.all(
        topCategories.map(async (group: BatchGroupCount) => {
          const batch = await prisma.productBatch.findUnique({
            where: {
              id: group.batchId,
            },
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          });

          return {
            categoryName: batch?.product.category.name || 'Unknown',
            transactionCount: group._count.batchId,
          };
        }),
      );
      return {
        success: true,
        data: categoryDetails,
      };
    } catch (error) {
      console.error('Error getting top categories:', error);
      return {
        success: false,
        error: error,
      };
    }
  }
}
