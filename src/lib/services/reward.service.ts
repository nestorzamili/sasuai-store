import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class RewardService {
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
    description?: string;
    imageUrl?: string;
    expiryDate?: Date;
  }) {
    let isActive = data.isActive ?? true;

    if (data.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(data.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        isActive = false;
      }
    }

    return prisma.reward.create({
      data: {
        name: data.name,
        pointsCost: data.pointsCost,
        stock: data.stock,
        isActive,
        description: data.description,
        imageUrl: data.imageUrl,
        expiryDate: data.expiryDate,
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
      description?: string | null;
      imageUrl?: string | null;
      expiryDate?: Date | null;
    },
  ) {
    // Jika tanggal kedaluwarsa diperbarui dan sudah lewat, otomatis nonaktifkan
    let updatedData = { ...data };

    if (data.expiryDate) {
      // Bandingkan tanggal saja, tanpa waktu
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiryDate = new Date(data.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      // Reward kedaluwarsa jika tanggal kedaluwarsa SEBELUM hari ini (bukan sama dengan)
      if (expiryDate < today) {
        updatedData.isActive = false;
      }
    }

    return prisma.reward.update({
      where: { id },
      data: updatedData,
    });
  }

  /**
   * Delete a reward
   */
  static async delete(id: string) {
    return prisma.reward.delete({
      where: { id },
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
    sortBy = 'name',
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
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (!includeInactive) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const expiryCondition = {
        OR: [{ expiryDate: null }, { expiryDate: { gte: now } }],
      };

      if (where.AND) {
        if (Array.isArray(where.AND)) {
          where.AND.push(expiryCondition);
        } else {
          where.AND = [where.AND, expiryCondition];
        }
      } else {
        where.AND = [expiryCondition];
      }
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
