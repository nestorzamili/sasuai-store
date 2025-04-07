import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class RewardService {
  /**
   * Get all rewards
   */
  static async getAll(includeInactive: boolean = false) {
    return prisma.reward.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: {
        pointsCost: 'asc',
      },
    });
  }

  /**
   * Get a reward by ID
   */
  static async getById(id: string) {
    return prisma.reward.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new reward
   */
  static async create(data: {
    name: string;
    pointsCost: number;
    stock: number;
    isActive?: boolean;
  }) {
    return prisma.reward.create({
      data: {
        name: data.name,
        pointsCost: data.pointsCost,
        stock: data.stock,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update a reward
   */
  static async update(
    id: string,
    data: {
      name?: string;
      pointsCost?: number;
      stock?: number;
      isActive?: boolean;
    },
  ) {
    return prisma.reward.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a reward
   */
  static async delete(id: string) {
    // Check if there are any claims for this reward
    const claimsCount = await prisma.rewardClaim.count({
      where: { rewardId: id },
    });

    if (claimsCount > 0) {
      throw new Error(
        `Cannot delete reward: It has been claimed ${claimsCount} times`,
      );
    }

    return prisma.reward.delete({
      where: { id },
    });
  }

  /**
   * Get all rewards with claim count
   */
  static async getAllWithClaimCount() {
    return prisma.reward.findMany({
      include: {
        _count: {
          select: { rewardClaims: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Check if a reward has been claimed
   */
  static async hasClaims(id: string) {
    const count = await prisma.rewardClaim.count({
      where: { rewardId: id },
    });
    return count > 0;
  }

  /**
   * Get reward claims by reward ID
   */
  static async getClaims(rewardId: string) {
    return prisma.rewardClaim.findMany({
      where: { rewardId },
      include: {
        member: true,
      },
      orderBy: {
        claimDate: 'desc',
      },
    });
  }

  /**
   * Search rewards with pagination
   */
  static async search({
    query = '',
    page = 1,
    limit = 10,
    sortBy = 'pointsCost',
    sortDirection = 'asc',
    includeInactive = false,
  }: {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    includeInactive?: boolean;
  }) {
    const skip = (page - 1) * limit;

    const where: Prisma.RewardWhereInput = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }

    const [rewards, totalCount] = await Promise.all([
      prisma.reward.findMany({
        where,
        include: {
          _count: {
            select: { rewardClaims: true },
          },
        },
        orderBy: {
          [sortBy]: sortDirection,
        },
        skip,
        take: limit,
      }),
      prisma.reward.count({ where }),
    ]);

    return {
      rewards,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  /**
   * Get all reward claims with pagination
   */
  static async getPaginatedClaims({
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
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Prisma.RewardClaimWhereInput = {};

    if (search) {
      where.OR = [
        { member: { name: { contains: search, mode: 'insensitive' } } },
        { reward: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Fetch data with count
    const [claims, totalCount] = await Promise.all([
      prisma.rewardClaim.findMany({
        where,
        include: {
          member: true,
          reward: true,
        },
        orderBy: {
          [sortBy]: sortDirection as 'asc' | 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.rewardClaim.count({ where }),
    ]);

    return {
      claims,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  /**
   * Update reward claim status
   */
  static async updateClaimStatus(id: string, status: string) {
    return prisma.rewardClaim.update({
      where: { id },
      data: { status },
      include: {
        member: true,
        reward: true,
      },
    });
  }
}
