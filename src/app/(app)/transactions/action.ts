'use server';

import { revalidatePath } from 'next/cache';
import { TransactionService } from '@/lib/services/transaction.service';
import { z } from 'zod';
import {
  CreateTransactionData,
  TransactionPaginationParams,
} from '@/lib/types/transaction';

// Transaction schema for validation
const transactionItemSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitId: z.string().min(1, 'Unit is required'),
  pricePerUnit: z.number().min(0, 'Price must be a positive number'),
  discountId: z.string().nullable().optional(),
  subtotal: z.number().min(0, 'Subtotal must be a positive number'),
});

const transactionSchema = z.object({
  cashierId: z.string().min(1, 'Cashier is required'),
  memberId: z.string().nullable().optional(),
  totalAmount: z.number().min(0, 'Total amount must be a positive number'),
  discountAmount: z
    .number()
    .min(0, 'Discount amount must be a positive number'),
  finalAmount: z.number().min(0, 'Final amount must be a positive number'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  items: z.array(transactionItemSchema).min(1, 'At least one item is required'),
});

/**
 * Create a new transaction
 */
export async function createTransaction(data: CreateTransactionData) {
  try {
    // // Validate data
    // const validatedData = transactionSchema.parse(data);

    // // Create transaction
    // const transaction = await TransactionService.create(validatedData);

    // // Revalidate transactions page
    // revalidatePath('/transaction');

    return {
      success: true,
      // data: transaction,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    console.error('Transaction creation error:', error);
    return {
      success: false,
      error: 'Failed to create transaction',
    };
  }
}

/**
 * Get paginated transactions with filters and sorting
 */
export async function getPaginatedTransactions(
  params: TransactionPaginationParams
) {
  try {
    const result = await TransactionService.getPaginated({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortField: params.sortField || 'createdAt',
      sortDirection: params.sortDirection || 'desc',
      search: params.search || '',
      cashierId: params.cashierId,
      memberId: params.memberId,
      paymentMethod: params.paymentMethod,
      startDate: params.startDate,
      endDate: params.endDate,
      minAmount: params.minAmount,
      maxAmount: params.maxAmount,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching paginated transactions:', error);
    return {
      success: false,
      error: 'Failed to fetch paginated transactions',
    };
  }
}

/**
 * Get a transaction by ID with all relations
 */
export async function getTransaction(id: string) {
  try {
    const transaction = await TransactionService.getById(id);

    if (!transaction) {
      return {
        success: false,
        error: 'Transaction not found',
      };
    }

    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return {
      success: false,
      error: 'Failed to fetch transaction',
    };
  }
}

/**
 * Get transactions for a specific member
 */
export async function getMemberTransactions(memberId: string) {
  try {
    const transactions = await TransactionService.getByMember(memberId);

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error('Error fetching member transactions:', error);
    return {
      success: false,
      error: 'Failed to fetch member transactions',
    };
  }
}

/**
 * Get transactions by date range
 */
export async function getTransactionsByDateRange(
  startDate: Date,
  endDate: Date
) {
  try {
    const transactions = await TransactionService.getByDateRange(
      startDate,
      endDate
    );

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    return {
      success: false,
      error: 'Failed to fetch transactions by date range',
    };
  }
}

/**
 * Get transaction summary for dashboard
 */
export async function getTransactionSummary(days: number = 30) {
  try {
    const summary = await TransactionService.getSummary(days);

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return {
      success: false,
      error: 'Failed to fetch transaction summary',
    };
  }
}

/**
 * Void a transaction (cancel it)
 */
export async function voidTransaction(id: string, reason: string) {
  try {
    const result = await TransactionService.voidTransaction(id, reason);

    // Revalidate transactions page
    revalidatePath('/transaction');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error voiding transaction:', error);
    return {
      success: false,
      error: 'Failed to void transaction',
    };
  }
}

/**
 * Get all transactions (for admin/reporting purposes)
 */
export async function getAllTransactions() {
  try {
    const transactions = await TransactionService.getAll();

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return {
      success: false,
      error: 'Failed to fetch all transactions',
    };
  }
}

/**
 * Get available product batches for transactions
 */
export async function getAvailableBatches(search: string = '') {
  try {
    const batches = await TransactionService.getAvailableProductBatches(search);

    return {
      success: true,
      data: batches,
    };
  } catch (error) {
    console.error('Error fetching available batches:', error);
    return {
      success: false,
      error: 'Failed to fetch available product batches',
    };
  }
}
