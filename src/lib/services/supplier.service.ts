import prisma from '@/lib/prisma';

export const SupplierService = {
  /**
   * Get all suppliers
   */
  async getAll() {
    return await prisma.supplier.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  },

  /**
   * Get all suppliers with stock-in count
   */
  async getAllWithStockInCount() {
    return await prisma.supplier.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            stockIns: true,
          },
        },
      },
    });
  },

  /**
   * Get supplier by ID
   */
  async getById(id: string) {
    return await prisma.supplier.findUnique({
      where: { id },
    });
  },

  /**
   * Create a new supplier
   */
  async create(data: { name: string; contact?: string }) {
    return await prisma.supplier.create({
      data,
    });
  },

  /**
   * Update a supplier
   */
  async update(id: string, data: { name?: string; contact?: string }) {
    return await prisma.supplier.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a supplier
   */
  async delete(id: string) {
    return await prisma.supplier.delete({
      where: { id },
    });
  },

  /**
   * Check if a supplier has stock-ins
   */
  async hasStockIns(id: string): Promise<boolean> {
    const count = await prisma.stockIn.count({
      where: {
        supplierId: id,
      },
    });
    return count > 0;
  },

  /**
   * Get supplier with their stock-ins
   */
  async getWithStockIns(id: string) {
    return await prisma.supplier.findUnique({
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
          orderBy: {
            date: 'desc',
          },
        },
      },
    });
  },
};
