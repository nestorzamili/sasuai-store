import prisma from '@/lib/prisma';
import type {
  Member as PrismaMember,
  MemberTier,
  Discount,
} from '@prisma/client';
import type { PrismaTransactionContext } from './types';
import { getPointRuleSettings } from '../setting.service';
export type MemberData = PrismaMember & {
  tier: MemberTier | null;
  discounts: Discount[];
};

export interface PointResults {
  name?: string;
  phone?: string;
  earnedPoint?: string;
  newTotalPoint?: string;
}

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
    totalAmount: number
  ): Promise<PointResults> {
    const calculate = await this.calculateEarnedPoints(totalAmount, member);

    // // Update member points
    await tx.member.update({
      where: { id: member.id },
      data: {
        totalPointsEarned: { increment: calculate.earnedPoint },
        totalPoints: calculate.totalPoint,
      },
    });
    // Check for tier advancement - only if member has a current tier
    if (member.tier) {
      const nextTier = await tx.memberTier.findFirst({
        where: {
          minPoints: {
            gt: member.tier.minPoints,
            lte: calculate.totalPoint,
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
    return {
      name: member.name,
      phone: member.phone ?? undefined,
      earnedPoint: calculate.earnedPoint.toLocaleString(),
      newTotalPoint: calculate.totalPoint.toLocaleString(),
    };
  }

  /**
   * Calculate points that would be earned for a given amount
   */

  static async calculateEarnedPoints(
    amount: number,
    member: MemberData
  ): Promise<{
    earnedPoint: number;
    totalPoint: number;
  }> {
    const pointRules = await getPointRuleSettings();
    // Base calculation using the configured base amount
    const basePoints = Math.floor(amount / pointRules.baseAmount);

    // Apply tier multiplier if available
    const tierMultiplier = member?.tier?.multiplier || 1;

    // Apply both the global point multiplier and the tier-specific multiplier
    const totalMultiplier = pointRules.pointMultiplier * tierMultiplier;

    const earnedPoint = Math.floor(basePoints * totalMultiplier);
    const totalPoint = Math.floor(earnedPoint + member.totalPoints);
    // Calculate and round down to nearest integer
    return {
      earnedPoint,
      totalPoint,
    };
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
