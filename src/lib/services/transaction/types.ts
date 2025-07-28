import type {
  Product,
  ProductBatch,
  Unit,
  Discount,
  MemberTier,
  Transaction,
  DiscountType,
} from '@prisma/client';

// === PRISMA EXTENDED TYPES ===
export type ProductWithRelations = Product & {
  batches: ProductBatch[];
  unit: Unit;
  discounts: Discount[];
};

// === PRISMA TRANSACTION CONTEXT ===
export type PrismaTransactionContext = Parameters<
  Parameters<typeof import('@/lib/prisma').default.$transaction>[0]
>[0];

// === CART TYPES ===
export interface CartItem {
  productId: string;
  selectedDiscountId?: string | null;
  quantity: number;
}

export type Cart = CartItem[];

// === VALIDATION TYPES ===
export interface ValidationResult<T> {
  success: boolean;
  message: string;
  data?: T;
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
    valueType: DiscountType;
  } | null;
  discountedPrice: number;
  subtotal: number;
}

export interface AppliedDiscount {
  id: string;
  value: number;
  type: DiscountType;
}

// === MEMBER & DISCOUNT INFO TYPES ===
export interface MemberInfoForValidation {
  id: string;
  name: string;
  tierId: string | null;
  tierName: string | null;
}

export interface MemberDiscountInfo {
  id: string;
  name: string;
  discount: DiscountInfo | null;
}

export interface DiscountInfo {
  id: string;
  value: number;
  type: DiscountType;
  amount: number;
}

export interface GlobalDiscountInfo extends DiscountInfo {
  code: string;
}

export interface MemberBanCheckResult {
  success: boolean;
  message: string;
}

// === TRANSACTION SUMMARY ===
export interface TransactionSummary {
  subtotal: number;
  member: {
    id: string;
    name: string;
    tierId?: string | null;
    tierName?: string | null;
    discount: DiscountInfo | null;
  } | null;
  globalDiscount: GlobalDiscountInfo | null;
  discountSource: 'member' | 'tier' | 'global' | null;
  finalAmount: number;
}

// === PAYMENT TYPES ===
export interface PaymentValidationResult {
  success: boolean;
  message: string;
  change?: number;
}

// === TRANSACTION DATA TYPES ===
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

export interface PreparedTransactionItem {
  productId: string;
  batchId: string;
  unitId: string;
  cost: number;
  quantity: number;
  discountId: string | null;
  discountValue: number | null;
  discountValueType: DiscountType | null;
  basicPrice: number;
  subtotal: number;
}

// === EXECUTION RESULT ===
export interface TransactionExecutionResult {
  success: boolean;
  data?: Transaction;
  finalAmount?: number;
  cashAmount?: number;
  change?: number;
  information?: {
    member?: string;
    inventory?: string;
  };
  message?: string;
}

// === MEMBER RECORD FOR POINTS CALCULATION ===
export interface MemberRecord {
  id: string;
  name: string;
  tierId: string | null;
  totalPoints: number;
  totalPointsEarned: number;
  isBanned: boolean | null;
  banReason: string | null;
  tier: MemberTier | null;
}

// === PAGINATION TYPES ===
export interface TransactionPaginationParams {
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
}

export interface TransactionWhereInput {
  OR?: Array<{
    tranId?: { contains: string; mode: 'insensitive' };
    id?: { contains: string; mode: 'insensitive' };
    member?: { name: { contains: string; mode: 'insensitive' } };
    cashier?: { name: { contains: string; mode: 'insensitive' } };
  }>;
  cashierId?: string;
  memberId?: string;
  paymentMethod?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  finalAmount?: {
    gte?: number;
    lte?: number;
  };
}

export interface TransactionPaginationResult {
  transactions: ProcessedTransaction[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface ProcessedTransaction {
  id: string;
  tranId: string | null;
  cashier: { id: string; name: string | null };
  member: { id: string; name: string } | null;
  pricing: {
    originalAmount: number;
    memberDiscount: number;
    productDiscounts: number;
    totalDiscount: number;
    finalAmount: number;
  };
  payment: {
    method: string;
    amount: number | null;
    change: number | null;
  };
  itemCount: number;
  pointsEarned: number;
  createdAt: Date;
}
