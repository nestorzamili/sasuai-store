'use server';

import { TransactionService } from '@/lib/services/transaction.service';
import {
  TransactionPaginationParams,
  TransactionPaginationResult,
  GetTransactionsResponse,
  GetTransactionByIdResponse,
} from '@/lib/types/transaction';

/**
 * Get paginated transactions with filtering options
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
}: TransactionPaginationParams): Promise<GetTransactionsResponse> {
  try {
    // Input validation
    if (page < 1) {
      return {
        success: false,
        error: 'Page number must be greater than 0',
      };
    }

    const result: TransactionPaginationResult =
      await TransactionService.getPaginated({
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
      success: true,
      data: result.transactions,
      pagination: result.pagination,
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
): Promise<GetTransactionByIdResponse> {
  try {
    const result = await TransactionService.getTransactionById(id);

    return {
      success: result.success !== false,
      data: result.transactionDetails,
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
