import prisma from '@/lib/prisma';
import { buildQueryOptions } from '../common/query-options';
import { options } from '@/lib/types/table';
export const Discount = {
  async getAll(queryOptions?: options) {
    const options = buildQueryOptions(queryOptions);
    const discounts = await prisma.discount.findMany({
      include: {
        discountRelations: true,
      },
      ...options,
    });
    console.log('Query options:', options);
    console.log('Query options:', options.where?.OR);

    const count = await prisma.discount.count();
    return {
      data: discounts,
      meta: {
        ...options,
        rowsCount: count,
      },
    };
  },

  async getById(id: string) {
    return await prisma.discount.findUnique({
      where: { id },
      include: {
        discountRelations: true,
      },
    });
  },

  async create(data: any) {
    return await prisma.discount.create({
      data,
    });
  },

  async update(id: string, data: any) {
    console.log('Updating discount with ID:', id, 'and data:', data);
    const existingDiscount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      throw new Error(`Discount with ID ${id} not found`);
    }

    // If it exists, proceed with the update
    return await prisma.discount.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return await prisma.discount.delete({
      where: { id },
    });
  },
};
export const DiscountRelation = {
  async getAll() {
    return await prisma.discountRelation.findMany();
  },
  async create(data: any) {
    return await prisma.discountRelation.create({
      data,
    });
  },

  async getByDiscountId(discountId: string) {
    return await prisma.discountRelation.findMany({
      where: { discountId },
    });
  },
};
