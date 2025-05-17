import prisma from '@/lib/prisma';
import { DiscountApplyTo } from '@/lib/types/discount';
import { errorHandling } from '../common/response-formatter';
import {
  DiscountData,
  DiscountPaginationParams,
  DiscountCreateResult,
  DiscountUpdateResult,
  DiscountValidationResult,
} from '../types/discount';

export class DiscountService {
  /**
   * Create a new discount
   */
  static async createDiscount(
    data: DiscountData
  ): Promise<DiscountCreateResult> {
    try {
      const validation = await this.validateDiscount(data);
      if (!validation.success) {
        return validation;
      }

      // Extract data and handle relationships
      const { productIds, memberIds, memberTierIds, ...discountData } = data;

      // Auto-generate code
      discountData.code = this.generateDiscountCode(discountData.name);

      // For global discounts, set applyTo to ALL (not null)
      if (discountData.isGlobal) {
        discountData.applyTo = DiscountApplyTo.ALL;
      }

      const discount = await prisma.discount.create({
        data: {
          ...discountData,
          // Only connect relationships for non-global discounts
          ...(productIds &&
          productIds.length > 0 &&
          !discountData.isGlobal &&
          data.applyTo === 'SPECIFIC_PRODUCTS'
            ? {
                products: {
                  connect: productIds.map((id) => ({ id })),
                },
              }
            : {}),
          ...(memberIds &&
          memberIds.length > 0 &&
          data.applyTo === 'SPECIFIC_MEMBERS'
            ? {
                members: {
                  connect: memberIds.map((id) => ({ id })),
                },
              }
            : {}),
          ...(memberTierIds &&
          memberTierIds.length > 0 &&
          data.applyTo === 'SPECIFIC_MEMBER_TIERS'
            ? {
                memberTiers: {
                  connect: memberTierIds.map((id) => ({ id })),
                },
              }
            : {}),
        },
        include: {
          products: true,
          members: true,
          memberTiers: true,
        },
      });

      return {
        success: true,
        message: 'Discount created successfully',
        discount,
      };
    } catch (error) {
      console.error('Create discount error:', error);
      return errorHandling({
        message: 'Failed to create discount',
        details: error,
      });
    }
  }

  /**
   * Generate a discount code based on name
   */
  private static generateDiscountCode(name: string): string {
    // Bersihkan karakter dan ambil 2 karakter pertama, kapital
    const baseCode = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .padEnd(2, 'X') // Tambah 'X' jika kurang dari 2 huruf
      .substring(0, 2);

    // Tambah angka 4 digit
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `${baseCode}${randomSuffix}`; // total: 2 + 4 = 6 karakter
  }

  /**
   * Update an existing discount
   */
  static async updateDiscount(
    id: string,
    data: Partial<DiscountData>
  ): Promise<DiscountUpdateResult> {
    try {
      const existingDiscount = await prisma.discount.findUnique({
        where: { id },
        include: {
          products: true,
          members: true,
          memberTiers: true,
          transactions: { select: { id: true } },
          transactionItems: { select: { id: true } },
        },
      });

      if (!existingDiscount) {
        return {
          success: false,
          message: 'Discount not found',
        };
      }

      // Check if discount has been used in transactions
      const isUsed =
        existingDiscount.transactions.length > 0 ||
        existingDiscount.transactionItems.length > 0;

      if (isUsed && (data.type !== undefined || data.value !== undefined)) {
        return {
          success: false,
          message:
            'Cannot update type or value of a discount that has been used in transactions',
        };
      }

      // For global discounts, ensure applyTo is ALL
      if (data.isGlobal === true) {
        data.applyTo = DiscountApplyTo.ALL;
      }

      // Extract relation IDs
      const { productIds, memberIds, memberTierIds, ...discountUpdateData } =
        data;

      // Update related products if specified
      let productsUpdate = {};
      if (productIds !== undefined && data.applyTo === 'SPECIFIC_PRODUCTS') {
        productsUpdate = {
          products: {
            set: productIds?.map((id) => ({ id })) || [],
          },
        };
      }

      // Update related members if specified
      let membersUpdate = {};
      if (memberIds !== undefined && data.applyTo === 'SPECIFIC_MEMBERS') {
        membersUpdate = {
          members: {
            set: memberIds?.map((id) => ({ id })) || [],
          },
        };
      }

      // Update related member tiers if specified
      let memberTiersUpdate = {};
      if (
        memberTierIds !== undefined &&
        data.applyTo === 'SPECIFIC_MEMBER_TIERS'
      ) {
        memberTiersUpdate = {
          memberTiers: {
            set: memberTierIds?.map((id) => ({ id })) || [],
          },
        };
      }

      const updatedDiscount = await prisma.discount.update({
        where: { id },
        data: {
          ...discountUpdateData,
          ...productsUpdate,
          ...membersUpdate,
          ...memberTiersUpdate,
        },
        include: {
          products: true,
          members: true,
          memberTiers: true,
        },
      });

      return {
        success: true,
        message: 'Discount updated successfully',
        discount: updatedDiscount,
      };
    } catch (error) {
      console.error('Update discount error:', error);
      return errorHandling({
        message: 'Failed to update discount',
        details: error,
      });
    }
  }

