import type {
  Product,
  ProductBatch,
  Unit,
  Discount,
  MemberTier,
  Transaction,
  DiscountType,
} from '@prisma/client';

// ============================================================================
// CORE TYPES
// ============================================================================

export type ProductWithRelations = Product & {
  batches: ProductBatch[];
  unit: Unit;
  discounts: Discount[];
};

export type PrismaTransactionContext = Parameters<
  Parameters<typeof import('@/lib/prisma').default.$transaction>[0]
>[0];

// ============================================================================
// CART & INPUT TYPES
// ============================================================================

export interface CartItem {
  productId: string;
  selectedDiscountId?: string | null;
  quantity: number;
}

export type Cart = CartItem[];

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

// ============================================================================
// VALIDATION TYPES
// ============================================================================
export interface BaseValidationResult {
  success: boolean;
  message: string;
}

export interface ValidationResult<T> extends BaseValidationResult {
  data?: T;
}

export interface PaymentValidationResult extends BaseValidationResult {
  change?: number;
}

export type MemberBanCheckResult = BaseValidationResult;

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

// ============================================================================
// BUSINESS DOMAIN TYPES
// ============================================================================

export interface MemberInfoForValidation {
  id: string;
  name: string;
  tierId: string | null;
  tierName: string | null;
}

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

export interface DiscountInfo {
  id: string;
  value: number;
  type: DiscountType;
  amount: number;
}

export interface GlobalDiscountInfo extends DiscountInfo {
  code: string;
}

export interface MemberDiscountInfo {
  id: string;
  name: string;
  discount: DiscountInfo | null;
}

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

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TransactionListData {
  transactions: ProcessedTransaction[];
  pagination: PaginationMeta;
}

// === TRANSACTION DETAIL RESPONSE TYPES ===
export interface TransactionCashier {
  id: string;
  name: string | null;
  email: string;
}

export interface TransactionMember {
  id: string;
  name: string;
  tier: string | null;
  pointsEarned: number;
}

export interface TransactionDiscount {
  type: string;
  name: string;
  valueType: string;
  value: number;
  amount: number;
}

export interface TransactionPricing {
  originalAmount: number;
  discounts: {
    // Transaction-level discount properties (if any discount is applied)
    id?: string;
    type?: string;
    name?: string;
    code?: string;
    valueType?: string;
    value?: number;
    amount?: number;
    isGlobal?: boolean;
    applyTo?: string | null;
    // Total discount amount across all sources
    total: number;
  };
  finalAmount: number;
}

export interface TransactionPayment {
  method: string;
  amount: number | null;
  change: number | null;
}

export interface TransactionProduct {
  name: string;
  brand: string | null;
  category: string;
  price: number;
  unit: string;
}

export interface TransactionItemDiscount {
  id: string;
  name: string;
  type: string;
  value: number;
  amount: number;
  discountedAmount: number;
}

export interface TransactionItem {
  id: string;
  product: TransactionProduct;
  quantity: number;
  originalAmount: number;
  discountApplied?: TransactionItemDiscount | null;
}

export interface TransactionDetails {
  id: string;
  tranId: string | null;
  createdAt: Date;
  cashier: TransactionCashier;
  member?: TransactionMember | null;
  pricing: TransactionPricing;
  payment: TransactionPayment;
  items: TransactionItem[];
  pointsEarned: number;
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

// ============================================================================
// QUERY & FILTER TYPES
// ============================================================================

export interface TransactionQueryParams {
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
