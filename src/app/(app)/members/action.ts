'use server';

import { revalidatePath } from 'next/cache';
import { MemberService } from '@/lib/services/member.service';
import { z } from 'zod';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// Member schema for validation
const memberSchema = z.object({
  name: z.string().min(1, 'Member name is required'),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  tierId: z.string().optional().nullable(),
});

// Member tier schema for validation
const memberTierSchema = z.object({
  name: z.string().min(1, 'Tier name is required'),
  minPoints: z
    .number()
    .int()
    .min(0, 'Minimum points must be a non-negative integer'),
  multiplier: z.number().min(0.1, 'Multiplier must be at least 0.1'),
});

/**
 * Get a member by ID with full details
 */
export async function getMember(id: string) {
  try {
    const member = await MemberService.getById(id);

    if (!member) {
      return {
        success: false,
        error: 'Member not found',
      };
    }

    return {
      success: true,
      data: member,
    };
  } catch (error) {
    console.error('Error fetching member:', error);
    return {
      success: false,
      error: 'Failed to fetch member',
    };
  }
}

/**
 * Create a new member
 */
export async function createMember(data: {
  name: string;
  email?: string | null;
  cardId: string | null;
  address?: string | null; // Fixed spelling from "addres" to "address"
  phone?: string | null;
  tierId?: string | null;
}) {
  try {
    // Validate data
    const validatedData = memberSchema.parse(data);

    // Create member
    const member = await MemberService.create({
      name: validatedData.name,
      email: validatedData.email || undefined,
      cardId: data.cardId || '', // Use data.cardId since it's not in the schema
      address: data.address || undefined, // Use data.address since it's not in the schema
      phone: validatedData.phone || undefined,
      tierId: validatedData.tierId || undefined,
    });

    // Revalidate members page
    revalidatePath('/members');

    return {
      success: true,
      data: member,
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
      error: 'Failed to create member',
    };
  }
}

/**
 * Update a member
 */
export async function updateMember(
  id: string,
  data: {
    name?: string;
    email?: string | null;
    cardId?: string | null;
    address?: string | null;
    phone?: string | null;
    tierId?: string | null;
  },
) {
  try {
    // Validate data
    const validatedData = memberSchema.partial().parse(data);

    // Convert null values to undefined to match the service's expected types
    const serviceData = {
      name: validatedData.name,
      email: validatedData.email === null ? undefined : validatedData.email,
      cardId: data.cardId === null ? undefined : data.cardId,
      address: data.address === null ? undefined : data.address,
      phone: validatedData.phone === null ? undefined : validatedData.phone,
      tierId: validatedData.tierId === null ? undefined : validatedData.tierId,
    };

    // Update member
    const member = await MemberService.update(id, serviceData);

    // Revalidate member paths
    revalidatePath('/members');
    revalidatePath(`/members/${id}`);

    return {
      success: true,
      data: member,
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
      error: 'Failed to update member',
    };
  }
}

/**
 * Delete a member
 */
export async function deleteMember(id: string) {
  try {
    await MemberService.delete(id);

    // Revalidate members page
    revalidatePath('/members');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting member:', error);
    return {
      success: false,
      error: 'Failed to delete member',
    };
  }
}

/**
 * Ban a member
 */
export async function banMember(id: string, reason: string) {
  try {
    await MemberService.ban(id, reason);

    // Revalidate member paths
    revalidatePath('/members');
    revalidatePath(`/members/${id}`);

    return {
      success: true,
      message: 'Member has been banned successfully',
    };
  } catch (error) {
    console.error('Error banning member:', error);
    return {
      success: false,
      error: 'Failed to ban member',
    };
  }
}

/**
 * Unban a member
 */
export async function unbanMember(id: string) {
  try {
    await MemberService.unban(id);

    // Revalidate member paths
    revalidatePath('/members');
    revalidatePath(`/members/${id}`);

    return {
      success: true,
      message: 'Member has been unbanned successfully',
    };
  } catch (error) {
    console.error('Error unbanning member:', error);
    return {
      success: false,
      error: 'Failed to unban member',
    };
  }
}

/**
 * Search members with pagination
 */
