import prisma from '@/lib/prisma';
import type {
  DiscountPaginationParams,
  DiscountWithCounts,
  DiscountWhereClause,
  DiscountOrderBy,
  MemberTierForSelection,
  MemberForSelection,
  ApiResponse,
  DiscountListData,
  DiscountWithRelations,
} from './types';
import { Validation } from './validation';

export class GetDiscount {
  static async getDiscounts({
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
  }: DiscountPaginationParams): Promise<ApiResponse<DiscountListData>> {
    try {
      const where: DiscountWhereClause = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (isActive !== undefined) where.isActive = isActive;
      if (type) where.type = type;
      if (applyTo) where.applyTo = applyTo;
      if (isGlobal !== undefined) where.isGlobal = isGlobal;

      if (validAsOf) {
        const validDate = new Date(validAsOf);
        where.startDate = { lte: validDate };
        where.endDate = { gte: validDate };
      }

      const skip = (page - 1) * pageSize;

      const orderBy: DiscountOrderBy = {};
      orderBy[sortField] = sortDirection;

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

      const processedDiscounts: DiscountWithCounts[] = discounts.map(
        (discount) => {
          const { isValid } = Validation.validateDiscountStatus(discount);

          return {
            id: discount.id,
            name: discount.name,
            code: discount.code,
            description: discount.description,
            type: discount.type,
            value: discount.value,
            minPurchase: discount.minPurchase,
            startDate: discount.startDate,
            endDate: discount.endDate,
            isActive: discount.isActive,
            isGlobal: discount.isGlobal,
            maxUses: discount.maxUses,
            usedCount: discount.usedCount,
            applyTo: discount.applyTo,
            createdAt: discount.createdAt,
            updatedAt: discount.updatedAt,
            _count: discount._count,
            isValid,
            usage: {
              usedCount: discount.usedCount,
              maxUses: discount.maxUses,
              usagePercentage:
                discount.maxUses && discount.maxUses > 0
                  ? Math.round((discount.usedCount / discount.maxUses) * 100)
                  : null,
            },
            relationCounts: discount._count,
          };
        },
      );

      return {
        success: true,
        data: {
          discounts: processedDiscounts,
          pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: page,
            pageSize,
          },
        },
      };
    } catch (error) {
      console.error('Get paginated discounts error:', error);
      return {
        success: false,
        message: 'Failed to get discounts',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getMemberTiers(
    search?: string,
  ): Promise<ApiResponse<MemberTierForSelection[]>> {
    try {
      const tiers: MemberTierForSelection[] = await prisma.memberTier.findMany({
        select: {
          id: true,
          name: true,
          minPoints: true,
          multiplier: true,
        },
        take: 10,
        orderBy: { name: 'asc' },
        where: {
          ...(search &&
            search.trim().length > 0 && {
              OR: [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { id: { contains: search.trim(), mode: 'insensitive' } },
              ],
            }),
        },
      });

      return {
        success: true,
        data: tiers,
      };
    } catch (error) {
      console.error('Get member tiers for selection error:', error);
      return {
        success: false,
        message: 'Failed to get member tiers',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getMembers(
    search?: string,
  ): Promise<ApiResponse<MemberForSelection[]>> {
    try {
      const members: MemberForSelection[] = await prisma.member.findMany({
        select: {
          id: true,
          name: true,
          tier: { select: { name: true } },
          cardId: true,
        },
        take: 10,
        orderBy: { name: 'asc' },
        where: {
          ...(search &&
            search.trim().length > 0 && {
              OR: [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { id: { contains: search.trim(), mode: 'insensitive' } },
                { cardId: { contains: search.trim(), mode: 'insensitive' } },
                { email: { contains: search.trim(), mode: 'insensitive' } },
              ],
            }),
        },
      });

      return {
        success: true,
        data: members,
      };
    } catch (error) {
      console.error('Get members for selection error:', error);
      return {
        success: false,
        message: 'Failed to get members',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getById(
    id: string,
  ): Promise<ApiResponse<DiscountWithRelations | null>> {
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

      return {
        success: true,
        data: discount,
      };
    } catch (error) {
      console.error('Get discount by id error:', error);
      return {
        success: false,
        message: 'Failed to get discount',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
