import {
  Member,
  ProductBatch,
  Transaction,
  TransactionItem,
  Unit,
  User,
  MemberPoint,
} from '@prisma/client';
import { ProductWithRelations } from './product';

// Basic transaction type with relationships
export type TransactionWithRelations = Transaction & {
  cashier: User;
  member: Member | null;
  items: (TransactionItem & {
    batch: ProductBatch & {
      product: {
        name: string;
        // Other product fields
      };
      batchCode: string;
    };
    unit: Unit;
  })[];
  memberPoints?: MemberPoint[];
};

export type TransactionItemWithRelations = TransactionItem & {
  batch: ProductBatch & {
    product: ProductWithRelations;
  };
  unit: Unit;
};

// Full transaction type with all relations for detailed view
export type TransactionWithItems = Transaction & {
  cashier: User;
  member: Member | null;
  items: TransactionItemWithRelations[]; // Using the enhanced item type that includes batch and unit
  memberPoints?: MemberPoint[];
};

// Simple transaction for list views
export type TransactionListItem = {
  id: string;
  cashierName: string;
  memberName: string | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  itemCount: number;
  createdAt: Date;
};

// Type for transaction creation
export type CreateTransactionData = {
  cashierId: string;
  memberId?: string | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  items: {
    batchId: string;
    quantity: number;
    unitId: string;
    pricePerUnit: number;
    discountId?: string | null;
    subtotal: number;
  }[];
};

// Type for transaction item creation
export type CreateTransactionItemData = {
  transactionId: string;
  batchId: string;
  quantity: number;
  unitId: string;
  pricePerUnit: number;
  discountId?: string | null;
  subtotal: number;
};

// Search params for transaction search
export type TransactionSearchParams = {
  query?: string;
  cashierId?: string;
  memberId?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
};

// Pagination params for server-side pagination
export type TransactionPaginationParams = {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  cashierId?: string;
  memberId?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
};

// Server response for paginated transactions
export type PaginatedTransactionResponse = {
  transactions: TransactionListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Type for transaction summary statistics
export type TransactionSummary = {
  totalTransactions: number;
  totalRevenue: number;
  averageTransactionValue: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
};
