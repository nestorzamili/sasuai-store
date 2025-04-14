import prisma from '@/lib/prisma';
import { buildQueryOptions } from '../common/query-options';
import { options } from '@/lib/types/table';
export const Discount = {
  async getAll(queryOptions?: options) {
    const options = buildQueryOptions(queryOptions);
    // Run both queries in parallel for better performance
    const [discounts, count] = await Promise.all([
      prisma.discount.findMany({
        include: {
          discountRelations: true,
        },
        ...options,
      }),
      prisma.discount.count(
        options.where ? { where: options.where } : undefined
      ),
    ]);

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
    const { relation, ...discountData } = data;
    console.log('Creating discount with data:', data);
    // console.log('Relation:', relation);
    return await prisma.$transaction(async (prisma) => {
      // Step 1: Create the discount entry
      const createdDiscount = await prisma.discount.create({
        data: discountData,
      });

      // Step 2: Handle relations (if provided)
      if (relation?.length) {
        const relationData = relation.map((relation: any) => ({
          discountId: createdDiscount.id,
          ...relation, // This assumes the relation object contains `productId` or `memberId`
        }));

        if (discountData.discountType === 'product') {
          await prisma.discountRelationProduct.createMany({
            data: relationData,
          });
        } else if (discountData.discountType === 'member') {
          await prisma.discountRelationMember.createMany({
            data: relationData,
          });
        }
      }

      return createdDiscount;
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
