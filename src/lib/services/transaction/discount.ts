import prisma from '@/lib/prisma';
import type { DiscountType } from '@prisma/client';
import type {
  MemberDiscountInfo,
  DiscountInfo,
  GlobalDiscountInfo,
  ValidatedCartItem,
  PrismaTransactionContext,
} from './types';

export class Discount {
  // =====================
  // VALIDATION METHODS
  // =====================

  /**
   * Get member discount information and validate eligibility
   */
  static async getMemberDiscountInfo(
    memberId: string | null | undefined,
    selectedMemberDiscountId: string | null,
    subtotal: number,
  ): Promise<MemberDiscountInfo | null> {
    if (!memberId) return null;

    // Get member with discount relations
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        discounts: true,
      },
    });

    if (!member) return null;

    // If no selected discount or no discounts available
    if (!selectedMemberDiscountId || !member.discounts?.length) {
      return {
        id: memberId,
        name: member.name,
        discount: null,
      };
    }

    // Find the selected discount and validate it's applicable
    const now = new Date();
    const discount = member.discounts.find(
      (d) =>
        d.id === selectedMemberDiscountId &&
        d.isActive &&
        now >= d.startDate &&
        now <= d.endDate &&
        (!d.maxUses || d.usedCount < d.maxUses) &&
        (!d.minPurchase || subtotal >= d.minPurchase),
    );

    if (!discount) {
      return {
        id: memberId,
        name: member.name,
        discount: null,
      };
    }

    // Calculate discount amount
    const discountAmount = this.calculateDiscountAmount(
      discount.type as DiscountType,
      discount.value,
      subtotal,
    );

    return {
      id: memberId,
      name: member.name,
      discount:
        discountAmount > 0
          ? {
              id: discount.id,
              value: discount.value,
              type: discount.type as DiscountType,
              amount: discountAmount,
            }
          : null,
    };
  }

  /**
   * Get tier-based discount information and validate eligibility
   */
  static async getTierDiscountInfo(
    tierId: string,
    discountId: string,
    subtotal: number,
  ): Promise<DiscountInfo | null> {
    // Get tier discount with all validations
    const tierDiscount = await prisma.discount.findFirst({
      where: {
        id: discountId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        memberTiers: {
          some: { id: tierId },
        },
        OR: [
          { maxUses: null },
          { usedCount: { lt: prisma.discount.fields.maxUses } },
        ],
        AND: [
          {
            OR: [{ minPurchase: null }, { minPurchase: { lte: subtotal } }],
          },
        ],
      },
    });

    if (!tierDiscount) return null;

    // Calculate discount amount
    const discountAmount = this.calculateDiscountAmount(
      tierDiscount.type as DiscountType,
      tierDiscount.value,
      subtotal,
    );

    return discountAmount > 0
      ? {
          id: tierDiscount.id,
          value: tierDiscount.value,
          type: tierDiscount.type as DiscountType,
          amount: discountAmount,
        }
      : null;
  }

  /**
   * Get global discount information and validate eligibility
   */
  static async getGlobalDiscountInfo(
    discountCode: string,
    subtotal: number,
  ): Promise<GlobalDiscountInfo | null> {
    // Get global discount by code with all validations
    const globalDiscount = await prisma.discount.findFirst({
      where: {
        code: discountCode,
        isGlobal: true,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [
          { maxUses: null },
          { usedCount: { lt: prisma.discount.fields.maxUses } },
        ],
        AND: [
          {
            OR: [{ minPurchase: null }, { minPurchase: { lte: subtotal } }],
          },
        ],
      },
    });

    if (!globalDiscount) return null;

    // Calculate discount amount
    const discountAmount = this.calculateDiscountAmount(
      globalDiscount.type as DiscountType,
      globalDiscount.value,
      subtotal,
    );

    return discountAmount > 0
      ? {
          id: globalDiscount.id,
          value: globalDiscount.value,
          type: globalDiscount.type as DiscountType,
          amount: discountAmount,
          code: globalDiscount.code!,
        }
      : null;
  }

  /**
   * Validate if discount is still usable (check max uses)
   */
  static async validateDiscountUsage(discountId: string): Promise<boolean> {
    const discount = await prisma.discount.findUnique({
      where: { id: discountId },
      select: { maxUses: true, usedCount: true },
    });

    if (!discount) return false;
    if (!discount.maxUses) return true; // No usage limit

    return discount.usedCount < discount.maxUses;
  }

  /**
   * Get all applicable discounts for a member
   */
  static async getApplicableDiscountsForMember(
    memberId: string,
    subtotal: number,
  ): Promise<DiscountInfo[]> {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { discounts: true },
    });

    if (!member || !member.discounts) return [];

    const now = new Date();
    const applicableDiscounts: DiscountInfo[] = [];

    for (const discount of member.discounts) {
      if (
        discount.isActive &&
        now >= discount.startDate &&
        now <= discount.endDate &&
        (!discount.maxUses || discount.usedCount < discount.maxUses) &&
        (!discount.minPurchase || subtotal >= discount.minPurchase)
      ) {
        const amount = this.calculateDiscountAmount(
          discount.type as DiscountType,
          discount.value,
          subtotal,
        );

        if (amount > 0) {
          applicableDiscounts.push({
            id: discount.id,
            value: discount.value,
            type: discount.type as DiscountType,
            amount,
          });
        }
      }
    }

    return applicableDiscounts;
  }

  /**
   * Get all applicable global discounts
   */
  static async getApplicableGlobalDiscounts(
    subtotal: number,
  ): Promise<GlobalDiscountInfo[]> {
    const globalDiscounts = await prisma.discount.findMany({
      where: {
        isGlobal: true,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [
          { maxUses: null },
          { usedCount: { lt: prisma.discount.fields.maxUses } },
        ],
        AND: [
          {
            OR: [{ minPurchase: null }, { minPurchase: { lte: subtotal } }],
          },
        ],
      },
    });

    const applicableDiscounts: GlobalDiscountInfo[] = [];

    for (const discount of globalDiscounts) {
      const amount = this.calculateDiscountAmount(
        discount.type as DiscountType,
        discount.value,
        subtotal,
      );

      if (amount > 0) {
        applicableDiscounts.push({
          id: discount.id,
          value: discount.value,
          type: discount.type as DiscountType,
          amount,
          code: discount.code!,
        });
      }
    }

    return applicableDiscounts;
  }

  // =====================
  // TRACKING METHODS
  // =====================

  /**
   * Increment discount usage counters after successful transaction
   */
  static async incrementUsages(
    tx: PrismaTransactionContext,
    validatedCart: ValidatedCartItem[],
  ): Promise<void> {
    const discountUsages = new Map<string, number>();

    // Count discount usages from cart items
    for (const item of validatedCart) {
      if (item.discount) {
        const discountId = item.discount.id;
        discountUsages.set(
          discountId,
          (discountUsages.get(discountId) || 0) + 1,
        );
      }
    }

    // Prepare batch updates for discount usage
    const updatePromises: Promise<unknown>[] = [];

    for (const [discountId, usageCount] of discountUsages) {
      // Update global discount usage counter
      updatePromises.push(
        tx.discount.update({
          where: { id: discountId },
          data: { usedCount: { increment: usageCount } },
        }),
      );
    }

    // Execute all updates in parallel
    await Promise.all(updatePromises);
  }

  // =====================
  // HELPER METHODS
  // =====================

  /**
   * Calculate discount amount based on type and value
   */
  private static calculateDiscountAmount(
    type: DiscountType,
    value: number,
    subtotal: number,
  ): number {
    if (type === 'PERCENTAGE') {
      return Math.floor((value * subtotal) / 100);
    }
    if (type === 'FIXED_AMOUNT') {
      return Math.min(value, subtotal); // Can't discount more than subtotal
    }
    return 0;
  }
}
