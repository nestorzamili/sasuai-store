import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateMemberPoints } from './setting.service';
import { options } from '@/lib/types/table';
import { buildQueryOptions } from '../common/query-options';
export class MemberService {
  /**
   * Get all members
   */
  static async getAll() {
    return prisma.member.findMany({
      include: {
        tier: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
  // optimalize get member

  static async getAllOptimalize(queryOptions?: options) {
    const options = buildQueryOptions(queryOptions);
    const [member, count] = await Promise.all([
      prisma.member.findMany({
        include: {
          tier: true,
        },
        ...options,
      }),
      prisma.member.count(),
    ]);
    return {
      data: member,
      meta: {
        ...options,
        rowsCount: count,
      },
    };
  }
  /**
   * Get a member by ID
   */
  static async getById(id: string) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        tier: true,
        discountRelationsMember: {
          where: {
            discount: { isActive: true },
          },
        },
        memberPoints: {
          include: {
            transaction: true,
          },
          orderBy: {
            dateEarned: 'desc',
          },
        },
        rewardClaims: {
          include: {
            reward: true,
          },
          orderBy: {
            claimDate: 'desc',
          },
        },
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  /**
   * Create a new member
   */
  static async create(data: {
    name: string;
    email?: string;
    address?: string;
    cardId: string;
    phone?: string;
    tierId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // If no tier is specified, assign the lowest tier
      let tierToAssign = data.tierId;

      if (!tierToAssign) {
        const lowestTier = await tx.memberTier.findFirst({
          orderBy: {
            minPoints: 'asc',
          },
        });

        if (lowestTier) {
          tierToAssign = lowestTier.id;
        }
      }

      const member = await tx.member.create({
        data: {
          name: data.name,
          email: data.email,
          address: data.address,
          cardId: data.cardId,
          phone: data.phone,
          tierId: tierToAssign,
          totalPoints: 0,
          totalPointsEarned: 0,
          joinDate: new Date(),
        },
        include: {
          tier: true,
        },
      });

      return member;
    });
  }

  /**
   * Update a member
   */
  static async update(
    id: string,
    data: {
      name?: string;
      address?: string;
      cardId?: string;
      email?: string;
      phone?: string;
      tierId?: string;
    },
  ) {
    return prisma.member.update({
      where: { id },
      data,
      include: {
        tier: true,
      },
    });
  }

  /**
   * Delete a member
   */
  static async delete(id: string) {
    return prisma.member.delete({
      where: { id },
    });
  }

  /**
   * Search members with pagination
   */
  static async search({
    query = '',
    tier = '',
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortDirection = 'asc',
  }: {
    query?: string;
    tier?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) {
    const skip = (page - 1) * limit;

    const where: Prisma.MemberWhereInput = {};

    if (tier) {
      const tierNames = tier.split(',').map((t) => t.trim());
      where.tier = {
        name: {
          in: tierNames,
          mode: 'insensitive',
        },
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { cardId: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [members, totalCount] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          tier: true,
          discountRelationsMember: {
            include: {
              discount: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortDirection,
        },
        skip,
        take: limit,
      }),
      prisma.member.count({ where }),
    ]);

    return {
      members,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  /**
   * Ban a member
   */
  static async ban(id: string, reason: string) {
    return prisma.member.update({
      where: { id },
      data: {
        isBanned: true,
        banReason: reason,
      },
    });
  }

  /**
   * Unban a member
   */
  static async unban(id: string) {
    return prisma.member.update({
      where: { id },
      data: {
        isBanned: false,
        banReason: null,
      },
    });
  }

  /**
   * Award points to a member
   */
  static async awardPoints(
    memberId: string,
    transactionId: string,
    points: number,
    notes?: string,
    cashierId?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const isManualAward = notes !== undefined;
      const finalCashierId = cashierId || 'system';

      if (isManualAward) {
        let transaction = await tx.transaction.findUnique({
          where: { id: transactionId },
        });

        if (!transaction) {
          transaction = await tx.transaction.create({
            data: {
              id: transactionId,
              cashierId: finalCashierId,
              totalAmount: 0,
              discountAmount: 0,
              finalAmount: 0,
              paymentMethod: 'Manual Point Award',
              memberId,
            },
          });
        }
      } else {
        const transaction = await tx.transaction.findUnique({
          where: { id: transactionId },
        });

        if (!transaction) {
          throw new Error('Transaction not found');
        }
      }

      const memberPoint = await tx.memberPoint.create({
        data: {
          memberId,
          transactionId,
          pointsEarned: points,
          dateEarned: new Date(),
          notes: notes,
        },
      });

      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
          totalPoints: {
            increment: points,
          },
          totalPointsEarned: {
            increment: points,
          },
        },
        include: {
          tier: true,
        },
      });

      const eligibleTier = await tx.memberTier.findFirst({
        where: {
          minPoints: { lte: updatedMember.totalPointsEarned },
        },
        orderBy: {
          minPoints: 'desc',
        },
      });

      if (
        eligibleTier &&
        (!updatedMember.tierId || eligibleTier.id !== updatedMember.tierId)
      ) {
        await tx.member.update({
          where: { id: memberId },
          data: {
            tierId: eligibleTier.id,
          },
        });
      }

      return memberPoint;
    });
  }

  /**
   * Get member point history
   */
  static async getPointHistory(memberId: string) {
    return prisma.memberPoint.findMany({
      where: { memberId },
      include: {
        transaction: true,
      },
      orderBy: {
        dateEarned: 'desc',
      },
    });
  }

  /**
   * Claim a reward for a member
   */
  static async claimReward(memberId: string, rewardId: string) {
    return prisma.$transaction(async (tx) => {
      // Get the member and reward
      const [member, reward] = await Promise.all([
        tx.member.findUnique({
          where: { id: memberId },
        }),
        tx.reward.findUnique({
          where: { id: rewardId },
        }),
      ]);

      if (!member) {
        throw new Error('Member not found');
      }

      if (!reward) {
        throw new Error('Reward not found');
      }

      // Check if the member has enough points
      if (member.totalPoints < reward.pointsCost) {
        throw new Error('Member does not have enough points');
      }

      // Check if the reward is in stock
      if (reward.stock <= 0) {
        throw new Error('Reward is out of stock');
      }

      // Create the reward claim
      const rewardClaim = await tx.rewardClaim.create({
        data: {
          memberId,
          rewardId,
          claimDate: new Date(),
          status: 'Claimed',
        },
      });

      // Update the member's points (only reduce totalPoints, not totalPointsEarned)
      await tx.member.update({
        where: { id: memberId },
        data: {
          totalPoints: {
            decrement: reward.pointsCost,
          },
          // Note: We do not decrement totalPointsEarned here
        },
      });

      // Update the reward stock
      await tx.reward.update({
        where: { id: rewardId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      return rewardClaim;
    });
  }

  /**
   * Get available rewards for a member
   */
  static async getAvailableRewards(memberId: string) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { totalPoints: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    return prisma.reward.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        pointsCost: { lte: member.totalPoints },
      },
      orderBy: {
        pointsCost: 'asc',
      },
    });
  }

  /**
   * Get reward claim history for a member
   */
  static async getRewardClaimHistory(memberId: string) {
    return prisma.rewardClaim.findMany({
      where: { memberId },
      include: {
        reward: true,
      },
      orderBy: {
        claimDate: 'desc',
      },
    });
  }

  /**
   * Calculate potential points for a transaction
   */
  static async calculatePotentialPoints(
    memberId: string,
    transactionAmount: number,
  ): Promise<number> {
    const member = await this.getById(memberId);

    if (!member) {
      throw new Error('Member not found');
    }

    // Use the settings-based point calculation
    const points = await calculateMemberPoints(transactionAmount, member);
    return points;
  }

  /**
   * Get all member tiers
   */
  static async getAllTiers() {
    return prisma.memberTier.findMany({
      orderBy: {
        minPoints: 'asc',
      },
    });
  }

  /**
   * Create a new member tier
   */
  static async createTier(data: {
    name: string;
    minPoints: number;
    multiplier: number;
  }) {
    return prisma.memberTier.create({
      data,
    });
  }

  /**
   * Update a member tier
   */
  static async updateTier(
    id: string,
    data: {
      name?: string;
      minPoints?: number;
      multiplier?: number;
    },
  ) {
    return prisma.memberTier.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a member tier
   */
  static async deleteTier(id: string) {
    // Check if there are members using this tier
    const membersUsingTier = await prisma.member.count({
      where: { tierId: id },
    });

    if (membersUsingTier > 0) {
      throw new Error(
        `Cannot delete tier: ${membersUsingTier} members are using this tier`,
      );
    }

    return prisma.memberTier.delete({
      where: { id },
    });
  }
}
