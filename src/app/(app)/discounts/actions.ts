'use server';
import { Discount } from '@/lib/services/discount.services';

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
