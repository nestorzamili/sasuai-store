'use server';
import { DashboardService } from '@/lib/services/dashboard.service';
export async function metricPeformance() {
  try {
    const response = await DashboardService.getPerformanceMetrics();

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
