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
  totalPoints: number;
  isBanned: boolean | null;
  tier?: MemberTier | null;
}

export interface MemberTier {
  id: string;
  name: string;
  minPoints: number;
  color?: string | null;
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

// Member search parameters
export type MemberSearchParams = {
  query?: string;
  page?: number;
  limit?: number;
};

// Reward claim search parameters
export type RewardClaimSearchParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  status?: string;
};

// Paginated response for reward search
export type PaginatedRewardResponse = {
  rewards: RewardWithClaimCount[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Paginated response for member search
export type PaginatedMemberResponse = {
  members: Member[];
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

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Array<{
    code: string;
    expected?: unknown;
    received?: unknown;
    path: (string | number)[];
    message: string;
  }>;
}

// Specific API response types
export type GetRewardsResponse = ApiResponse<PaginatedRewardResponse>;
export type GetRewardResponse = ApiResponse<Reward>;
export type CreateRewardResponse = ApiResponse<Reward>;
export type UpdateRewardResponse = ApiResponse<Reward>;
export type DeleteRewardResponse = ApiResponse<void>;
export type SearchMembersResponse = ApiResponse<PaginatedMemberResponse>;
export type ClaimRewardResponse = ApiResponse<RewardClaim>;
export type GetClaimsResponse = ApiResponse<PaginatedClaimResponse>;
export type UpdateClaimStatusResponse = ApiResponse<RewardClaimWithRelations>;

// Loading states for UI components
export interface LoadingState {
  rewards: boolean;
  search: boolean;
  claim: boolean;
}

// Form state for claim dialog
export interface ClaimDialogState {
  selectedRewardId: string;
  availableRewards: RewardWithClaimCount[];
  searchQuery: string;
  selectedMember: Member | null;
  searchResults: Member[];
  showResults: boolean;
}

// Prisma-like where input types for type safety
export interface RewardWhereInput {
  isActive?: boolean;
  OR?: Array<{
    name?: { contains: string; mode?: 'insensitive' };
    description?: { contains: string; mode?: 'insensitive' };
  }>;
  AND?: Array<
    | {
        OR?: Array<{ expiryDate: null } | { expiryDate: { gte: Date } }>;
      }
    | Record<string, unknown>
  >;
}

export interface RewardClaimWhereInput {
  OR?: Array<{
    member?: { name?: { contains: string; mode?: 'insensitive' } };
    reward?: { name?: { contains: string; mode?: 'insensitive' } };
  }>;
  status?: string;
}
