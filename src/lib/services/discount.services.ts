import prisma from '@/lib/prisma';
import { buildQueryOptions } from '../common/query-options';
import { options } from '@/lib/types/table';
export const Discount = {
  async getAll(queryOptions?: options) {
    const options = buildQueryOptions(queryOptions);
    console.log('options', options);
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
        options.where ? { where: options.where } : undefined,
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
        discountMembers: true,
        discountProducts: true,
      },
    });
  },

  async create(data: any) {
    const { relation, ...discountData } = data;
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
    const { relation, ...discountData } = data;

    const existingDiscount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      throw new Error(`Discount with ID ${id} not found`);
    }

    return await prisma.$transaction(async (tx) => {
      // Handle case where empty relation array is provided (delete all relations)
      if (relation && relation.length === 0) {
        if (existingDiscount.discountType === 'product') {
          // Delete all product relations for this discount
          await tx.discountRelationProduct.deleteMany({
            where: { discountId: id },
          });
        } else if (existingDiscount.discountType === 'member') {
          // Delete all member relations for this discount
          await tx.discountRelationMember.deleteMany({
            where: { discountId: id },
          });
        }
      } else if (relation && relation.length > 0) {
        if (data.discountType === 'product') {
          // Get existing product relations for this discount
          const existingRelations = await tx.discountRelationProduct.findMany({
            where: { discountId: id },
          });

          // Extract existing product IDs for easy comparison
          const existingProductIds = existingRelations.map(
            (rel) => rel.productId,
          );

          // Find new relations to add
          const newRelations = relation.filter(
            (productId: string) => !existingProductIds.includes(productId),
          );

          // Find relations to delete (items in existing but not in new relation list)
          const relationsToDelete = existingProductIds.filter(
            (productId: string) => !relation.includes(productId),
          );

          // Add new relations
          if (newRelations.length > 0) {
            await tx.discountRelationProduct.createMany({
              data: newRelations.map((productId: string) => ({
                productId,
                discountId: id,
              })),
            });
          }

          // Delete relations that are no longer needed
          if (relationsToDelete.length > 0) {
            await tx.discountRelationProduct.deleteMany({
              where: {
                discountId: id,
                productId: { in: relationsToDelete },
              },
            });
          }
        } else if (data.discountType === 'member') {
          // Get existing member relations for this discount
          const existingRelations = await tx.discountRelationMember.findMany({
            where: { discountId: id },
          });

          // Extract existing member IDs for easy comparison
          const existingMemberIds = existingRelations.map(
            (rel) => rel.memberId,
          );

          // Find new relations to add
          const newRelations = relation.filter(
            (memberId: string) => !existingMemberIds.includes(memberId),
          );

          // Find relations to delete (items in existing but not in new relation list)
          const relationsToDelete = existingMemberIds.filter(
            (memberId: string) => !relation.includes(memberId),
          );

          // Add new relations
          if (newRelations.length > 0) {
            await tx.discountRelationMember.createMany({
              data: newRelations.map((memberId: string) => ({
                memberId,
                discountId: id,
              })),
            });
          }

          // Delete relations that are no longer needed
          if (relationsToDelete.length > 0) {
            await tx.discountRelationMember.deleteMany({
              where: {
                discountId: id,
                memberId: { in: relationsToDelete },
              },
            });
          }
        }
      }

      // Update the discount itself
      return await tx.discount.update({
        where: { id },
        data: discountData,
      });
    });
  },

  async delete(id: string) {
    return await prisma.discount.delete({
      where: { id },
    });
  },
  async setDiscountExpired(id: string) {
    return await prisma.discount.update({
      where: { id },
      data: {
        isActive: false,
      },
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
