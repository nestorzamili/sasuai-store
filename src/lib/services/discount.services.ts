import prisma from '@/lib/prisma';
export const Discount = {
  async getAll() {
    const discounts = await prisma.discount.findMany();
    return discounts;
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
