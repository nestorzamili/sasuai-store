'use server';
import { DashboardService } from '@/lib/services/dashboard.service';
import { ProductDashboardService } from '@/lib/services/product.dashboard.services';
export async function metricPeformance(filter?: any) {
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
export async function salesStatistics(year: string) {
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
export async function getTopSellingProductsByQuantity(filter: any) {
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
export async function getTopPaymentMethod(filter: any) {
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
