import prisma from '@/lib/prisma';
import { buildQueryOptions } from '../common/query-options';
import { options } from '@/lib/types/table';
import { error } from 'console';
export const Discount = {
  async getAll(queryOptions?: options) {
    const options = buildQueryOptions(queryOptions);
    // Run both queries in parallel for better performance
    const [discounts, count] = await Promise.all([
      prisma.discount.findMany({
        include: {
          discountRelations: true,
          discountMembers: true,
          discountProducts: true,
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
    console.log('Diskon Data', discountData);
    console.log('Relation:', relation);

    return await prisma.$transaction(async (prisma) => {
      // Step 1: Create the discount entry
      const createdDiscount = await prisma.discount.create({
        data: discountData,
      });

      // Step 2: Handle relations (if provided)
      if (relation && relation.length > 0) {
        const dataRelation = relation.map((item: any) => {
          return {
            ...(createdDiscount.discountType === 'product'
              ? { productId: item }
              : { memberId: item }),
            discountId: createdDiscount.id,
          };
        });
        if (createdDiscount.discountType === 'product') {
          await prisma.discountRelationProduct.createMany({
            data: dataRelation,
          });
        }
        if (createdDiscount.discountType === 'member') {
          await prisma.discountRelationMember.createMany({
            data: dataRelation,
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
