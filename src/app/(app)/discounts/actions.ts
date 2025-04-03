'use server';
import { Discount } from '@/lib/services/discount.services';

export const getAllDiscounts = async () => {
  try {
    const discount = await Discount.getAll({ page: 2, pageSize: 3 });
    return {
      success: true,
      data: discount,
    };
  } catch (error) {
    throw error;
  }
};
