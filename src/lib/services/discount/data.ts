import prisma from '@/lib/prisma';
import { DiscountApplyTo } from './types';
import type { DiscountData, DiscountWithRelations } from './types';

export class Data {
  static generateDiscountCode(name: string): string {
    const baseCode = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .padEnd(2, 'X')
      .substring(0, 2);

    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `${baseCode}${randomSuffix}`;
  }

  static async createDiscount(
    data: DiscountData,
  ): Promise<DiscountWithRelations> {
    const { productIds, memberIds, memberTierIds, ...discountData } = data;

    // Only generate code for global discounts
    if (discountData.isGlobal) {
      discountData.code = this.generateDiscountCode(discountData.name);
      discountData.applyTo = DiscountApplyTo.ALL;
    } else {
      // Non-global discounts don't need a code
      discountData.code = null;
    }

    const discount = await prisma.discount.create({
      data: {
        ...discountData,
        ...(productIds &&
        productIds.length > 0 &&
        !discountData.isGlobal &&
        data.applyTo === 'SPECIFIC_PRODUCTS'
          ? {
              products: {
                connect: productIds.map((id) => ({ id })),
              },
            }
          : {}),
        ...(memberIds &&
        memberIds.length > 0 &&
        data.applyTo === 'SPECIFIC_MEMBERS'
          ? {
              members: {
                connect: memberIds.map((id) => ({ id })),
              },
            }
          : {}),
        ...(memberTierIds &&
        memberTierIds.length > 0 &&
        data.applyTo === 'SPECIFIC_MEMBER_TIERS'
          ? {
              memberTiers: {
                connect: memberTierIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            barcode: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            tier: { select: { name: true } },
          },
        },
        memberTiers: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            multiplier: true,
          },
        },
      },
    });

    return discount as DiscountWithRelations;
  }

  static async updateDiscount(
    id: string,
    data: Partial<DiscountData>,
  ): Promise<DiscountWithRelations> {
    // Handle global discount logic
    if (data.isGlobal === true) {
      data.applyTo = DiscountApplyTo.ALL;
      // Generate code if it doesn't exist for global discount
      if (!data.code) {
        data.code = this.generateDiscountCode(data.name || 'DISCOUNT');
      }
    } else if (data.isGlobal === false) {
      // Remove code for non-global discounts
      data.code = null;
    }

    const { productIds, memberIds, memberTierIds, ...discountUpdateData } =
      data;

    const productsUpdate =
      productIds !== undefined && data.applyTo === 'SPECIFIC_PRODUCTS'
        ? { products: { set: productIds.map((id) => ({ id })) } }
        : {};

    const membersUpdate =
      memberIds !== undefined && data.applyTo === 'SPECIFIC_MEMBERS'
        ? { members: { set: memberIds.map((id) => ({ id })) } }
        : {};

    const memberTiersUpdate =
      memberTierIds !== undefined && data.applyTo === 'SPECIFIC_MEMBER_TIERS'
        ? { memberTiers: { set: memberTierIds.map((id) => ({ id })) } }
        : {};

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        ...discountUpdateData,
        ...productsUpdate,
        ...membersUpdate,
        ...memberTiersUpdate,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            barcode: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            tier: { select: { name: true } },
          },
        },
        memberTiers: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            multiplier: true,
          },
        },
      },
    });

    return updatedDiscount as DiscountWithRelations;
  }

  static async delete(id: string) {
    return await prisma.discount.delete({
      where: { id },
    });
  }
}
