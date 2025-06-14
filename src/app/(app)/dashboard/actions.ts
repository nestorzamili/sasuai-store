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
  TopMemberResponse,
  LowStockProductResponse,
  TopDiscountResponse,
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
  filter: ExtendedDateFilter
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

export async function getTopMembers(filter: ExtendedDateFilter): Promise<{
  data?: TopMemberResponse['data'];
  success: boolean;
  error?: string;
}> {
  try {
    console.log('Action - getTopMembers with filter:', JSON.stringify(filter));
    const response = await DashboardService.getTopMembers(filter);
    console.log(
      'Action - getTopMembers result:',
      response.success,
      response.data?.length || 0
    );
    return {
      data: response.data,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching top members:', error);
    return {
      success: false,
      error: 'Failed to fetch top members' + error,
    };
  }
}

export async function getLowStockProducts(threshold = 10): Promise<{
  data?: LowStockProductResponse['data'];
  totalCount?: number;
  success: boolean;
  error?: string;
}> {
  try {
    const response =
      await ProductDashboardService.getLowStockProducts(threshold);
    return {
      data: response.data,
      totalCount: response.totalCount,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return {
      success: false,
      error: 'Failed to fetch low stock products' + error,
    };
  }
}

export async function getTopDiscounts(filter: ExtendedDateFilter): Promise<{
  data?: TopDiscountResponse['data'];
  success: boolean;
  error?: string;
}> {
  try {
    const response = await DashboardService.getTopDiscounts(filter);
    return {
      data: response.data,
      success: response.success,
    };
  } catch (error) {
    console.error('Error fetching top discounts:', error);
    return {
      success: false,
      error: 'Failed to fetch top discounts' + error,
    };
  }
}
