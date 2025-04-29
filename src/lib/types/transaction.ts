export type Cart = {
  productId: string;
  selectedDiscountId?: string | null;
  quantity: number;
}[];

export interface TransactionData {
  cashierId: string;
  memberId?: string | null;
  selectedMemberDiscountId: string | null;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  discountAmount?: number;
  cashAmount?: number;
  items: TransactionItemData[];
}

export interface TransactionItemData {
  productId: string;
  quantity: number;
  unitId: string;
  cost: number;
  pricePerUnit: number;
  subtotal: number;
  batchId: string;
  discountId?: string | null;
}

export interface ValidatedCartItem {
  productId: string;
  batchId: string;
  unitId: string;
  basicPrice: number;
  buyPrice: number;
  quantity: number;
  discount: {
    id: string;
    value: number;
    type: string;
  } | null;
  discountedPrice: number;
  subtotal: number;
}

export interface ValidationResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaymentValidationResult {
  success: boolean;
  message: string;
  change?: number;
}

export interface TransactionSummary {
  subtotal: number;
  member: {
    id: string;
    name: string | null;
    discount: {
      id: string;
      value: number;
      type: string;
      amount: number;
    } | null;
  } | null;
  finalAmount: number;
}

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
