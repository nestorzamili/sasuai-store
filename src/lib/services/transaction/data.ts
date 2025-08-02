import type { Transaction, DiscountType } from '@prisma/client';
import type {
  ValidatedCartItem,
  PreparedTransactionItem,
  TransactionSummary,
  TransactionData,
  DiscountInfo,
  GlobalDiscountInfo,
  PrismaTransactionContext,
} from './types';
import type { MemberData } from './member';

export class Data {
  // =====================
  // TRANSFORMATION METHODS
  // =====================

  /**
   * Transform validated cart items to prepared transaction items
   */
  static transformCartToPreparedItems(
    validatedCart: ValidatedCartItem[],
  ): PreparedTransactionItem[] {
    return validatedCart.map((item) => ({
      productId: item.productId,
      batchId: item.batchId,
      unitId: item.unitId,
      cost: item.buyPrice,
      quantity: item.quantity,
      discountId: item.discount?.id || null,
      discountValue: item.discount?.value || null,
      discountValueType: item.discount?.valueType || null,
      basicPrice: item.basicPrice,
      subtotal: item.subtotal,
    }));
  }

  /**
   * Calculate transaction totals
   */
  static calculateTransactionTotals(validatedCart: ValidatedCartItem[]): {
    subtotal: number;
    totalDiscountAmount: number;
    total: number;
  } {
    const subtotal = validatedCart.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const totalDiscountAmount = validatedCart.reduce((sum, item) => {
      if (item.discount) {
        return (
          sum +
          (item.basicPrice * item.quantity -
            item.discountedPrice * item.quantity)
        );
      }
      return sum;
    }, 0);
    const total = subtotal;

    return { subtotal, totalDiscountAmount, total };
  }

  /**
   * Create transaction summary for response
   */
  static createTransactionSummary(
    validatedCart: ValidatedCartItem[],
    member: MemberData | null,
    globalDiscountCode?: string | null,
  ): TransactionSummary {
    const { subtotal, totalDiscountAmount, total } =
      this.calculateTransactionTotals(validatedCart);

    // Determine discount source and info
    let discountSource: 'member' | 'tier' | 'global' | null = null;
    let memberDiscount: DiscountInfo | null = null;
    let globalDiscount: GlobalDiscountInfo | null = null;

    // Check if any item has a discount to determine source
    const discountedItem = validatedCart.find((item) => item.discount);
    if (discountedItem?.discount) {
      if (globalDiscountCode) {
        discountSource = 'global';
        globalDiscount = {
          id: discountedItem.discount.id,
          value: discountedItem.discount.value,
          type: discountedItem.discount.valueType,
          amount: totalDiscountAmount,
          code: globalDiscountCode,
        };
      } else if (
        member?.discounts.some((d) => d.id === discountedItem.discount?.id)
      ) {
        discountSource = 'member';
        memberDiscount = {
          id: discountedItem.discount.id,
          value: discountedItem.discount.value,
          type: discountedItem.discount.valueType,
          amount: totalDiscountAmount,
        };
      } else {
        // Assume tier discount if not member or global
        discountSource = 'tier';
        memberDiscount = {
          id: discountedItem.discount.id,
          value: discountedItem.discount.value,
          type: discountedItem.discount.valueType,
          amount: totalDiscountAmount,
        };
      }
    }

    return {
      subtotal,
      member: member
        ? {
            id: member.id,
            name: member.name,
            tierId: member.tierId,
            tierName: member.tier?.name || null,
            discount: memberDiscount,
          }
        : null,
      globalDiscount,
      discountSource,
      finalAmount: total,
    };
  }

  // =====================
  // RECORD CREATION METHODS
  // =====================

  /**
   * Create transaction record in database
   */
  static async createTransactionRecord(
    tx: PrismaTransactionContext,
    tranId: string,
    data: TransactionData,
    transactionData: TransactionSummary,
    paymentAmount: number,
    change: number,
    items: PreparedTransactionItem[],
    discountInfo: { id: string | null; amount: number | null },
  ): Promise<Transaction> {
    return tx.transaction.create({
      data: {
        tranId,
        cashierId: data.cashierId,
        memberId: transactionData.member?.id || null,
        discountId: discountInfo.id,
        discountAmount: discountInfo.amount,
        totalAmount: transactionData.subtotal,
        finalAmount: transactionData.finalAmount,
        paymentMethod: data.paymentMethod,
        paymentAmount,
        change,
        items: {
          create: items.map((item) => ({
            batchId: item.batchId,
            quantity: item.quantity,
            unitId: item.unitId,
            cost: item.cost,
            pricePerUnit: item.basicPrice,
            discountId: item.discountId,
            discountAmount: this.calculateDiscountAmount(
              item.basicPrice,
              item.quantity,
              item.discountValue,
              item.discountValueType,
            ),
            subtotal: item.subtotal,
          })),
        },
      },
    });
  }

  /**
   * Generate unique transaction ID
   */
  static generateTransactionId(): string {
    return `T${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  // =====================
  // HELPER METHODS
  // =====================

  /**
   * Calculate discount amount for transaction item
   */
  private static calculateDiscountAmount(
    price: number,
    quantity: number,
    discountValue: number | null,
    discountType: DiscountType | null,
  ): number | null {
    if (!discountValue || !discountType) return null;

    const totalPrice = price * quantity;
    if (discountType === 'PERCENTAGE') {
      return (discountValue * totalPrice) / 100;
    }
    if (discountType === 'FIXED_AMOUNT') {
      return discountValue * quantity;
    }
    return null;
  }
}
