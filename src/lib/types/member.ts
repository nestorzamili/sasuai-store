/**
 * Base types for member-related entities
 */

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
 * Member tier model
 */
export interface MemberTier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
  createdAt?: Date;
  updatedAt?: Date;
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
  joinDate?: Date;
  cardId?: string;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form values for member tiers
 */
export interface MemberTierFormValues {
  name: string;
  minPoints: number;
  multiplier: number;
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
  email?: string;
  phone?: string;
  tierId?: string;
};

// Type for member update
export type UpdateMemberData = {
  name?: string;
  email?: string;
  phone?: string;
  tierId?: string;
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

// Paginated response for member search
export type PaginatedMemberResponse = {
  members: MemberWithTier[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Member tier data types
export type CreateMemberTierData = {
  name: string;
  minPoints: number;
  multiplier: number;
};

export type UpdateMemberTierData = {
  name?: string;
  minPoints?: number;
  multiplier?: number;
};

// Member point history item
export type MemberPointHistoryItem = MemberPoint;

// Reward claim history item
export type RewardClaimHistoryItem = RewardClaim;
