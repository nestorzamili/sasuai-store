import prisma from '@/lib/prisma';
import {
  BatchPaginationParams,
  ProductBatchWithProduct,
  ProductBatchWithDetails,
  CreateBatchData,
  UpdateBatchData,
  PaginatedResponse,
} from '@/lib/types/inventory';

export class ProductBatchService {
  static async getPaginated(
    params: BatchPaginationParams = {},
  ): Promise<PaginatedResponse<ProductBatchWithProduct>> {
    const {
      page = 1,
      pageSize = 10,
      sortField = 'createdAt',
      sortDirection = 'desc',
      search = '',
      productId,
      expiryDateStart,
      expiryDateEnd,
      minRemainingQuantity,
      maxRemainingQuantity,
      includeExpired = true,
      includeOutOfStock = true,
      categoryId,
    } = params;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { batchCode: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { skuCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (productId) where.productId = productId;

    if (categoryId) {
      where.product = {
        ...((where.product as Record<string, unknown>) || {}),
        categoryId: categoryId,
      };
    }

    if (expiryDateStart || expiryDateEnd) {
      where.expiryDate = {};
      if (expiryDateStart)
        (where.expiryDate as Record<string, unknown>).gte = expiryDateStart;
      if (expiryDateEnd)
        (where.expiryDate as Record<string, unknown>).lte = expiryDateEnd;
    }

    if (!includeExpired) {
      where.expiryDate = {
        ...((where.expiryDate as Record<string, unknown>) || {}),
        gt: new Date(),
      };
    }

    if (
      minRemainingQuantity !== undefined ||
      maxRemainingQuantity !== undefined
    ) {
      where.remainingQuantity = {};
      if (minRemainingQuantity !== undefined) {
        (where.remainingQuantity as Record<string, unknown>).gte =
          minRemainingQuantity;
      }
      if (maxRemainingQuantity !== undefined) {
        (where.remainingQuantity as Record<string, unknown>).lte =
          maxRemainingQuantity;
      }
    }

    if (!includeOutOfStock) {
      where.remainingQuantity = {
        ...((where.remainingQuantity as Record<string, unknown>) || {}),
        gt: 0,
      };
    }

    const skip = (page - 1) * pageSize;

    // Build order by
    const orderBy: Record<string, unknown> = {};
    if (sortField.includes('.')) {
      const [relation, field] = sortField.split('.');
      orderBy[relation] = { [field]: sortDirection };
    } else {
      orderBy[sortField] = sortDirection;
    }

    const [batches, totalCount] = await Promise.all([
      prisma.productBatch.findMany({
        where,
        select: {
          id: true,
          batchCode: true,
          expiryDate: true,
          initialQuantity: true,
          remainingQuantity: true,
          buyPrice: true,
          productId: true,
          createdAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              name: true,
              unitId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              unit: {
                select: {
                  id: true,
                  name: true,
                  symbol: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.productBatch.count({ where }),
    ]);

    return {
      data: batches as ProductBatchWithProduct[],
      meta: {
        totalRows: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  static async getById(id: string): Promise<ProductBatchWithDetails | null> {
    try {
      const result = await prisma.productBatch.findUnique({
        where: { id },
        include: {
          product: {
            include: {
              category: true,
              unit: true,
            },
          },
          stockIns: {
            include: {
              supplier: true,
              unit: true,
              batch: {
                include: {
                  product: {
                    include: {
                      category: true,
                      unit: true,
                    },
                  },
                },
              },
            },
          },
          stockOuts: {
            include: {
              unit: true,
              batch: {
                include: {
                  product: {
                    include: {
                      category: true,
                      unit: true,
                    },
                  },
                },
              },
            },
          },
          transactionItems: {
            include: {
              unit: true,
              transaction: {
                select: {
                  id: true,
                  createdAt: true,
                  finalAmount: true,
                },
              },
            },
          },
        },
      });

      return result as ProductBatchWithDetails | null;
    } catch (error) {
      console.error('Error fetching batch details:', error);
      return null;
    }
  }

  static async create(data: CreateBatchData) {
    return prisma.$transaction(async (tx) => {
      const batch = await tx.productBatch.create({
        data: {
          productId: data.productId,
          batchCode: data.batchCode,
          expiryDate: data.expiryDate,
          initialQuantity: data.initialQuantity,
          remainingQuantity: data.initialQuantity,
          buyPrice: data.buyPrice,
        },
      });

      const stockIn = await tx.stockIn.create({
        data: {
          batchId: batch.id,
          quantity: data.initialQuantity,
          unitId: data.unitId,
          date: new Date(),
          supplierId: data.supplierId,
        },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: {
          currentStock: {
            increment: data.initialQuantity,
          },
        },
      });

      return { batch, stockIn };
    });
  }

  static async update(id: string, data: UpdateBatchData) {
    return prisma.productBatch.update({
      where: { id },
      data,
    });
  }

  static async adjustQuantity(
    id: string,
    adjustment: number,
    reason: string,
    unitId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const batch = await tx.productBatch.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!batch) {
        throw new Error('Product batch not found');
      }

      const newQuantity = batch.remainingQuantity + adjustment;

      if (newQuantity < 0) {
        throw new Error('Quantity adjustment would result in negative stock');
      }

      const updatedBatch = await tx.productBatch.update({
        where: { id },
        data: { remainingQuantity: newQuantity },
      });

      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: { increment: adjustment },
        },
      });

      if (adjustment > 0) {
        await tx.stockIn.create({
          data: {
            batchId: id,
            quantity: adjustment,
            unitId: unitId,
            date: new Date(),
          },
        });
      } else if (adjustment < 0) {
        await tx.stockOut.create({
          data: {
            batchId: id,
            quantity: Math.abs(adjustment),
            unitId: unitId,
            date: new Date(),
            reason: reason || 'Inventory adjustment',
          },
        });
      }

      return updatedBatch;
    });
  }

  static async canDelete(id: string): Promise<boolean> {
    const [stockIns, stockOuts, transactions] = await Promise.all([
      prisma.stockIn.count({ where: { batchId: id } }),
      prisma.stockOut.count({ where: { batchId: id } }),
      prisma.transactionItem.count({ where: { batchId: id } }),
    ]);

    return transactions === 0 && stockOuts === 0 && stockIns <= 1;
  }

  static async delete(id: string) {
    const canDelete = await this.canDelete(id);

    if (!canDelete) {
      throw new Error(
        'Cannot delete batch with existing stock movements or transactions',
      );
    }

    return prisma.$transaction(async (tx) => {
      const batch = await tx.productBatch.findUnique({
        where: { id },
      });

      if (!batch) {
        throw new Error('Product batch not found');
      }

      await tx.stockIn.deleteMany({
        where: { batchId: id },
      });

      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: {
            decrement: batch.remainingQuantity,
          },
        },
      });

      return tx.productBatch.delete({
        where: { id },
      });
    });
  }
}
