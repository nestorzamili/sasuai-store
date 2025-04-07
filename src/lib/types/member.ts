import {
  Member,
  MemberTier,
  MemberPoint,
  RewardClaim,
  Reward,
  Transaction,
} from '@prisma/client';

// Member with basic tier information
export type MemberWithTier = Member & {
  tier: MemberTier | null;
};

// Detailed member information with all relations
export type MemberWithRelations = Member & {
  tier: MemberTier | null;
  memberPoints: (MemberPoint & {
    transaction: Transaction;
  })[];
  rewardClaims: (RewardClaim & {
    reward: Reward;
  })[];
  transactions: Transaction[];
  // totalPointsEarned is already part of the Member model
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
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
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
export type MemberPointHistoryItem = MemberPoint & {
  transaction: Transaction;
  notes: string | null; // Change from string | undefined to string | null
};

// Reward claim history item
export type RewardClaimHistoryItem = RewardClaim & {
  reward: Reward;
};
