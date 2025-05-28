'use server';

import { revalidatePath } from 'next/cache';
import { RewardService } from '@/lib/services/reward.service';
import { MemberService } from '@/lib/services/member.service';
import { z } from 'zod';
import {
  CreateRewardData,
  UpdateRewardData,
  RewardSearchParams,
  MemberSearchParams,
  RewardClaimSearchParams,
  GetRewardsResponse,
  GetRewardResponse,
  CreateRewardResponse,
  UpdateRewardResponse,
  DeleteRewardResponse,
  SearchMembersResponse,
  ClaimRewardResponse,
  GetClaimsResponse,
  UpdateClaimStatusResponse,
} from '@/lib/types/reward';

// Simplified reward schema - removed unnecessary validations
const rewardSchema = z.object({
  name: z.string().min(1, 'Reward name is required'),
  pointsCost: z.number().min(1, 'Points cost must be at least 1'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  isActive: z.boolean().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  expiryDate: z.date().optional().nullable(),
});

/**
 * Get all rewards with claim count
 */
export async function getAllRewardsWithClaimCount(
  params: RewardSearchParams = {},
): Promise<GetRewardsResponse> {
  try {
    const result = await RewardService.search({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy ?? 'name',
      sortDirection: params.sortDirection ?? 'asc',
      query: params.query ?? '',
      includeInactive: params.includeInactive ?? true,
    });

    return {
      success: true,
      data: {
        rewards: result.rewards,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
    };
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
    return { success: false, error: 'Failed to fetch rewards' };
  }
}

/**
 * Get a reward by ID
 */
export async function getReward(id: string): Promise<GetRewardResponse> {
  try {
    const reward = await RewardService.getById(id);
    if (!reward) return { success: false, error: 'Reward not found' };
    return { success: true, data: reward };
  } catch (error) {
    console.error('Failed to fetch reward:', error);
    return { success: false, error: 'Failed to fetch reward' };
  }
}

/**
 * Create a new reward
 */
export async function createReward(
  data: CreateRewardData,
): Promise<CreateRewardResponse> {
  try {
    // Validate data
    const validatedData = rewardSchema.parse(data);

    // Create reward
    const reward = await RewardService.create({
      name: validatedData.name,
      pointsCost: validatedData.pointsCost,
      stock: validatedData.stock,
      isActive: validatedData.isActive,
      description: validatedData.description || undefined,
      imageUrl: validatedData.imageUrl || undefined,
      expiryDate: validatedData.expiryDate || undefined,
    });

    // Revalidate rewards page
    revalidatePath('/rewards');

    return { success: true, data: reward };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return { success: false, error: 'Failed to create reward' };
  }
}

/**
 * Update a reward
 */
export async function updateReward(
  id: string,
  data: UpdateRewardData,
): Promise<UpdateRewardResponse> {
  try {
    // Validate data - removed expiry date check
    const validatedData = rewardSchema.partial().parse(data);

    // Update reward
    const reward = await RewardService.update(id, validatedData);

    // Revalidate rewards page
    revalidatePath('/rewards');

    return { success: true, data: reward };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return { success: false, error: 'Failed to update reward' };
  }
}

/**
 * Delete a reward
 */
export async function deleteReward(id: string): Promise<DeleteRewardResponse> {
  try {
    // Check if reward has been claimed
    const hasClaims = await RewardService.hasClaims(id);
    if (hasClaims) {
      return {
        success: false,
        error: 'Cannot delete reward that has been claimed',
      };
    }

    // Delete reward
    await RewardService.delete(id);
    revalidatePath('/rewards');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete reward:', error);
    return { success: false, error: 'Failed to delete reward' };
  }
}

/**
 * Claim a reward for a member
 */
export async function claimRewardForMember(
  memberId: string,
  rewardId: string,
): Promise<ClaimRewardResponse> {
  try {
    const claim = await MemberService.claimReward(memberId, rewardId);
    revalidatePath('/rewards');
    return { success: true, data: claim };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to claim reward';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Search members with pagination
 */
export async function searchMembers(
  params: MemberSearchParams,
): Promise<SearchMembersResponse> {
  try {
    const result = await MemberService.search({
      query: params.query ?? '',
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to search members:', error);
    return { success: false, error: 'Failed to search members' };
  }
}

/**
 * Get all reward claims with pagination
 */
export async function getAllRewardClaims(
  params: RewardClaimSearchParams,
): Promise<GetClaimsResponse> {
  try {
    const data = await RewardService.getPaginatedClaims({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy ?? 'claimDate',
      sortDirection: params.sortDirection ?? 'desc',
      search: params.search ?? '',
      status: params.status ?? '',
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch reward claims:', error);
    return { success: false, error: 'Failed to fetch reward claims' };
  }
}

/**
 * Update reward claim status
 */
export async function updateClaimStatus(
  id: string,
  status: string,
): Promise<UpdateClaimStatusResponse> {
  try {
    const claim = await RewardService.updateClaimStatus(id, status);
    revalidatePath('/rewards');
    return { success: true, data: claim };
  } catch (error) {
    console.error('Failed to update claim status:', error);
    return { success: false, error: 'Failed to update claim status' };
  }
}
