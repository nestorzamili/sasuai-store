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
  TopMemberResponse,
  TopDiscountResponse,
} from '@/lib/types/dashboard';

export class DashboardService {
  static async getPerformanceMetrics(
    dateFilter?: DateFilter
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
            dateFilter.to || defaultEnd
          )
        : dateToCompare(defaultStart, defaultEnd);
    // Format all dates at once
    const [startDate, endDate, prevStartDate, prevEndDate] = [
      dates.current.startDate,
      dates.current.endDate,
      dates.previous.startDate,
      dates.previous.endDate,
    ].map((date) => format(date, 'yyyy-MM-dd'));

    // Convert to local timezone dates for accurate database queries
    const localStartDate = new Date(startDate + 'T00:00:00+07:00'); // WIB timezone
    const localEndDate = new Date(endDate + 'T23:59:59+07:00'); // WIB timezone
    const localPrevStartDate = new Date(prevStartDate + 'T00:00:00+07:00');
    const localPrevEndDate = new Date(prevEndDate + 'T23:59:59+07:00');

    console.log('Dashboard service date filter:', {
      startDate,
      endDate,
      localStartDate: localStartDate.toISOString(),
      localEndDate: localEndDate.toISOString(),
    });

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
              gte: localStartDate,
              lte: localEndDate,
            },
          },
        }),
        prisma.transaction.aggregate({
          _count: {
            id: true,
          },
          where: {
            createdAt: {
              gte: localStartDate,
              lte: localEndDate,
            },
          },
        }),
        prisma.transaction.aggregate({
          _avg: {
            finalAmount: true,
          },
          where: {
            createdAt: {
              gte: localStartDate,
              lte: localEndDate,
            },
          },
        }),
        prisma.transactionItem.findMany({
          where: {
            createdAt: {
              gte: localStartDate,
              lte: localEndDate,
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
                gte: localPrevStartDate,
                lte: localPrevEndDate,
              },
            },
          }),
          prisma.transaction.aggregate({
            _count: {
              id: true,
            },
            where: {
              createdAt: {
                gte: localPrevStartDate,
                lte: localPrevEndDate,
              },
            },
          }),
          prisma.transaction.aggregate({
            _avg: {
              finalAmount: true,
            },
            where: {
              createdAt: {
                gte: localPrevStartDate,
                lte: localPrevEndDate,
              },
            },
          }),
          prisma.transactionItem.findMany({
            where: {
              createdAt: {
                gte: localPrevStartDate,
                lte: localPrevEndDate,
              },
            },
          }),
        ]);

      // Calculate total costs
      const currentTotalCost = currentItems.reduce(
        (acc: number, item: { cost: number }) => acc + item.cost,
        0
      );
      const prevTotalCost = prevItems.reduce(
        (acc: number, item: { cost: number }) => acc + item.cost,
        0
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
      const currentProfitMargin = currentProfit;
      const prevProfitMargin = prevProfit;
      // Calculate growth rates
      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
      };

      const salesGrowth = calculateGrowth(
        currentTotalSalesValue,
        prevTotalSalesValue
      );
      const transactionsGrowth = calculateGrowth(
        currentTransactions,
        prevTransactions
      );
      const avgSalesGrowth = calculateGrowth(
        currentAvgSalesValue,
        prevAvgSalesValue
      );
      const costGrowth = calculateGrowth(currentTotalCost, prevTotalCost);
      const profitGrowth = calculateGrowth(currentProfit, prevProfit);
      const profitMarginGrowth = calculateGrowth(
        currentProfitMargin,
        prevProfitMargin
      );

      // Format date range for display
      const currentDateRange = `${format(
        new Date(startDate),
        'MMM d, yyyy'
      )} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
      const prevDateRange = `${format(
        new Date(startDate),
        'MMM d, yyyy'
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
        'MMM d, yyyy'
      )} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
      const prevDateRange = `${format(
        new Date(startDate),
        'MMM d, yyyy'
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
    year: string
  ): Promise<SalesStatisticsResponse> {
    // Current period
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Convert to local timezone dates for accurate database queries
    const localStartDate = new Date(startDate + 'T00:00:00+07:00'); // WIB timezone
    const localEndDate = new Date(endDate + 'T23:59:59+07:00'); // WIB timezone

    try {
      // Fetch transactions
      const transactions = await prisma.transaction.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: localStartDate,
            lte: localEndDate,
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
            gte: localStartDate,
            lte: localEndDate,
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
        }
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
        }
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
        {}
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
    dateFilter: ExtendedDateFilter
  ): Promise<PaymentMethodResponse> {
    // Default dates if no filter provided
    const defaultStart = '2024-09-01';
    const defaultEnd = '2024-09-02';
    // Process dates - either use provided dates or defaults
    const dates =
      dateFilter?.filter?.from || dateFilter?.filter?.to
        ? dateToCompare(
            dateFilter.filter.from || defaultStart,
            dateFilter.filter.to || defaultEnd
          )
        : dateToCompare(defaultStart, defaultEnd);

    // Format all dates at once
    const [startDate, endDate] = [
      dates.current.startDate,
      dates.current.endDate,
      dates.previous.startDate,
      dates.previous.endDate,
    ].map((date) => format(date, 'yyyy-MM-dd'));

    // Convert to local timezone dates for accurate database queries
    const localStartDate = new Date(startDate + 'T00:00:00+07:00'); // WIB timezone
    const localEndDate = new Date(endDate + 'T23:59:59+07:00'); // WIB timezone

    try {
      const paymentMethods = await prisma.transaction
        .groupBy({
          by: ['paymentMethod'],
          _count: {
            paymentMethod: true,
          },
          where: {
            createdAt: {
              gte: localStartDate,
              lte: localEndDate,
            },
          },
        })
        .then((results: PaymentMethodCount[]) =>
          results.map((item) => ({
            type: item.paymentMethod,
            total: item._count.paymentMethod,
          }))
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
    dateFilter: ExtendedDateFilter
  ): Promise<CategoryResponse> {
    // Default dates if no filter provided
    const defaultStart = '2024-09-01';
    const defaultEnd = '2024-09-02';
    // Process dates - either use provided dates or defaults
    const dates =
      dateFilter?.filter?.from || dateFilter?.filter?.to
        ? dateToCompare(
            dateFilter.filter.from || defaultStart,
            dateFilter.filter.to || defaultEnd
          )
        : dateToCompare(defaultStart, defaultEnd);

    // Format all dates at once
    const [startDate, endDate] = [
      dates.current.startDate,
      dates.current.endDate,
      dates.previous.startDate,
      dates.previous.endDate,
    ].map((date) => format(date, 'yyyy-MM-dd'));

    // Convert to local timezone dates for accurate database queries
    const localStartDate = new Date(startDate + 'T00:00:00+07:00'); // WIB timezone
    const localEndDate = new Date(endDate + 'T23:59:59+07:00'); // WIB timezone

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
            gte: localStartDate,
            lte: localEndDate,
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
        })
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
  static async getTopMembers(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dateFilter: ExtendedDateFilter // This parameter will be used in future implementations
  ): Promise<TopMemberResponse> {
    try {
      // Implementation based on the provided SQL query:
      // SELECT
      //   m.id,
      //   m.name,
      //   m.total_points_earned as total_point,
      //   m.total_points as current_points,
      //   (SELECT "createdAt" FROM transaction t WHERE t.member_id = m.id ORDER BY "createdAt" DESC LIMIT 1) as last_transaction_date
      // FROM member m
      // ORDER BY m.total_points_earned DESC
      // LIMIT 5;

      // Get top members by total points earned
      const topMembers = await prisma.member.findMany({
        take: 5,
        orderBy: {
          totalPointsEarned: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          totalPointsEarned: true,
          totalPoints: true, // Adding current points
          joinDate: true,
          tier: {
            select: {
              name: true,
            },
          },
        },
      });

      // For each member, get their last transaction date
      const membersWithLastTransaction = await Promise.all(
        topMembers.map(async (member) => {
          // Get the last transaction for this member
          const lastTransaction = await prisma.transaction.findFirst({
            where: {
              memberId: member.id,
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              createdAt: true,
            },
          });

          return {
            ...member,
            lastTransactionDate: lastTransaction?.createdAt || null,
          };
        })
      );

      return {
        success: true,
        data: membersWithLastTransaction,
      };
    } catch (error) {
      console.error('Error getting top members:', error);
      return {
        success: false,
        error: error,
      };
    }
  }
  static async getTopDiscounts(
    dateFilter: ExtendedDateFilter,
    limit = 5
  ): Promise<TopDiscountResponse> {
    // Default dates if no filter provided
    const defaultStart = '2024-09-01';
    const defaultEnd = '2024-09-02';

    // Process dates - either use provided dates or defaults
    const dates =
      dateFilter?.filter?.from || dateFilter?.filter?.to
        ? dateToCompare(
            dateFilter.filter.from || defaultStart,
            dateFilter.filter.to || defaultEnd
          )
        : dateToCompare(defaultStart, defaultEnd);

    // Format all dates at once
    const [startDate, endDate] = [
      dates.current.startDate,
      dates.current.endDate,
    ].map((date) => format(date, 'yyyy-MM-dd'));

    // Convert to local timezone dates for accurate database queries
    const localStartDate = new Date(startDate + 'T00:00:00+07:00'); // WIB timezone
    const localEndDate = new Date(endDate + 'T23:59:59+07:00'); // WIB timezone

    try {
      // First get discounts used in transactions in the given period
      const transactionDiscounts = await prisma.transaction.groupBy({
        by: ['discountId'],
        _count: {
          id: true, // Count of transactions
        },
        _sum: {
          discountAmount: true, // Total discount amount
        },
        where: {
          discountId: {
            not: null,
          },
          createdAt: {
            gte: localStartDate,
            lte: localEndDate,
          },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      // Get discounts used in transaction items in the given period
      const transactionItemDiscounts = await prisma.transactionItem.groupBy({
        by: ['discountId'],
        _count: {
          id: true, // Count of transaction items
        },
        _sum: {
          discountAmount: true, // Total discount amount
        },
        where: {
          discountId: {
            not: null,
          },
          createdAt: {
            gte: localStartDate,
            lte: localEndDate,
          },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      // Create a map to combine discount usage counts
      const discountMap = new Map();

      // Process transaction discounts
      for (const item of transactionDiscounts) {
        if (item.discountId) {
          discountMap.set(item.discountId, {
            id: item.discountId,
            transactionCount: item._count.id,
            totalRevenueImpact: item._sum.discountAmount || 0,
            itemCount: 0,
            itemRevenueImpact: 0,
          });
        }
      }

      // Process transaction item discounts
      for (const item of transactionItemDiscounts) {
        if (item.discountId) {
          const existing = discountMap.get(item.discountId);
          if (existing) {
            existing.itemCount = item._count.id;
            existing.itemRevenueImpact = item._sum.discountAmount || 0;
          } else {
            discountMap.set(item.discountId, {
              id: item.discountId,
              transactionCount: 0,
              totalRevenueImpact: 0,
              itemCount: item._count.id,
              itemRevenueImpact: item._sum.discountAmount || 0,
            });
          }
        }
      }

      // Get all discount IDs to fetch full discount information
      const discountIds = Array.from(discountMap.keys());

      if (discountIds.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Fetch full discount details
      const discounts = await prisma.discount.findMany({
        where: {
          id: {
            in: discountIds,
          },
        },
      }); // Combine all data
      const topDiscounts = discounts
        .map((discount) => {
          const usageData = discountMap.get(discount.id);
          // Calculate total revenue impact from transaction and item discounts
          const totalRevenue =
            (usageData?.totalRevenueImpact || 0) +
            (usageData?.itemRevenueImpact || 0);

          // Calculate percentage if maxUses is set
          const usagePercent = discount.maxUses
            ? Math.min(
                100,
                Math.round((discount.usedCount / discount.maxUses) * 100)
              )
            : null;

          return {
            id: discount.id,
            name: discount.name,
            code: discount.code,
            type: discount.type,
            value: discount.value,
            startDate: discount.startDate,
            endDate: discount.endDate,
            isActive: discount.isActive,
            transactionCount: usageData?.transactionCount || 0,
            totalRevenueImpact: totalRevenue,
            usageCount: discount.usedCount,
            usagePercent: usagePercent,
            maxUses: discount.maxUses,
          };
        })
        .sort((a, b) => b.transactionCount - a.transactionCount)
        .slice(0, limit);

      return {
        success: true,
        data: topDiscounts,
      };
    } catch (error) {
      console.error('Error getting top discounts:', error);
      return {
        success: false,
        error: error,
      };
    }
  }
}
