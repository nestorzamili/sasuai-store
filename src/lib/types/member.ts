/**
 * Base types for member-related entities
 */

// Base discount type that matches Prisma schema
export interface BaseDiscount {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  value: number;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  minPurchase: number | null;
  startDate?: Date;
  endDate?: Date | null;
  isActive: boolean;
  applyTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Member discount with mapped field names for internal use
export interface MemberDiscount {
  id: string;
  name: string;
  description?: string | null;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  minPurchase: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Member tier model
 */
export interface MemberTier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
  createdAt?: Date;
  updatedAt?: Date;
  discounts?: MemberDiscount[];
}

/**
 * Transaction model
 */
export interface Transaction {
  id: string;
  tranId?: string | null;
  cashierId: string;
  memberId?: string | null;
  totalAmount: number;
  discountAmount?: number | null;
  finalAmount: number;
  paymentMethod: string;
  discountId?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Member point model
 */
export interface MemberPoint {
  id: string;
  memberId: string;
  transactionId: string;
  pointsEarned: number;
  dateEarned: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  transaction: Transaction;
}

/**
 * Reward model
 */
export interface Reward {
  id: string;
  name: string;
  description?: string | null;
  pointsCost: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reward claim model
 */
export interface RewardClaim {
  id: string;
  memberId: string;
  rewardId: string;
  claimDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  reward: Reward;
}

/**
 * Member model
 */
export interface Member {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  points: number;
  totalPoints?: number;
  totalPointsEarned?: number;
  tierId?: string | null;
  tier?: MemberTier | null;
  isBanned?: boolean;
  banReason?: string | null;
  joinDate?: Date | null;
  cardId?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
  discounts?: MemberDiscount[];
}

// Member with basic tier information
export type MemberWithTier = Member & {
  tier: MemberTier | null;
};

// Detailed member information with all relations
export type MemberWithRelations = Member & {
  tier: MemberTier | null;
  memberPoints: MemberPoint[];
  rewardClaims: RewardClaim[];
  transactions: Transaction[];
};

// Type for member creation
export type CreateMemberData = {
  name: string;
  email?: string | null;
  phone?: string | null;
  tierId?: string | null;
  cardId?: string | null;
  address?: string | null;
};

// Type for member update
export type UpdateMemberData = {
  name?: string;
  email?: string | null;
  phone?: string | null;
  tierId?: string | null;
  cardId?: string | null;
  address?: string | null;
};

// Member search parameters
export type MemberSearchParams = {
  query?: string;
  tier?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isBanned?: boolean;
};

// Point rule settings
export interface PointRuleSettings {
  enabled: boolean;
  baseAmount: number;
  pointMultiplier: number;
}

// Filter options for tables
export interface FilterOption {
  value: string;
  label: string;
}

// Table filter configuration - simplified to match actual usage
export interface TableFilter {
  id: string;
  label: string;
  type: 'select' | 'date' | 'number' | 'boolean';
  options?: FilterOption[];
  handleFilterChange: (value: string) => void;
}

// Action result types
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  validationErrors?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

// Component props interfaces
export interface MemberTableProps {
  onEdit?: (member: MemberWithTier) => void;
  onAwardPoints: (member: MemberWithTier) => void;
}

export interface MemberFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: MemberWithTier;
  tiers: MemberTier[];
  onSuccess?: () => void;
}

export interface TiersContentProps {
  tiers: MemberTier[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export interface TierStyle {
  bg: string;
  border: string;
  accent: string;
}

// Utility function for mapping Prisma discount to internal MemberDiscount
export function mapDiscountToMemberDiscount(
  discount: BaseDiscount,
): MemberDiscount {
  return {
    id: discount.id,
    name: discount.name,
    description: discount.description,
    discountValue: discount.value,
    discountType: discount.type,
    minPurchase: discount.minPurchase || 0,
    isActive: discount.isActive,
    createdAt: discount.createdAt,
    updatedAt: discount.updatedAt,
  };
}

// Type untuk response member dari Prisma/API
export type MemberResponse = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  totalPoints?: number;
  totalPointsEarned?: number;
  tierId?: string | null;
  isBanned?: boolean | null;
  banReason?: string | null;
  joinDate?: Date | null;
  cardId?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
  discounts?: BaseDiscount[];
  tier?: {
    id: string;
    name: string;
    minPoints: number;
    multiplier: number;
    createdAt?: Date;
    updatedAt?: Date;
    discounts?: BaseDiscount[];
  } | null;
  memberPoints?: MemberPoint[];
  rewardClaims?: RewardClaim[];
  transactions?: Transaction[];
};

// Utility function to map any member response to internal MemberWithRelations type
export function mapToMemberWithRelations(
  memberData: MemberResponse,
): MemberWithRelations {
  return {
    id: memberData.id,
    name: memberData.name,
    email: memberData.email,
    phone: memberData.phone,
    points: memberData.totalPoints || 0,
    totalPoints: memberData.totalPoints,
    totalPointsEarned: memberData.totalPointsEarned,
    tierId: memberData.tierId,
    isBanned: memberData.isBanned ?? false,
    banReason: memberData.banReason,
    joinDate: memberData.joinDate,
    cardId: memberData.cardId,
    address: memberData.address,
    createdAt: memberData.createdAt,
    updatedAt: memberData.updatedAt,
    discounts: memberData.discounts?.map(mapDiscountToMemberDiscount) || [],
    tier: memberData.tier
      ? {
          id: memberData.tier.id,
          name: memberData.tier.name,
          minPoints: memberData.tier.minPoints,
          multiplier: memberData.tier.multiplier,
          createdAt: memberData.tier.createdAt,
          updatedAt: memberData.tier.updatedAt,
          discounts:
            memberData.tier.discounts?.map(mapDiscountToMemberDiscount) || [],
        }
      : null,
    memberPoints: memberData.memberPoints || [],
    rewardClaims: memberData.rewardClaims || [],
    transactions: memberData.transactions || [],
  };
}

// Utility function to map any member response to internal MemberWithTier type
export function mapToMemberWithTier(
  memberData: MemberResponse,
): MemberWithTier {
  return {
    id: memberData.id,
    name: memberData.name,
    email: memberData.email,
    phone: memberData.phone,
    points: memberData.totalPoints || 0,
    totalPoints: memberData.totalPoints,
    totalPointsEarned: memberData.totalPointsEarned,
    tierId: memberData.tierId,
    isBanned: memberData.isBanned ?? false,
    banReason: memberData.banReason,
    joinDate: memberData.joinDate,
    cardId: memberData.cardId,
    address: memberData.address,
    createdAt: memberData.createdAt,
    updatedAt: memberData.updatedAt,
    discounts: memberData.discounts?.map(mapDiscountToMemberDiscount) || [],
    tier: memberData.tier
      ? {
          id: memberData.tier.id,
          name: memberData.tier.name,
          minPoints: memberData.tier.minPoints,
          multiplier: memberData.tier.multiplier,
          createdAt: memberData.tier.createdAt,
          updatedAt: memberData.tier.updatedAt,
          discounts:
            memberData.tier.discounts?.map(mapDiscountToMemberDiscount) || [],
        }
      : null,
  };
}

// Re-export commonly used types
export type MemberPointHistoryItem = MemberPoint;
export type RewardClaimHistoryItem = RewardClaim;
export type PaginatedMemberResponse = {
  members: MemberWithTier[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};
