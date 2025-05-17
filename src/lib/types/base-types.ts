/**
 * Base types for the application
 * These replace Prisma's auto-generated types with our own definitions
 */

// Product batch base type
export interface ProductBatch {
  id: string;
  productId: string;
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  remainingQuantity: number;
  buyPrice: number;
  unitId: string;
  supplierId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Product base type
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  skuCode?: string | null;
  barcode?: string | null;
  unitId: string;
  categoryId?: string | null;
  sellPrice: number;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Stock in record base type
export interface StockIn {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  supplierId?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Stock out record base type
export interface StockOut {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  reason?: string | null;
  transactionId?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction item base type
export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  batchId: string;
  unitId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Unit base type
export interface Unit {
  id: string;
  name: string;
  symbol: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier base type
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Category base type
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Brand base type
export interface Brand {
  id: string;
  name: string;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
