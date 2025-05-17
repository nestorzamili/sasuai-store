// Base types to replace Prisma imports
export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  stock: number;
  isActive: boolean;
  description?: string | null;
  imageUrl?: string | null;
  expiryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardClaim {
  id: string;
  memberId: string;
  rewardId: string;
  claimDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  // Add minimum fields needed for this context
}

// Type for reward creation
export type CreateRewardData = {
  name: string;
  pointsCost: number;
  stock: number;
  isActive?: boolean;
  description?: string;
  imageUrl?: string;
  expiryDate?: Date;
};

// Type for reward update
export type UpdateRewardData = {
  name?: string;
  pointsCost?: number;
  stock?: number;
  isActive?: boolean;
  description?: string | null;
  imageUrl?: string | null;
  expiryDate?: Date | null;
};

// Reward search parameters
export type RewardSearchParams = {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  includeInactive?: boolean;
};

// Paginated response for reward search
export type PaginatedRewardResponse = {
  rewards: Reward[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Reward claim with related data
export type RewardClaimWithRelations = RewardClaim & {
  member: Member;
  reward: Reward;
};

// Paginated response for reward claims
export type PaginatedClaimResponse = {
  claims: RewardClaimWithRelations[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Type for popular rewards
export type PopularReward = Reward & {
  claimCount: number;
};

export type RewardWithClaimCount = Reward & {
  _count?: {
    rewardClaims: number;
  };
};

export type RewardWithClaims = Reward & {
  rewardClaims: RewardClaim[];
};

export type RewardClaimWithMember = RewardClaim & {
  member: Member;
};
