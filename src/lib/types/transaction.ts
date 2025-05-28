// === EXTERNAL TYPE RE-EXPORTS ===
import type { DateRange as ReactDateRange } from 'react-day-picker';
export type DateRange = ReactDateRange;

// === ENUMS ===
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

// === CORE BUSINESS TYPES ===
export type Cart = {
  productId: string;
  selectedDiscountId?: string | null;
  quantity: number;
}[];

// === API REQUEST/RESPONSE TYPES ===
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

export interface TransactionCreateData {
  tranId: string;
  cashierId: string;
  memberId: string | null;
  discountId: string | null;
  discountAmount: number | null;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentAmount: number;
  change: number;
  items: {
    create: TransactionItemCreateData[];
  };
}

export interface TransactionItemCreateData {
  batchId: string;
  quantity: number;
  unitId: string;
  cost: number;
  pricePerUnit: number;
  discountId: string | null;
  discountAmount: number | null;
  subtotal: number;
}

export interface MemberPointCreateData {
  memberId: string;
  transactionId: string;
  pointsEarned: number;
  dateEarned: Date;
  notes: string;
}

// === DATABASE ENTITY TYPES ===
export interface TransactionRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  finalAmount: number;
  change: number | null;
  tranId: string | null;
  cashierId: string;
  memberId: string | null;
  totalAmount: number;
  paymentMethod: string;
  discountId: string | null;
  discountAmount: number | null;
  paymentAmount: number | null;
}

export interface TransactionDetailRecord extends TransactionRecord {
  cashier: {
    id: string;
    name: string;
    email: string;
  };
  member: MemberWithRelations | null;
  items: TransactionItemRecord[];
  memberPoints: MemberPointRecord[];
  discount: DiscountRecord | null;
}

export interface TransactionItemRecord {
  id: string;
  pricePerUnit: number;
  quantity: number;
  discountAmount: number | null;
  discountId: string | null;
  batch: {
    product: {
      name: string;
      brand: { name: string } | null;
      category: { name: string };
      unit: { symbol: string };
      discounts: DiscountRecord[];
    };
  };
  unit: { symbol: string };
  discount: DiscountRecord | null;
}

export interface MemberRecord {
  id: string;
  name: string;
  tierId: string | null;
  totalPoints: number;
  totalPointsEarned: number;
  isBanned: boolean | null;
  banReason: string | null;
  tier?: MemberTierRecord | null;
}

export interface MemberWithRelations extends MemberRecord {
  tier: MemberTierRecord | null;
  discounts: DiscountRecord[];
}

export interface MemberTierRecord {
  id: string;
  name: string;
  minPoints: number;
}

export interface DiscountRecord {
  id: string;
  name: string;
  code: string | null;
  type: string;
  value: number;
  isActive: boolean;
  isGlobal: boolean;
  startDate: Date;
  endDate: Date;
  maxUses: number | null;
  usedCount: number;
  minPurchase: number | null;
}

export interface ProductBatchRecord {
  id: string;
  productId: string;
  remainingQuantity: number;
}

export interface MemberPointRecord {
  pointsEarned: number;
}

// === QUERY PARAMETER TYPES ===
export interface TransactionFindParams {
  where: { tranId: { startsWith: string } };
  orderBy: { tranId: 'desc' };
  select: { tranId: true };
}

export interface TransactionFindManyParams {
  where: TransactionWhereInput;
  include: TransactionIncludeInput;
  orderBy:
    | Record<string, 'asc' | 'desc'>
    | Record<string, Record<string, 'asc' | 'desc'>>;
  skip: number;
  take: number;
}