export async function searchMembers({
  query = '',
  tier = '',
  page = 1,
  limit = 10,
  sortBy = 'name',
  sortDirection = 'asc',
  isBanned,
}: {
  query?: string;
  tier?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isBanned?: boolean;
}) {
  try {
    const result = await MemberService.search({
      query,
      tier,
      page,
      limit,
      sortBy,
      sortDirection,
      isBanned,
    });

    return {
      success: true,
      members: result.members,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
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
 * Get point history for a member
 */
export async function getMemberPointHistory(memberId: string) {
  try {
    const history = await MemberService.getPointHistory(memberId);

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error('Error fetching point history:', error);
    return {
      success: false,
      error: 'Failed to fetch point history',
    };
  }
}

/**
 * Award points to a member manually
 */
export async function awardPointsToMember(
  memberId: string,
  points: number,
  notes?: string,
) {
  try {
    if (points <= 0) {
      return {
        success: false,
        error: 'Points must be a positive number',
      };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id || 'system';

    const manualTransactionId = `manual-${Date.now()}`;

    const pointNotes = notes || `Manual point award of ${points} points`;

    const result = await MemberService.awardPoints(
      memberId,
      manualTransactionId,
      points,
      pointNotes,
      userId,
    );

    // Revalidate member paths
    revalidatePath('/members');
    revalidatePath(`/members/${memberId}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to award points',
    };
  }
}

/**
 * Get reward claim history for a member
 */
export async function getMemberRewardClaimHistory(memberId: string) {
  try {
    const claims = await MemberService.getRewardClaimHistory(memberId);

    return {
      success: true,
      data: claims,
    };
  } catch (error) {
    console.error('Error fetching reward claim history:', error);
    return {
      success: false,
      error: 'Failed to fetch reward claim history',
    };
  }
}

/**
 * Calculate potential points for a transaction
 */
export async function calculatePotentialPoints(
  memberId: string,
  transactionAmount: number,
) {
  try {
    const points = await MemberService.calculatePotentialPoints(
      memberId,
      transactionAmount,
    );

    return {
      success: true,
      data: points,
    };
  } catch (error) {
    console.error('Error calculating potential points:', error);
    return {
      success: false,
      error: 'Failed to calculate potential points',
    };
  }
}

// ==========================================
// MEMBER TIER ACTIONS
// ==========================================

/**
 * Get all member tiers
 */
export async function getAllMemberTiers() {
  try {
    const tiers = await MemberService.getAllTiers();

    return {
      success: true,
      data: tiers,
    };
  } catch (error) {
    console.error('Error fetching member tiers:', error);
    return {
      success: false,
      error: 'Failed to fetch member tiers',
    };
  }
}

/**
 * Create a new member tier
 */
export async function createMemberTier(data: {
  name: string;
  minPoints: number;
  multiplier: number;
}) {
  try {
    // Validate data
    const validatedData = memberTierSchema.parse(data);

    // Create tier
    const tier = await MemberService.createTier({
      name: validatedData.name,
      minPoints: validatedData.minPoints,
      multiplier: validatedData.multiplier,
    });

    // Revalidate member tiers page
    revalidatePath('/members/tiers');

    return {
      success: true,
      data: tier,
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
      error: 'Failed to create member tier',
    };
  }
}

/**
 * Update a member tier
 */
export async function updateMemberTier(
  id: string,
  data: {
    name?: string;
    minPoints?: number;
    multiplier?: number;
  },
) {
  try {
    // Validate data
    const validatedData = memberTierSchema.partial().parse(data);

    // Update tier
    const tier = await MemberService.updateTier(id, {
      name: validatedData.name,
      minPoints: validatedData.minPoints,
      multiplier: validatedData.multiplier,
    });

    // Revalidate member tiers page
    revalidatePath('/members/tiers');

    return {
      success: true,
      data: tier,
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
      error: 'Failed to update member tier',
    };
  }
}

/**
 * Delete a member tier
 */
export async function deleteMemberTier(id: string) {
  try {
    await MemberService.deleteTier(id);

    // Revalidate member tiers page
    revalidatePath('/members/tiers');

    return {
      success: true,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete member tier';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
