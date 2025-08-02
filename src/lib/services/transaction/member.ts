import prisma from '@/lib/prisma';
import type {
  Member as PrismaMember,
  MemberTier,
  Discount,
} from '@prisma/client';
import type { PrismaTransactionContext } from './types';

export type MemberData = PrismaMember & {
  tier: MemberTier | null;
  discounts: Discount[];
};

export class MemberService {
  /**
   * Get member with all necessary relations for transaction processing
   */
  static async getWithRelations(memberId: string): Promise<MemberData | null> {
    return await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        tier: true,
        discounts: true,
      },
    });
  }

  /**
   * Check if member exists and is not banned for transaction
   */
  static validateForTransaction(member: MemberData | null): {
    isValid: boolean;
    reason?: string;
  } {
    if (!member) {
      return { isValid: false, reason: 'Member not found' };
    }

    if (member.isBanned) {
      return {
        isValid: false,
        reason: member.banReason || 'Member is banned',
      };
    }

    return { isValid: true };
  }

  /**
   * Extract member info for transaction summary
   */
  static extractTransactionInfo(member: MemberData): {
    id: string;
    name: string;
    tierId: string | null;
    tierName: string | null;
  } {
    return {
      id: member.id,
      name: member.name,
      tierId: member.tierId,
      tierName: member.tier?.name || null,
    };
  }

  /**
   * Map member data for points calculation in transaction
   */
  static mapForPointsCalculation(member: MemberData) {
    return {
      id: member.id,
      name: member.name,
      points: member.totalPoints,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      tier: member.tier
        ? {
            id: member.tier.id,
            name: member.tier.name,
            minPoints: member.tier.minPoints,
            multiplier: member.tier.multiplier,
          }
        : null,
    };
  }

  /**
   * Update member points and check for tier advancement
   */
  static async processPoints(
    tx: PrismaTransactionContext,
    member: MemberData,
    totalAmount: number,
    pointMultiplier: number,
  ): Promise<void> {
    const earnedPoints = Math.floor(totalAmount * pointMultiplier);
    const newTotalPoints = member.totalPoints + earnedPoints;

    // Update member points
    await tx.member.update({
      where: { id: member.id },
      data: {
        totalPointsEarned: { increment: earnedPoints },
        totalPoints: newTotalPoints,
      },
    });

    // Check for tier advancement - only if member has a current tier
    if (member.tier) {
      const nextTier = await tx.memberTier.findFirst({
        where: {
          minPoints: {
            gt: member.tier.minPoints,
            lte: newTotalPoints,
          },
        },
        orderBy: { minPoints: 'desc' },
      });

      if (nextTier) {
        await tx.member.update({
          where: { id: member.id },
          data: { tierId: nextTier.id },
        });
      }
    }
  }

  /**
   * Calculate points that would be earned for a given amount
   */
  static calculateEarnedPoints(
    totalAmount: number,
    pointMultiplier: number,
  ): number {
    return Math.floor(totalAmount * pointMultiplier);
  }

  /**
   * Get next tier information for member
   */
  static async getNextTierInfo(member: MemberData): Promise<{
    nextTier: MemberTier | null;
    pointsNeeded: number;
  }> {
    if (!member.tier) {
      // Get the lowest tier
      const lowestTier = await prisma.memberTier.findFirst({
        orderBy: { minPoints: 'asc' },
      });

      return {
        nextTier: lowestTier,
        pointsNeeded: lowestTier
          ? lowestTier.minPoints - member.totalPoints
          : 0,
      };
    }

    const nextTier = await prisma.memberTier.findFirst({
      where: {
        minPoints: { gt: member.tier.minPoints },
      },
      orderBy: { minPoints: 'asc' },
    });

    return {
      nextTier,
      pointsNeeded: nextTier ? nextTier.minPoints - member.totalPoints : 0,
    };
  }
}
