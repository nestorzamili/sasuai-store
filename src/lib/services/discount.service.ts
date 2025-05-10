import prisma from '@/lib/prisma';
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
    data: DiscountData,
  ): Promise<DiscountCreateResult> {
    try {
      const validation = await this.validateDiscount(data);
      if (!validation.success) {
        return validation;
      }

      const { productIds, memberIds, memberTierIds, ...discountData } = data;

      const discount = await prisma.discount.create({
        data: {
          ...discountData,
          ...(productIds &&
          productIds.length > 0 &&
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
   * Update an existing discount
   */
  static async updateDiscount(
    id: string,
    data: Partial<DiscountData>,
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
      const processedDiscounts = discounts.map((discount) => {
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

  /**
   * Get products for discount selection
   */
  static async getProductsForSelection(search?: string) {
    try {
      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ];
      }

      const products = await prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          barcode: true,
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
        take: 10,
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        products,
      };
    } catch (error) {
      console.error('Get products for selection error:', error);
      return errorHandling({
        message: 'Failed to get products',
        details: error,
      });
    }
  }

  /**
   * Get members for discount selection
   */
  static async getMembersForSelection(search?: string) {
    try {
      const where: any = {
        isBanned: false,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { cardId: { contains: search, mode: 'insensitive' } },
        ];
      }

      const members = await prisma.member.findMany({
        where,
        select: {
          id: true,
          name: true,
          cardId: true,
          tier: { select: { name: true } },
        },
        take: 10,
        orderBy: { name: 'asc' },
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
   * Validate discount data
   */
  private static async validateDiscount(
    data: DiscountData,
  ): Promise<DiscountValidationResult> {
    try {
      // Check if discount with same code already exists (if code provided)
      if (data.code) {
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

      // Validate specific product IDs
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

      // Validate specific member IDs
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
}
