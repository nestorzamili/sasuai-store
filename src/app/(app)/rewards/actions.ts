'use server';

import { revalidatePath } from 'next/cache';
import { RewardService } from '@/lib/services/reward.service';
import { MemberService } from '@/lib/services/member.service';
import { z } from 'zod';

// Update reward schema for validation
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
export async function getAllRewardsWithClaimCount() {
  try {
    const rewards = await RewardService.getAllWithClaimCount();

    return {
      success: true,
      data: rewards,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch rewards',
    };
  }
}

/**
 * Get all rewards
 */
export async function getAllRewards(includeInactive: boolean = false) {
  try {
    const rewards = await RewardService.getAll(includeInactive);

    return {
      success: true,
      data: rewards,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch rewards',
    };
  }
}

/**
 * Get a reward by ID
 */
export async function getReward(id: string) {
  try {
    const reward = await RewardService.getById(id);

    if (!reward) {
      return {
        success: false,
        error: 'Reward not found',
      };
    }

    return {
      success: true,
      data: reward,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch reward',
    };
  }
}

/**
 * Create a new reward
 */
export async function createReward(data: {
  name: string;
  pointsCost: number;
  stock: number;
  isActive?: boolean;
  description?: string | null;
  imageUrl?: string | null;
  expiryDate?: Date | null;
}) {
  try {
    // Validate data
    const validatedData = rewardSchema.parse(data);

    // Check if expiry date is in the past
    if (validatedData.expiryDate && validatedData.expiryDate < new Date()) {
      return {
        success: false,
        error: 'Expiry date cannot be in the past',
      };
    }

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

    return {
      success: true,
      data: reward,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to create reward',
    };
  }
}

/**
 * Update a reward
 */
export async function updateReward(
  id: string,
  data: {
    name?: string;
    pointsCost?: number;
    stock?: number;
    isActive?: boolean;
    description?: string | null;
    imageUrl?: string | null;
    expiryDate?: Date | null;
  },
) {
  try {
    // Validate data
    const validatedData = rewardSchema.partial().parse(data);

    // Update reward
    const reward = await RewardService.update(id, {
      name: validatedData.name,
      pointsCost: validatedData.pointsCost,
      stock: validatedData.stock,
      isActive: validatedData.isActive,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl,
      expiryDate: validatedData.expiryDate,
    });

    // Revalidate rewards page
    revalidatePath('/rewards');

    return {
      success: true,
      data: reward,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to update reward',
    };
  }
}

/**
 * Delete a reward
 */
export async function deleteReward(id: string) {
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

    // Revalidate rewards page
    revalidatePath('/rewards');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete reward',
    };
  }
}

/**
 * Get reward claims
 */
export async function getRewardClaims(rewardId: string) {
  try {
    const claims = await RewardService.getClaims(rewardId);

    return {
      success: true,
      data: claims,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch reward claims',
    };
  }
}

/**
 * Claim a reward for a member
 */
export async function claimReward(memberId: string, rewardId: string) {
  try {
    const result = await MemberService.claimReward(memberId, rewardId);

    // Revalidate paths
    revalidatePath('/rewards');
    revalidatePath(`/members/${memberId}`);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to claim reward',
    };
  }
}

/**
 * Get all reward claims with pagination
 */
export async function getAllRewardClaims({
  page = 1,
  limit = 10,
  sortBy = 'claimDate',
  sortDirection = 'desc',
  search = '',
  status = '',
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  status?: string;
}) {
  try {
    const data = await RewardService.getPaginatedClaims({
      page,
      limit,
      sortBy,
      sortDirection,
      search,
      status,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch reward claims',
    };
  }
}

/**
 * Update reward claim status
 */
export async function updateClaimStatus(id: string, status: string) {
  try {
    const claim = await RewardService.updateClaimStatus(id, status);

    // Revalidate rewards page
    revalidatePath('/rewards');

    return {
      success: true,
      data: claim,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update claim status',
    };
  }
}

/**
 * Search members with pagination
 */
export async function searchMembers({
  query = '',
  page = 1,
  limit = 10,
  sortBy = 'name',
  sortDirection = 'asc',
}: {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  try {
    const result = await MemberService.search({
      query,
      page,
      limit,
      sortBy,
      sortDirection,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error searching members:', error);
    return {
      success: false,
      error: 'Failed to search members',
    };
  }
}

/**
 * Claim a reward for a member
 */
export async function claimRewardForMember(memberId: string, rewardId: string) {
  try {
    const claim = await MemberService.claimReward(memberId, rewardId);

    // Revalidate paths
    revalidatePath('/rewards');

    return {
      success: true,
      data: claim,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to claim reward',
    };
  }
}

/**
 * Get rewards available for a member to claim
 */
export async function getMemberAvailableRewards(memberId: string) {
  try {
    if (!memberId) {
      return {
        success: false,
        error: 'Member ID is required',
      };
    }

    // Get available rewards for the member from MemberService
    const availableRewards = await MemberService.getAvailableRewards(memberId);

    return {
      success: true,
      data: availableRewards,
    };
  } catch (error: any) {
    console.error('Error getting available rewards:', error);
    return {
      success: false,
      error: error.message || 'Failed to get available rewards for member',
    };
  }
}
