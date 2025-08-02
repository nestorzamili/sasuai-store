import prisma from '@/lib/prisma';
import type {
  DiscountData,
  ValidationResult,
  DiscountWithRelations,
  DiscountValidationParams,
  DiscountCodeValidationResult,
} from './types';

export class Validation {
  static async validateDiscount(
    data: DiscountData,
  ): Promise<ValidationResult<null>> {
    try {
      if (data.id && data.code) {
        const existingDiscount = await prisma.discount.findUnique({
          where: { code: data.code },
        });

        if (existingDiscount && existingDiscount.id !== data.id) {
          return {
            success: false,
            message: `Discount with code ${data.code} already exists`,
          };
        }
      }

      if (data.startDate && data.endDate) {
        if (new Date(data.startDate) > new Date(data.endDate)) {
          return {
            success: false,
            message: 'Start date must be before end date',
          };
        }
      }

      if (data.type === 'PERCENTAGE' && data.value > 100) {
        return {
          success: false,
          message: 'Percentage discount cannot exceed 100%',
        };
      }

      if (data.isGlobal && data.applyTo !== 'ALL') {
        return {
          success: false,
          message: 'Global discounts must use ALL scope',
        };
      }

      if (data.isGlobal) {
        return {
          success: true,
          message: 'Global discount data is valid',
        };
      }

      if (
        data.applyTo === 'SPECIFIC_PRODUCTS' &&
        (!data.productIds || data.productIds.length === 0)
      ) {
        return {
          success: false,
          message:
            'Product IDs are required when apply to is set to SPECIFIC_PRODUCTS',
        };
      }

      if (
        data.applyTo === 'SPECIFIC_MEMBERS' &&
        (!data.memberIds || data.memberIds.length === 0)
      ) {
        return {
          success: false,
          message:
            'Member IDs are required when apply to is set to SPECIFIC_MEMBERS',
        };
      }

      if (
        data.applyTo === 'SPECIFIC_MEMBER_TIERS' &&
        (!data.memberTierIds || data.memberTierIds.length === 0)
      ) {
        return {
          success: false,
          message:
            'Member tier IDs are required when apply to is set to SPECIFIC_MEMBER_TIERS',
        };
      }

      return {
        success: true,
        message: 'Discount data is valid',
      };
    } catch (error) {
      console.error('Validate discount error:', error);
      return {
        success: false,
        message: 'Discount validation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async validateDiscountUsage(id: string) {
    try {
      const discount = await prisma.discount.findUnique({
        where: { id },
        select: {
          id: true,
          _count: {
            select: {
              transactions: true,
              transactionItems: true,
            },
          },
        },
      });

      if (!discount) {
        return {
          success: false,
          message: 'Discount not found',
          hasUsage: false,
        };
      }

      const hasUsage =
        discount._count.transactions > 0 ||
        discount._count.transactionItems > 0;

      return {
        success: true,
        hasUsage,
        usageCount: {
          transactions: discount._count.transactions,
          transactionItems: discount._count.transactionItems,
        },
      };
    } catch (error) {
      console.error('Validate discount usage error:', error);
      return {
        success: false,
        message: 'Failed to validate discount usage',
        hasUsage: false,
      };
    }
  }

  static validateDiscountStatus(
    discount: Pick<
      DiscountWithRelations,
      'isActive' | 'startDate' | 'endDate' | 'maxUses' | 'usedCount'
    >,
  ) {
    const now = new Date();
    const isValid =
      discount.isActive &&
      now >= discount.startDate &&
      now <= discount.endDate &&
      (!discount.maxUses || discount.usedCount < discount.maxUses);

    return {
      isValid,
      reasons: {
        isActive: discount.isActive,
        isInDateRange: now >= discount.startDate && now <= discount.endDate,
        hasUsagesLeft:
          !discount.maxUses || discount.usedCount < discount.maxUses,
      },
    };
  }

  static async validateDiscountCode({
    code,
    totalAmount,
  }: DiscountValidationParams): Promise<DiscountCodeValidationResult> {
    try {
      if (!code || !code.trim()) {
        return {
          success: false,
          message: 'Discount code is required',
        };
      }

      if (!totalAmount || totalAmount <= 0) {
        return {
          success: false,
          message: 'Total amount must be greater than 0',
        };
      }

      const discount = await prisma.discount.findFirst({
        where: {
          code: code.trim(),
          isGlobal: true,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (!discount) {
        return {
          success: false,
          message: 'Invalid discount code or discount is not available',
        };
      }

      // Check usage limit only (date range already checked in query)
      if (discount.maxUses && discount.usedCount >= discount.maxUses) {
        return {
          success: false,
          message: 'Discount has reached maximum usage limit',
        };
      }

      if (discount.minPurchase && totalAmount < discount.minPurchase) {
        return {
          success: false,
          message: `Minimum purchase amount is ${discount.minPurchase}`,
        };
      }

      let calculatedDiscount = 0;
      if (discount.type === 'PERCENTAGE') {
        calculatedDiscount = (totalAmount * discount.value) / 100;
      } else if (discount.type === 'FIXED_AMOUNT') {
        calculatedDiscount = discount.value;
      }

      calculatedDiscount = Math.min(calculatedDiscount, totalAmount);
      const finalAmount = totalAmount - calculatedDiscount;

      return {
        success: true,
        message: 'Discount code is valid',
        data: {
          ...discount,
          calculatedDiscount,
          finalAmount,
        },
      };
    } catch (error) {
      console.error('Validate discount code error:', error);
      return {
        success: false,
        message: 'Failed to validate discount code',
      };
    }
  }
}
