'use server';
import { Discount } from '@/lib/services/discount.services';
import { DiscountInterface } from '@/lib/types/discount';
export const getAllDiscounts = async () => {
  try {
    const discount = await Discount.getAll();
    return {
      success: true,
      data: discount,
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
