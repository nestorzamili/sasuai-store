'use server';
import { DashboardService } from '@/lib/services/dashboard.service';
import { ProductDashboardService } from '@/lib/services/product.dashboard.service';
import {
  DateFilter,
  ExtendedDateFilter,
  PerformanceMetricsResponse,
  SalesStatisticsResponse,
  TopSellingByQuantityResponse,
  PaymentMethodResponse,
  CategoryResponse,
} from '@/lib/types/dashboard';

export async function metricPeformance(filter?: DateFilter): Promise<{
  data?: PerformanceMetricsResponse['data'];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await DashboardService.getPerformanceMetrics(filter);
    return {
      data: response.data,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      success: false,
      error: 'Failed to fetch performance metrics' + error,
    };
  }
}

export async function salesStatistics(year: string): Promise<{
  data?: SalesStatisticsResponse['data'];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await DashboardService.getSalesStatistics(year);

    return {
      data: response.data,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      success: false,
      error: 'Failed to fetch performance metrics' + error,
    };
  }
}

export async function getTopSellingProductsByQuantity(
  filter: ExtendedDateFilter,
): Promise<{
  data?: TopSellingByQuantityResponse['data'];
  success: boolean;
  error?: string;
}> {
  try {
    const response =
      await ProductDashboardService.getTopSellingProductsByQuantity(filter);
    return {
      data: response.data,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    return {
      success: false,
      error: 'Failed to fetch top selling products' + error,
    };
  }
}

export async function getTopPaymentMethod(filter: ExtendedDateFilter): Promise<{
  data?: PaymentMethodResponse['data'];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await DashboardService.getTopPaymentMethods(filter);
    return {
      data: response.data,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    return {
      success: false,
      error: 'Failed to fetch top selling products' + error,
    };
  }
}

export async function getTopCategories(filter: ExtendedDateFilter): Promise<{
  data?: CategoryResponse['data'];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await DashboardService.getTopCategories(filter);
    return {
      data: response.data,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching top categories:', error);
    return {
      success: false,
      error: 'Failed to fetch top categories' + error,
    };
  }
}
