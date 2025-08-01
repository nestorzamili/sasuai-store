import { Validation } from './discount/validation';
import { Data } from './discount/data';
import { GetDiscount } from './discount/get-discount';
import type {
  DiscountData,
  DiscountPaginationParams,
  ApiResponse,
  DiscountWithRelations,
  DiscountListData,
  DiscountValidationParams,
} from './discount/types';

export class DiscountService {
  static async createDiscount(
    data: DiscountData,
  ): Promise<ApiResponse<DiscountWithRelations>> {
    try {
      const validation = await Validation.validateDiscount(data);
      if (!validation.success) {
        return {
          success: false,
          message: validation.message,
        };
      }

      const discount = await Data.createDiscount(data);

      return {
        success: true,
        message: 'Discount created successfully',
        data: discount,
      };
    } catch (error) {
      console.error('Create discount error:', error);
      return {
        success: false,
        message: 'Failed to create discount',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getDiscounts(
    params: DiscountPaginationParams,
  ): Promise<ApiResponse<DiscountListData>> {
    return GetDiscount.getDiscounts(params);
  }

  static async getDiscountById(id: string) {
    return GetDiscount.getById(id);
  }

  static async getGlobalDiscountByCode(params: DiscountValidationParams) {
    try {
      if (!params.code || !params.totalAmount) {
        return {
          success: false,
          message: 'Discount code and total amount are required',
        };
      }

      return await Validation.validateDiscountCode(params);
    } catch (error) {
      console.error('Get global discount by code error:', error);
      return {
        success: false,
        message: 'Failed to validate discount code',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getMemberTiers(search?: string) {
    return GetDiscount.getMemberTiers(search);
  }

  static async getMembers(search?: string) {
    return GetDiscount.getMembers(search);
  }

  // UPDATE operations
  static async updateDiscount(
    id: string,
    data: Partial<DiscountData>,
  ): Promise<ApiResponse<DiscountWithRelations>> {
    try {
      const existingDiscount = await GetDiscount.getById(id);
      if (!existingDiscount.success || !existingDiscount.data) {
        return {
          success: false,
          message: 'Discount not found',
        };
      }

      const usageCheck = await Validation.validateDiscountUsage(id);
      if (
        usageCheck.hasUsage &&
        (data.type !== undefined || data.value !== undefined)
      ) {
        return {
          success: false,
          message:
            'Cannot update type or value of a discount that has been used in transactions',
        };
      }

      const updatedDiscount = await Data.updateDiscount(id, data);

      return {
        success: true,
        message: 'Discount updated successfully',
        data: updatedDiscount,
      };
    } catch (error) {
      console.error('Update discount error:', error);
      return {
        success: false,
        message: 'Failed to update discount',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async deleteDiscount(id: string) {
    try {
      const usageCheck = await Validation.validateDiscountUsage(id);
      if (!usageCheck.success) {
        return {
          success: false,
          message: usageCheck.message || 'Failed to validate discount usage',
        };
      }

      if (usageCheck.hasUsage) {
        return {
          success: false,
          message:
            'Cannot delete a discount that has been used in transactions',
        };
      }

      await Data.delete(id);

      return {
        success: true,
        message: 'Discount deleted successfully',
      };
    } catch (error) {
      console.error('Delete discount error:', error);
      return {
        success: false,
        message: 'Failed to delete discount',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
