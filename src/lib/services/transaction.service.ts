import { Validation } from './transaction/validation';
import { Data } from './transaction/data';
import { Inventory } from './transaction/inventory';
import { MemberService } from './transaction/member';
import { Discount } from './transaction/discount';
import { GetTransaction } from './transaction/get-transaction';
import prisma from '@/lib/prisma';
import type {
  Cart,
  TransactionData,
  ValidatedCartItem,
  ValidationResult,
  PaymentValidationResult,
  TransactionSummary,
  TransactionQueryParams,
  TransactionExecutionResult,
  MemberBanCheckResult,
} from './transaction/types';

export class TransactionService {
  /**
   * Process complete transaction - Main entry point
   */
  static async processTransaction(
    data: TransactionData,
  ): Promise<TransactionExecutionResult> {
    try {
      // ===== 1: CART VALIDATION =====
      const cartItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedDiscountId: item.discountId,
      }));

      const validatedCartResult = await this.validateCart(cartItems);
      if (!validatedCartResult.success || !validatedCartResult.data) {
        return {
          success: false,
          message: validatedCartResult.message,
        };
      }

      // ===== 2: MEMBER VALIDATION =====
      if (data.memberId) {
        const memberCheck = await this.validateMemberStatus(data.memberId);
        if (!memberCheck.success) {
          return {
            success: false,
            message: memberCheck.message,
          };
        }
      }

      // ===== 3: TRANSACTION VALIDATION =====
      const validatedTransactionResult = await this.validateTransaction(
        validatedCartResult.data,
        data.memberId,
        data.selectedMemberDiscountId,
        data.selectedTierDiscountId,
        data.globalDiscountCode,
      );

      if (
        !validatedTransactionResult.success ||
        !validatedTransactionResult.data
      ) {
        return {
          success: false,
          message: 'Failed to validate transaction',
        };
      }

      const transactionSummary = validatedTransactionResult.data;
      const finalAmount = transactionSummary.finalAmount;

      // ===== 4: PAYMENT VALIDATION =====
      const paymentCheck = await this.validatePayment(
        data.paymentMethod,
        data.cashAmount,
        finalAmount,
      );

      if (!paymentCheck.success) {
        return {
          success: false,
          message: paymentCheck.message,
        };
      }

      const change = paymentCheck.change || 0;

      // ===== 5: DATABASE EXECUTION =====
      const validatedCart = validatedCartResult.data;
      return await prisma.$transaction(async (tx) => {
        // 6 - Get member data if needed
        let member: Awaited<ReturnType<typeof MemberService.getWithRelations>> =
          null;
        if (data.memberId) {
          member = await MemberService.getWithRelations(data.memberId);
          if (!member) {
            throw new Error('Member not found');
          }
        }

        // 7 - Transform and prepare data
        const preparedItems = Data.transformCartToPreparedItems(validatedCart);
        const tranId = await Data.generateTransactionId(tx);
        const discountInfo = {
          id:
            transactionSummary.globalDiscount?.id ||
            transactionSummary.member?.discount?.id ||
            null,
          amount:
            transactionSummary.globalDiscount?.amount ||
            transactionSummary.member?.discount?.amount ||
            null,
        };

        // 8 - Create transaction record
        const transaction = await Data.createTransactionRecord(
          tx,
          tranId,
          data,
          transactionSummary,
          data.cashAmount || transactionSummary.finalAmount,
          change,
          preparedItems,
          discountInfo,
        );

        // 9 - Update inventory (reduce stock)
        await Inventory.updateStock(tx, preparedItems);

        // 10 - Process member points and tier advancement
        if (member && member.tier) {
          await MemberService.processPoints(
            tx,
            member,
            transactionSummary.finalAmount,
            member.tier.multiplier,
          );
        }

        // 11 - Update discount usage counters
        await Discount.incrementUsages(tx, validatedCart);

        return {
          success: true,
          data: transaction,
          finalAmount: transactionSummary.finalAmount,
          cashAmount: data.cashAmount || transactionSummary.finalAmount,
          change,
          message: 'Transaction completed successfully',
        };
      });
    } catch (error) {
      console.error('Transaction processing error:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Transaction execution failed',
      };
    }
  }

  /**
   * Validates cart items and returns validated cart data
   */
  static async validateCart(
    data: Cart,
  ): Promise<ValidationResult<ValidatedCartItem[]>> {
    return Validation.validateCart(data);
  }

  /**
   * Validates transaction totals, member, and discounts
   */
  static async validateTransaction(
    validatedCart: ValidatedCartItem[],
    memberId: string | null | undefined = null,
    selectedMemberDiscountId: string | null = null,
    selectedTierDiscountId: string | null = null,
    globalDiscountCode: string | null = null,
  ): Promise<ValidationResult<TransactionSummary>> {
    return Validation.validateTransaction(
      validatedCart,
      memberId,
      selectedMemberDiscountId,
      selectedTierDiscountId,
      globalDiscountCode,
    );
  }

  /**
   * Check if member is banned
   */
  static async validateMemberStatus(
    memberId: string,
  ): Promise<MemberBanCheckResult> {
    return Validation.validateMemberStatus(memberId);
  }

  /**
   * Validates payment method and amounts
   */
  static async validatePayment(
    paymentMethod: string,
    cashAmount?: number,
    finalAmount?: number,
  ): Promise<PaymentValidationResult> {
    return Validation.validatePayment(paymentMethod, cashAmount, finalAmount);
  }

  /**
   * Get transactions with filters and sorting
   */
  static async getTransactions(params: TransactionQueryParams) {
    return GetTransaction.getTransactions(params);
  }

  /**
   * Get transaction details by ID
   */
  static async getTransactionDetail(id: string) {
    return GetTransaction.getTransactionDetail(id);
  }
}