export interface TransactionFindUniqueParams {
  where: { id: string };
  include: TransactionDetailIncludeInput;
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

export interface TransactionIncludeInput {
  cashier: { select: { id: true; name: true } };
  member: { select: { id: true; name: true } };
  items: {
    select: {
      pricePerUnit: true;
      quantity: true;
      discountAmount: true;
      discountId: true;
      discount: true;
    };
  };
  memberPoints: { select: { pointsEarned: true } };
}

export interface TransactionDetailIncludeInput {
  cashier: { select: { id: true; name: true; email: true } };
  member: {
    include: {
      tier: true;
      discounts: true;
    };
  };
  items: {
    include: {
      batch: {
        include: {
          product: {
            include: {
              category: true;
              brand: true;
              unit: true;
              discounts: true;
            };
          };
        };
      };
      unit: true;
      discount: true;
    };
  };
  memberPoints: true;
  discount: true;
}

// === TRANSACTION SUMMARY & VALIDATION TYPES ===
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

export interface PaymentValidationResult {
  success: boolean;
  message: string;
  change?: number;
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

export interface ValidationResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

// === TRANSACTION EXECUTION RESULT ===
export interface TransactionExecutionResult {
  success: boolean;
  data?: TransactionRecord;
  finalAmount?: number;
  cashAmount?: number;
  change?: number;
  information?: {
    member?: string;
    inventory?: string;
  };
  message?: string;
}

// === MEMBER CHECK & DISCOUNT INFO TYPES ===
export interface MemberBanCheckResult {
  success: boolean;
  message: string;
}

export interface MemberDiscountInfo {
  id: string;
  name: string;
  discount: {
    id: string;
    value: number;
    type: DiscountType;
    amount: number;
  } | null;
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

export interface PreparedTransactionItem {
  productId: string;
  batchId: string;
  unitId: string;
  cost: number;
  quantity: number;
  discountId: string | null;
  discountValue: number | null;
  discountValueType: string | null;
  basicPrice: number;
  subtotal: number;
}

// === PAGINATION & FILTERING ===
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

// Processed transaction type for pagination
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

// Pagination result
export interface TransactionPaginationResult {
  transactions: ProcessedTransaction[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface ProcessedTransactionItem {
  id: string;
  product: {
    name: string;
    brand: string | null;
    category: string;
    price: number;
    unit: string;
  };
  quantity: number;
  originalAmount: number;
  discountApplied: {
    id: string;
    name: string;
    type: string;
    value: number;
    amount: number;
    discountedAmount: number;
  } | null;
}

// Transaction detail result
export interface TransactionDetailResult {
  success?: boolean;
  message?: string;
  error?: string;
  transactionDetails?: {
    id: string;
    tranId: string | null;
    cashier: { id: string; name: string | null; email: string };
    member: {
      id: string;
      name: string;
      tier: string | null;
      pointsEarned: number;
    } | null;
    pricing: {
      originalAmount: number;
      discounts: {
        member: {
          type: string;
          name: string;
          valueType: string;
          value: number;
          amount: number;
        } | null;
        products: number;
        total: number;
      };
      finalAmount: number;
    };
    payment: {
      method: string;
      amount: number | null;
      change: number | null;
    };
    items: ProcessedTransactionItem[];
    pointsEarned: number;
    createdAt: Date;
  };
}

// Product with relations for validation
export interface ProductWithRelations {
  id: string;
  name: string;
  price: number;
  currentStock: number;
  isActive: boolean;
  unitId: string;
  batches: ProductBatch[];
  unit: Unit;
  discounts: DiscountRecord[];
}

export interface ProductBatch {
  id: string;
  expiryDate: Date;
  remainingQuantity: number;
  buyPrice: number;
}

export interface Unit {
  symbol: string;
}

// Applied discount for validation
export interface AppliedDiscount {
  id: string;
  value: number;
  type: string;
  amount?: number;
}

// Member info for validation transaction
export interface MemberInfoForValidation {
  id: string;
  name: string;
  tierId: string | null;
  tierName: string | null;
}

// === UI COMPONENT TYPES ===
export interface TransactionTableProps {
  onRefresh?: () => void;
  onSelectionChange?: (selectedRows: TransactionForTable[]) => void;
}

export interface TransactionForTable {
  id: string;
  tranId: string | null;
  createdAt: string;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  cashier: {
    name: string | null;
  };
  member?: {
    name: string;
  } | null;
  itemCount?: number;
  discountAmount?: number;
  paymentAmount?: number | null;
  pointsEarned?: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

// Transaction Detail Dialog types
export interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

export interface TransactionDetailItem {
  id: string;
  product: {
    name: string;
    price: number;
    unit: string;
    category?: string;
  };
  quantity: number;
  originalAmount: number;
  subtotal?: number;
  pricePerUnit?: number;
  discountApplied?: {
    id: string;
    name: string;
    amount: number;
  } | null;
}

export interface TransactionDetail {
  id: string;
  tranId: string | null;
  createdAt: string;
  cashier: {
    name: string | null;
  };
  member?: {
    id: string;
    name: string;
    tier?: string | null;
  } | null;
  pricing: {
    originalAmount: number;
    finalAmount: number;
    discounts: {
      member?: {
        type: string;
        name: string;
        valueType: string;
        value: number;
        amount: number;
      } | null;
      products: number;
      total: number;
    };
  };
  payment: {
    method: string;
    amount: number | null;
    change: number | null; // Remove optional operator, make it required but nullable
    cashAmount?: number | null;
  };
  items: TransactionDetailItem[];
  pointsEarned: number;
}

// PDF Generation types
export interface PDFTransactionItem {
  id: string;
  product: {
    name: string;
    price: number;
    unit: string;
  };
  quantity: number;
  originalAmount: number;
  subtotal?: number;
  discountApplied?: {
    id: string;
    name: string;
    amount: number;
  } | null;
}

export interface PDFTransaction {
  id: string;
  tranId: string | null;
  createdAt: string;
  cashier: {
    name: string | null;
  };
  member?: {
    id: string;
    name: string;
    tier?: string | null;
    points?: number;
  } | null;
  pricing: {
    originalAmount: number;
    finalAmount: number;
    discounts: {
      member?: {
        type: string;
        name: string;
        valueType: string;
        value: number;
        amount: number;
      } | null;
      products: number;
      total: number;
    };
  };
  payment: {
    method: string;
    amount: number | null;
    change: number | null; // Changed from undefined to null to match TransactionDetail
    cashAmount?: number | null;
  };
  paymentMethod?: string;
  amountPaid?: number;
  items: PDFTransactionItem[];
  pointsEarned: number;
}

// Filter Toolbar types
export interface TransactionFilterToolbarProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  minAmount: string;
  setMinAmount: (value: string) => void;
  maxAmount: string;
  setMaxAmount: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
}

// Action response types
export interface GetTransactionsResponse {
  success: boolean;
  data?: ProcessedTransaction[];
  pagination?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  error?: string;
}

export interface GetTransactionByIdResponse {
  success: boolean;
  data?: TransactionDetailApiResponse;
  error?: string;
}

// Add a separate type for the API response
export interface TransactionDetailApiResponse {
  id: string;
  tranId: string | null;
  createdAt: Date;
  cashier: { id: string; name: string | null; email: string };
  member?: {
    id: string;
    name: string;
    tier: string | null;
    pointsEarned: number;
  } | null;
  pricing: {
    originalAmount: number;
    discounts: {
      member?: {
        type: string;
        name: string;
        valueType: string;
        value: number;
        amount: number;
      } | null;
      products: number;
      total: number;
    };
    finalAmount: number;
  };
  payment: {
    method: string;
    amount: number | null;
    change: number | null;
  };
  items: Array<{
    id: string;
    product: {
      name: string;
      brand: string | null;
      category: string;
      price: number;
      unit: string;
    };
    quantity: number;
    originalAmount: number;
    discountApplied?: {
      id: string;
      name: string;
      type: string;
      value: number;
      amount: number;
      discountedAmount: number;
    } | null;
  }>;
  pointsEarned: number;
}
