'use server';
import { Discount, DiscountRelation } from '@/lib/services/discount.services';
import { DiscountRelationInterface } from '@/lib/types/discount';
import { ProductService } from '@/lib/services/product.service';
import { MemberService } from '@/lib/services/member.service';
import { options } from '@/lib/types/table';

export const getAllDiscounts = async (options?: options) => {
  try {
    const discount = await Discount.getAll(options);
    return {
      success: true,
      data: discount.data,
      meta: discount.meta,
    };
  } catch (error) {
    throw error;
  }
};

export const getDiscountById = async (id: string) => {
  try {
    const discount = await Discount.getById(id);
    return {
      success: true,
      data: discount,
    };
  } catch (error) {
    throw error;
  }
};

export const createDiscount = async (data: any) => {
  try {
    const discount = await Discount.create(data);
    return {
      success: true,
      data: discount,
    };
  } catch (error) {
    throw error;
  }
};

export async function updateDiscount(id: string, data: any) {
  try {
    const updatedDiscount = await Discount.update(id, data);
    return { success: true, data: updatedDiscount };
  } catch (error) {
    console.error('Error updating discount:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while updating the discount',
    };
  }
}

export const deleteDiscount = async (id: string) => {
  try {
    const discount = await Discount.delete(id);
    return {
      success: true,
      data: discount,
    };
  } catch (error) {
    throw error;
  }
};
export const createDiscountRelation = async (
  data: DiscountRelationInterface
) => {
  try {
    const discountRelation = await DiscountRelation.create(data);
    return {
      success: true,
      data: discountRelation,
    };
  } catch (error) {
    throw error;
  }
};
export const getDiscountRelationByDiscountId = async (discountId: string) => {
  try {
    const discountRelation = await DiscountRelation.getByDiscountId(discountId);
    return {
      success: true,
      data: discountRelation,
    };
  } catch (error) {
    throw error;
  }
};
export const deleteDiscountRelation = async (id: string) => {};
export const getRelation = async ({ type }: { type: string }) => {
  if (type === 'product') {
    try {
      const products = await ProductService.getAll();
      return {
        success: true,
        data: products,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  } else {
    try {
      const members = await MemberService.getAll();
      return {
        success: true,
        data: members,
      };
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }
};
