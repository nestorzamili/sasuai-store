export type Cart = {
  productId: string;
  selectedDiscountId?: string | null;
  quantity: number;
}[];

export interface TransactionData {
  cashierId: string;
  memberId?: string | null;
  selectedMemberDiscountId: string | null;
  selectedTierDiscountId?: string | null;
  globalDiscountCode?: string | null;
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

// Import the actual enum type from Prisma client (recommended solution)
// If importing is not an option, ensure this matches the Prisma enum
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

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
    valueType: DiscountType;
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
    tierId?: string | null;
    tierName?: string | null;
    discount: {
      id: string;
      value: number;
      type: DiscountType;
      amount: number;
    } | null;
  } | null;
  globalDiscount?: {
    id: string;
    code?: string;
    value: number;
    type: DiscountType;
    amount: number;
  } | null;
  discountSource?: 'member' | 'tier' | 'global' | null;
  finalAmount: number;
}

export type TransactionPaginationParams = {
  page: number;
  pageSize: number | undefined;
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
