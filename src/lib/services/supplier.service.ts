import prisma from '@/lib/prisma';

export class SupplierService {
  /**
   * Get all suppliers
   */
  static async getAll() {
    return prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all suppliers with stock-in count
   */
  static async getAllWithStockInCount() {
    return prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            stockIns: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a supplier by ID
   */
  static async getById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
    });
  }

  /**
   * Get supplier details with stock-in history
   */
  static async getWithStockIns(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        stockIns: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
            unit: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  /**
   * Create a new supplier
   */
  static async create(data: { name: string; contact?: string }) {
    return prisma.supplier.create({
      data,
    });
  }

  /**
   * Update a supplier
   */
  static async update(id: string, data: { name?: string; contact?: string }) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  /**
   * Check if a supplier can be deleted
   */
  static async canDelete(id: string): Promise<boolean> {
    const stockInCount = await prisma.stockIn.count({
      where: { supplierId: id },
    });

    return stockInCount === 0;
  }

  /**
   * Delete a supplier
   */
  static async delete(id: string) {
    const canDelete = await this.canDelete(id);

    if (!canDelete) {
      throw new Error(
        'Cannot delete a supplier with associated stock-in records',
      );
    }

    return prisma.supplier.delete({
      where: { id },
    });
  }
}
