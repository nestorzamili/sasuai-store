import prisma from '@/lib/prisma';
import { buildQueryOptions, QueryOptions } from '@/lib/common/query-options';

export const Discount = {
  async getAll(options: QueryOptions) {
    const queryOptions = buildQueryOptions(options);
    const discounts = await prisma.discount.findMany(queryOptions);
    const total = await prisma.discount.count({ where: queryOptions.where });
    return { discounts, total };
  },

  async getById(id: string) {
    return await prisma.discount.findUnique({
      where: { id },
    });
  },

  async create(data: any) {
    return await prisma.discount.create({
      data,
    });
  },

  async update(id: string, data: any) {
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