  /**
   * Get discount by ID
   */
  static async getDiscountById(id: string) {
    try {
      const discount = await prisma.discount.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              barcode: true,
              category: { select: { name: true } },
              brand: { select: { name: true } },
            },
          },
          members: {
            select: {
              id: true,
              name: true,
              tier: { select: { name: true } },
            },
          },
          memberTiers: {
            select: {
              id: true,
              name: true,
              minPoints: true,
              multiplier: true,
            },
          },
        },
      });

      if (!discount) {
        return { success: false, message: 'Discount not found' };
      }

      // Check if discount is currently valid
      const now = new Date();
      const isValid =
        discount.isActive &&
        now >= discount.startDate &&
        now <= discount.endDate &&
        (!discount.maxUses || discount.usedCount < discount.maxUses);

      return {
        success: true,
        discount: {
          ...discount,
          isValid,
        },
      };
    } catch (error) {
      console.error('Get discount error:', error);
      return errorHandling({
        message: 'Failed to get discount',
        details: error,
      });
    }
  }

  /**
   * Toggle discount active status
   */
  static async toggleDiscountStatus(id: string): Promise<DiscountUpdateResult> {
    try {
      const discount = await prisma.discount.findUnique({
        where: { id },
        select: { isActive: true },
      });

      if (!discount) {
        return {
          success: false,
          message: 'Discount not found',
        };
      }

      const updatedDiscount = await prisma.discount.update({
        where: { id },
        data: { isActive: !discount.isActive },
      });

      return {
        success: true,
        message: `Discount ${
          updatedDiscount.isActive ? 'activated' : 'deactivated'
        } successfully`,
        discount: updatedDiscount,
      };
    } catch (error) {
      console.error('Toggle discount status error:', error);
      return errorHandling({
        message: 'Failed to toggle discount status',
        details: error,
      });
    }
  }

  /**
   * Get paginated discounts with filtering and sorting
   */
  static async getPaginated({
    page = 1,
    pageSize = 10,
    sortField = 'createdAt',
    sortDirection = 'desc',
    search = '',
    isActive,
    type,
    applyTo,
    isGlobal,
    validAsOf,
  }: DiscountPaginationParams) {
    try {
      // Build where clause based on filters
      const where: any = {};

      // Add search filter
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Add other filters
      if (isActive !== undefined) where.isActive = isActive;
      if (type) where.type = type;
      if (applyTo) where.applyTo = applyTo;
      if (isGlobal !== undefined) where.isGlobal = isGlobal;

      // Filter for valid discounts as of a certain date
      if (validAsOf) {
        const validDate = new Date(validAsOf);
        where.startDate = { lte: validDate };
        where.endDate = { gte: validDate };
      }

      // Calculate pagination
      const skip = (page - 1) * pageSize;

      // Get order by field
      const orderBy: any = {};
      orderBy[sortField] = sortDirection;

      // Execute query with count
      const [discounts, totalCount] = await Promise.all([
        prisma.discount.findMany({
          where,
          include: {
            _count: {
              select: {
                products: true,
                members: true,
                memberTiers: true,
                transactions: true,
                transactionItems: true,
              },
            },
          },
          orderBy,
          skip,
          take: pageSize,
        }),
        prisma.discount.count({ where }),
      ]);

      // Process discounts to add validity info
      const now = new Date();
      const processedDiscounts = discounts.map((discount: any) => {
        const isValid =
          discount.isActive &&
          now >= discount.startDate &&
          now <= discount.endDate &&
          (!discount.maxUses || discount.usedCount < discount.maxUses);

        return {
          ...discount,
          isValid,
          usage: {
            usedCount: discount.usedCount,
            maxUses: discount.maxUses,
            usagePercentage: discount.maxUses
              ? Math.round((discount.usedCount / discount.maxUses) * 100)
              : null,
          },
          relationCounts: discount._count,
        };
      });

      return {
        success: true,
        discounts: processedDiscounts,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: page,
          pageSize,
        },
      };
    } catch (error) {
      console.error('Get paginated discounts error:', error);
      return errorHandling({
        message: 'Failed to get discounts',
        details: error,
      });
    }
  }

  /**
   * Delete a discount
   */
  static async deleteDiscount(id: string) {
    try {
      // Check if discount exists and if it has been used in transactions
      const discount = await prisma.discount.findUnique({
        where: { id },
        include: {
          transactions: { select: { id: true } },
          transactionItems: { select: { id: true } },
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
        };
      }

      // Check if discount has been used
      if (
        discount._count.transactions > 0 ||
        discount._count.transactionItems > 0
      ) {
        return {
          success: false,
          message:
            'Cannot delete a discount that has been used in transactions',
        };
      }

      // Delete discount
      await prisma.discount.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Discount deleted successfully',
      };
    } catch (error) {
      console.error('Delete discount error:', error);
      return errorHandling({
        message: 'Failed to delete discount',
        details: error,
      });
    }
  }

  // Get member tiers for discount selection
  static async getMemberTiersForSelection(search?: string) {
    try {
      const tiers = await prisma.memberTier.findMany({
        select: {
          id: true,
          name: true,
          minPoints: true,
          multiplier: true,
        },
        take: 10,
        orderBy: { name: 'asc' },
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { id: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      });

      return {
        success: true,
        tiers,
      };
    } catch (error) {
      console.error('Get member tiers for selection error:', error);
      return errorHandling({
        message: 'Failed to get member tiers',
        details: error,
      });
    }
  }

  /**
   * Get members for discount selection
   */
  static async getMembersForSelection(search?: string) {
    try {
      const members = await prisma.member.findMany({
        select: {
          id: true,
          name: true,
          tier: { select: { name: true } },
          cardId: true,
        },
        take: 10,
        orderBy: { name: 'asc' },
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { id: { contains: search, mode: 'insensitive' } },
              { cardId: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
      });

      return {
        success: true,
        members,
      };
    } catch (error) {
      console.error('Get members for selection error:', error);
      return errorHandling({
        message: 'Failed to get members',
        details: error,
      });
    }
  }

  /**
   * Validate discount data
   */
  private static async validateDiscount(
    data: DiscountData
  ): Promise<DiscountValidationResult> {
    try {
      if (data.id && data.code) {
        const existingDiscount = await prisma.discount.findUnique({
          where: { code: data.code },
        });

        if (existingDiscount && existingDiscount.id !== data.id) {
          return {
            success: false,
            message: `Discount with code ${data.code} already exists`,
            isValid: false,
          };
        }
      }

      // Validate date range
      if (data.startDate && data.endDate) {
        if (new Date(data.startDate) > new Date(data.endDate)) {
          return {
            success: false,
            message: 'Start date must be before end date',
            isValid: false,
          };
        }
      }

      // Validate discount value
      if (data.type === 'PERCENTAGE' && data.value > 100) {
        return {
          success: false,
          message: 'Percentage discount cannot exceed 100%',
          isValid: false,
        };
      }

      // Global discounts should use ALL enum value
      if (data.isGlobal && data.applyTo !== 'ALL') {
        return {
          success: false,
          message: 'Global discounts must use ALL scope',
          isValid: false,
        };
      }

      // Skip product/member validation for global discounts
      if (data.isGlobal) {
        return {
          success: true,
          message: 'Global discount data is valid',
          isValid: true,
        };
      }

      // Only validate specific associations if the discount is not global
      if (
        data.applyTo === 'SPECIFIC_PRODUCTS' &&
        (!data.productIds || data.productIds.length === 0)
      ) {
        return {
          success: false,
          message:
            'Product IDs are required when apply to is set to SPECIFIC_PRODUCTS',
          isValid: false,
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
          isValid: false,
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
          isValid: false,
        };
      }

      return {
        success: true,
        message: 'Discount data is valid',
        isValid: true,
      };
    } catch (error) {
      console.error('Validate discount error:', error);
      return {
        success: false,
        message: 'Discount validation failed',
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a global discount by its code
   * @param code The discount code to retrieve
   * @returns The global discount if valid, or error message
   */
  static async getGlobalDiscountByCode(code: string) {
    try {
      if (!code) {
        return {
          success: false,
          message: 'Discount code is required',
        };
      }

      // Find the discount with the provided code that's global and valid
      const discount = await prisma.discount.findFirst({
        where: {
          code,
          isGlobal: true,
          isActive: true,
        },
      });

      if (!discount) {
        return {
          success: false,
          message: 'Invalid or expired discount code',
        };
      }

      return {
        success: true,
        message: 'Valid global discount code',
        discount,
      };
    } catch (error) {
      console.error('Get global discount by code error:', error);
      return errorHandling({
        message: 'Failed to validate discount code',
        details: error,
      });
    }
  }
}
