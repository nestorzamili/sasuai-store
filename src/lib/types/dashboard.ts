/**
 * Dashboard-related types for all dashboard services
 */

// Base date filter type
export interface DateFilter {
  from: string;
  to: string;
}

// Extended date filter with optional properties
export interface ExtendedDateFilter {
  startDate?: string;
  endDate?: string;
  filter?: {
    from?: string;
    to?: string;
  };
}

// Performance metrics types
export interface PerformanceMetric {
  value: number;
  growth: number;
}

export interface PerformanceMetricsData {
  currentPriod: string;
  prevPeriod: string;
  totalSales: PerformanceMetric;
  totalTransaction: PerformanceMetric;
  avgSales: PerformanceMetric;
  totalCost: PerformanceMetric;
  profit: PerformanceMetric;
  profitMargin: PerformanceMetric;
}

export interface PerformanceMetricsResponse {
  success: boolean;
  data: PerformanceMetricsData;
  error?: string;
}

// Sales statistics types
export interface SalesDataItem {
  year: number;
  month: number;
  day: number;
  avg_sales: number | null;
  total_transactions: number;
  total_sales: number | null;
}

export interface GroupedSalesData {
  year: number;
  month: number;
  total_transactions: number;
  total_sales: number;
  avg_sales_per_month: number;
  total_cost: number;
  profit_margin: number;
}

export interface SalesStatisticsResponse {
  success: boolean;
  data?: { [key: string]: GroupedSalesData };
  error?: string;
}

// Payment method types
export interface PaymentMethodCount {
  paymentMethod: string;
  _count: { paymentMethod: number };
}

export interface PaymentMethodData {
  type: string;
  total: number;
}

export interface PaymentMethodResponse {
  success: boolean;
  data?: PaymentMethodData[];
  error?: unknown;
}

// Category types
export interface BatchGroupCount {
  batchId: string;
  _count: { batchId: number };
}

export interface CategoryData {
  categoryName: string;
  transactionCount: number;
}

export interface CategoryResponse {
  success: boolean;
  data?: CategoryData[];
  error?: unknown;
}

// Product dashboard types
export interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId: string | null; // Change from undefined to null to match Prisma
  description: string | null; // Change from undefined to null to match Prisma
  unitId: string;
  cost: number;
  price: number;
  currentStock: number;
  skuCode: string | null; // Add missing field to match Prisma
  barcode: string | null; // Add missing field to match Prisma
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDashboardResponse {
  success: boolean;
  data?: Product[];
  error?: string;
}

// Top selling products types
export interface ProductBatch {
  id: string;
  productId: string;
  batchCode: string;
  initialQuantity: number;
  remainingQuantity: number;
  buyPrice: number;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
}

export interface TopSellingByQuantityItem {
  batchId: string;
  _sum: {
    quantity: number | null;
  };
  batch?: ProductBatch;
}

export interface TopSellingByQuantityResponse {
  success: boolean;
  data?: TopSellingByQuantityItem[];
  error?: string;
}

export interface TopSellingByFrequencyItem {
  id: string;
  name: string;
  categoryId: string;
  brandId: string | null; // Change from undefined to null to match Prisma
  description: string | null; // Change from undefined to null to match Prisma
  unitId: string;
  cost: number;
  price: number;
  currentStock: number;
  skuCode: string | null; // Add missing field to match Prisma
  barcode: string | null; // Add missing field to match Prisma
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  orderFrequency: number;
}

export interface TopSellingByFrequencyResponse {
  success: boolean;
  data?: TopSellingByFrequencyItem[];
  error?: string;
}

// Transaction item types for calculations
export interface TransactionItem {
  cost: number;
  quantity: number;
  createdAt: Date;
}

// Aggregation result types
export interface TransactionAggregateResult {
  _sum: {
    finalAmount: number | null;
  };
  _count: {
    id: number;
  };
  _avg: {
    finalAmount: number | null;
  };
}

export interface TransactionGroupByResult {
  createdAt: Date;
  _avg: { finalAmount: number | null };
  _count: { _all: number };
  _sum: { finalAmount: number | null };
}

// Database query filter types
export interface DatabaseDateFilter {
  createdAt: {
    gte: Date;
    lte: Date;
  };
}

export interface TransactionItemGroupByResult {
  batchId: string;
  _sum: {
    quantity: number | null;
  };
}

export interface TransactionItemFrequencyResult {
  batchId: string;
  _count: {
    transactionId: number;
  };
}

// Service response wrapper
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Product frequency mapping types
export interface ProductFrequencyMap {
  productId: string;
  totalFrequency: number;
  product: Product;
}

// Utility types for date processing
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DateComparison {
  current: DateRange;
  previous: DateRange;
}
