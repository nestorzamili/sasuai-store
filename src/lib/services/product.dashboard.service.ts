import prisma from '@/lib/prisma';
import { dateToCompare } from '../date';
import { format } from 'date-fns';
import {
  ProductDashboardResponse,
  TopSellingByQuantityResponse,
  TopSellingByFrequencyResponse,
  ExtendedDateFilter,
  ProductFrequencyMap,
} from '@/lib/types/dashboard';

export class ProductDashboardService {
  static async getProductDashboard(
    filter: ExtendedDateFilter,
  ): Promise<ProductDashboardResponse> {
    try {
      const { startDate, endDate } = filter;

      // Add null checks and provide fallback values
      if (!startDate || !endDate) {
        return {
          success: false,
          error: 'Start date and end date are required',
        };
      }

      const data = await prisma.product.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching product dashboard:', error);
      return {
        success: false,
        error: 'Failed to fetch product dashboard',
      };
    }
  }

  static async getTopSellingProductsByQuantity(
    dateFilter?: ExtendedDateFilter,
    limit = 10,
  ): Promise<TopSellingByQuantityResponse> {
    try {
      // Default dates if no filter provided
      const defaultStart = '2024-09-01';
      const defaultEnd = '2024-09-02';

      // Process dates - either use provided dates or defaults
      const dates =
        dateFilter?.startDate && dateFilter?.endDate
          ? dateToCompare(dateFilter.startDate, dateFilter.endDate)
          : dateToCompare(defaultStart, defaultEnd);

      // Format all dates at once
      const [startDate, endDate] = [
        dates.current.startDate,
        dates.current.endDate,
        dates.previous.startDate,
        dates.previous.endDate,
      ].map((date) => format(date, 'yyyy-MM-dd'));

      const topProducts = await prisma.transactionItem.groupBy({
        by: ['batchId'],
        _sum: {
          quantity: true,
        },
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: limit,
      });

      // Fetch batch details with product information separately
      const batchIds = topProducts.map(
        (item: { batchId: string }) => item.batchId,
      );
      const batchDetails = await prisma.productBatch.findMany({
        where: {
          id: {
            in: batchIds,
          },
        },
        include: {
          product: true,
        },
      });

      // Merge the data
      const result = topProducts.map((product) => {
        const batchInfo = batchDetails.find(
          (batch) => batch.id === product.batchId,
        );
        return {
          ...product,
          batch: batchInfo,
        };
      });
      return {
        data: result,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching top selling products by quantity:', error);
      return {
        success: false,
        error: 'Failed to fetch top selling products by quantity',
      };
    }
  }

  static async getTopSellingProductsByFrequency(
    filter: { startDate: string; endDate: string },
    limit = 10,
  ): Promise<TopSellingByFrequencyResponse> {
    try {
      const { startDate, endDate } = filter;

      // Add null checks
      if (!startDate || !endDate) {
        return {
          success: false,
          error: 'Start date and end date are required',
        };
      }

      const topProducts = await prisma.transactionItem.groupBy({
        by: ['batchId'],
        _count: {
          transactionId: true,
        },
        where: {
          transaction: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        },
        orderBy: {
          _count: {
            transactionId: 'desc',
          },
        },
        take: limit,
      });

      // Get batch details to find the productId
      const batchIds = topProducts.map((item) => item.batchId);
      const batches = await prisma.productBatch.findMany({
        where: {
          id: {
            in: batchIds,
          },
        },
        include: {
          product: true,
        },
      });

      // Map the batches to their products and sum frequencies
      const productFrequencies = new Map<string, ProductFrequencyMap>();
      for (const batch of batches) {
        const topProduct = topProducts.find((p) => p.batchId === batch.id);
        if (topProduct && topProduct._count.transactionId) {
          const productId = batch.productId;
          const frequency = topProduct._count.transactionId;

          const existingEntry = productFrequencies.get(productId);
          if (existingEntry) {
            productFrequencies.set(productId, {
              productId,
              totalFrequency: existingEntry.totalFrequency + frequency,
              product: batch.product,
            });
          } else {
            productFrequencies.set(productId, {
              productId,
              totalFrequency: frequency,
              product: batch.product,
            });
          }
        }
      }

      // Convert map to array and sort by frequency
      const result = Array.from(productFrequencies.values())
        .sort((a, b) => b.totalFrequency - a.totalFrequency)
        .slice(0, limit)
        .map((item) => ({
          ...item.product,
          orderFrequency: item.totalFrequency,
        }));

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching top selling products by frequency:', error);
      return {
        success: false,
        error: 'Failed to fetch top selling products by frequency',
      };
    }
  }
}
