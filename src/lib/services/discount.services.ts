import prisma from '@/lib/prisma';
export const Discount = {
  async getAll() {
    const discounts = await prisma.discount.findMany({
      include: {
        discountRelations: true,
      },
    });
    return discounts;
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
