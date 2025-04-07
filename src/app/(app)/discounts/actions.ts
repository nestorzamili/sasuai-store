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

export const updateDiscount = async (id: string, data: any) => {
  try {
    const discount = await Discount.update(id, data);
    return {
      success: true,
      data: discount,
    };
  } catch (error) {
    throw error;
  }
};

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
