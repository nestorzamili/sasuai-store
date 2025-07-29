'use server';

import { TransactionService } from '@/lib/services/transaction.service';
import type {
  TransactionQueryParams,
  ApiResponse,
  TransactionListData,
  TransactionDetails,
} from '@/lib/services/transaction/types';

/**
 * Get transactions with pagination and filters
 */
export async function getPaginatedTransactions({
  page = 1,
  pageSize = 10,
  sortField = 'createdAt',
  sortDirection = 'desc',
  search = '',
  cashierId,
  memberId,
  paymentMethod,
  startDate,
  endDate,
  minAmount,
  maxAmount,
}: TransactionQueryParams): Promise<ApiResponse<TransactionListData>> {
  try {
    const result = await TransactionService.getTransactions({
      page,
      pageSize,
      sortField,
      sortDirection,
      search,
      cashierId,
      memberId,
      paymentMethod,
      startDate,
      endDate,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    });

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      success: false,
      error: 'Failed to fetch transactions',
    };
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(
  id: string,
): Promise<ApiResponse<TransactionDetails>> {
  try {
    const result = await TransactionService.getTransactionDetail(id);

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return {
      success: false,
      error: 'Failed to fetch transaction details',
    };
  }
}
