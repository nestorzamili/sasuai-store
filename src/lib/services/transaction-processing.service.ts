import { Cart } from '../types/transaction-process';
import prisma from '@/lib/prisma';
import { calculateMemberPoints } from './setting.service';
import { errorHandling } from '../common/response-formatter';
interface TransactionData {
  cashierId: string;
  memberId?: string | null;
  selectedMemberDiscountId: string | null;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  discountAmount?: number;
  cashAmount?: number;
  items: {
    productId: string;
    quantity: number;
    unitId: string;
    cost: number;
    pricePerUnit: number;
    subtotal: number;
    batchId: string; // Added batchId field
    discountId?: string | null;
  }[];
}

export class TransactionProcessingService {
  static async validationCart(data: Cart) {
    // Ambil semua productId dari cart
    const productIds = data.map((item) => item.productId);
    // Query untuk mendapatkan data produk sekaligus (batching)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        batches: true,
        unit: true,
        discountRelationProduct: {
          include: {
            discount: true,
          },
        },
      },
    });

    const validatedItems = [];
    let hasErrors = false;

    // Process each cart item
    for (const cartItem of data) {
      const product = products.find((p) => p.id === cartItem.productId);

      // Skip if product doesn't exist
      if (!product) {
        hasErrors = true;
        continue;
      }

      // Check product availability
      if (product.currentStock <= 0 || !product.isActive) {
        hasErrors = true;
        continue;
      }

      // Check batch expiry
      const hasBatchExpired = product.batches.some((batch) => {
        const today = new Date();
        const expireDate = new Date(batch.expiryDate);
        return expireDate < today;
      });

      if (hasBatchExpired) {
        hasErrors = true;
        continue;
      }

      // Calculate discount if applicable
      let value = 0;
      let valueType = null;
      let discountId = null;

      if (cartItem.selectedDiscountId) {
        // Use selected discount if provided
        const discountRelation = product.discountRelationProduct.find(
          (dr) => dr.discountId === cartItem.selectedDiscountId,
        );

        if (discountRelation && discountRelation.discount) {
          value = discountRelation.discount.value;
          valueType = discountRelation.discount.valueType;
          discountId = discountRelation.discountId;
        }
      } else {
        // If no discount is selected, get the first available discount
        if (
          product.discountRelationProduct &&
          product.discountRelationProduct.length > 0
        ) {
          const firstDiscount = product.discountRelationProduct[0];
          if (firstDiscount && firstDiscount.discount) {
            value = firstDiscount.discount.value;
            valueType = firstDiscount.discount.valueType;
            discountId = firstDiscount.discountId;
          }
        }
      }

      // Calculate final price and subtotal
      let finalPrice = product.price;
      if (valueType === 'percentage') {
        finalPrice = product.price - (value * product.price) / 100;
      } else if (valueType === 'flat') {
        finalPrice = product.price - value;
      }

      const subtotal = finalPrice * cartItem.quantity;

      // Add to validated items
      // Find the first batch with remaining quantity > 0
      const validBatch = product.batches.find(
        (batch) => batch.remainingQuantity > 0,
      );

      if (!validBatch) {
        hasErrors = true;
        continue;
      }

      validatedItems.push({
        productId: product.id,
        batchId: validBatch.id,
        unitId: product.unitId,
        basicPrice: product.price,
        buyPrice: validBatch.buyPrice,
        quantity: cartItem.quantity,
        discount: value
          ? {
              id: discountId,
              value: value,
              type: valueType,
            }
          : null,
        discountedPrice: finalPrice,
        subtotal,
      });
    }

    return {
      success: !hasErrors && validatedItems.length > 0,
      message: hasErrors
        ? 'Some items could not be validated'
        : validatedItems.length === 0
        ? 'No valid items in cart'
        : 'Validation successful',
      data: validatedItems,
    };
  }

  static async validationTransaction(
    validatedCart: any,
    memberId: string | null | undefined = null,
    selectedMemberDiscountId: string | null = null,
  ) {
    // Calculate subtotal from all cart items
    const subtotal = validatedCart.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0,
    );

    // Initialize member discount variables
    let memberDiscount = 0;
    let memberDiscountType = null;
    let memberDiscountValue = 0;
    let memberName = null;
    let memberDiscountId = null;

    // Check if member exists and has discount
    if (memberId) {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
          discountRelationsMember: {
            include: {
              discount: true,
            },
          },
        },
      });

      if (member) {
        memberName = member.name;

        // Get member's discount if available and a specific discount ID is provided
        if (
          selectedMemberDiscountId &&
          member.discountRelationsMember &&
          member.discountRelationsMember.length > 0
        ) {
          // Find the specific discount that matches the selected ID
          const discountRelation = member.discountRelationsMember.find(
            (dr) => dr.discountId === selectedMemberDiscountId,
          );

          if (discountRelation && discountRelation.discount) {
            memberDiscountType = discountRelation.discount.valueType;
            memberDiscountValue = discountRelation.discount.value;
            memberDiscountId = discountRelation.discountId;

            // Calculate member discount amount
            if (memberDiscountType === 'percentage') {
              memberDiscount = (memberDiscountValue * subtotal) / 100;
            } else if (memberDiscountType === 'flat') {
              memberDiscount = memberDiscountValue;
            }
          }
        }
      }
    }

    // Calculate final amount after member discount
    const finalAmount = subtotal - memberDiscount;

    return {
      success: true,
      data: {
        subtotal,
        member: memberId
          ? {
              id: memberId,
              name: memberName,
              discount:
                memberDiscount > 0
                  ? {
                      id: memberDiscountId,
                      value: memberDiscountValue,
                      type: memberDiscountType,
                      amount: memberDiscount,
                    }
                  : null,
            }
          : null,
        finalAmount,
      },
    };
  }

  static async checkPaymentMethod(
    paymentMethod: string,
    cashAmount?: number,
    finalAmount?: number,
  ) {
    // Check if payment method is cash
    if (paymentMethod.toLowerCase() === 'cash') {
      // Validate cashAmount is provided when payment method is cash
      if (!cashAmount || cashAmount <= 0) {
        return {
          success: false,
          message: 'Cash payment requires a valid cash amount',
        };
      }

      // Validate finalAmount is provided
      if (!finalAmount || finalAmount < 0) {
        return {
          success: false,
          message: 'Final amount is required and must be a positive number',
        };
      }

      // Calculate change for cash payment
      const calculatedChange = cashAmount - finalAmount;

      // Validate that cash amount is sufficient
      if (calculatedChange < 0) {
        return {
          success: false,
          message: 'Cash amount is insufficient',
          change: 0,
        };
      }

      return {
        success: true,
        change: calculatedChange,
        message: 'Cash payment validated successfully',
      };
    } else {
      // For non-cash payments
      if (!finalAmount || finalAmount < 0) {
        return {
          success: false,
          message: 'Final amount is required and must be a positive number',
        };
      }

      return {
        success: true,
        change: 0,
        message: `${paymentMethod} payment validated successfully`,
      };
    }
  }

  static async processTransaction(data: TransactionData) {
    try {
      // First validate the cart
      const cartItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedDiscountId: item.discountId,
      }));
      const validatedCartResult = await this.validationCart(cartItems);
      if (!validatedCartResult.success) {
        return {
          success: false,
          message: validatedCartResult.message,
        };
      }

      // Validate the transaction (calculate totals and member discount)
      const validatedTransactionResult = await this.validationTransaction(
        validatedCartResult.data,
        data.memberId,
        data.selectedMemberDiscountId,
      );

      if (!validatedTransactionResult.success) {
        return {
          success: false,
          message: 'Failed to validate transaction',
        };
      }

      // Use validated data for totals
      const validatedData = validatedTransactionResult.data;
      const finalAmount = validatedData.finalAmount;
      const discountAmount =
        data.memberId && validatedData.member?.discount
          ? validatedData.member.discount.amount
          : 0;

      // Validate payment method
      const paymentCheck = await this.checkPaymentMethod(
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
      const items = validatedCartResult.data.map((item) => {
        return {
          productId: item.productId,
          batchId: item.batchId,
          unitId: item.unitId,
          cost: item.buyPrice,
          quantity: item.quantity,
          discountId: item.discount?.id || null,
          discountValue: item.discount?.value || null,
          discountValueType: item.discount?.type || null,
          basicPrice: item.basicPrice,
          subtotal: item.subtotal,
        };
      });
      const transactionData = validatedTransactionResult.data;
      // return;
      return await prisma.$transaction(async (tx) => {
        try {
          const transaction = await tx.transaction.create({
            data: {
              cashierId: data.cashierId,
              memberId: transactionData.member?.id || null,
              discountMemberId: transactionData.member?.discount?.id || null,
              discountValueType: transactionData.member?.discount?.type || null,
              discountValue: transactionData.member?.discount?.value || null,
              discountAmount: transactionData.member?.discount?.amount || null,
              totalAmount: transactionData.subtotal,
              finalAmount: finalAmount,
              paymentMethod: data.paymentMethod,
              items: {
                create: items.map((item) => ({
                  batchId: item.batchId,
                  quantity: item.quantity,
                  unitId: item.unitId,
                  cost: item.cost,
                  pricePerUnit: item.basicPrice,
                  discountId: item.discountId,
                  discountValue: item.discountValue || null,
                  discountValueType: item.discountValueType || null,
                  subtotal: item.subtotal,
                })),
              },
            },
          });
          // Process member points if member is provided
          if (data.memberId) {
            // Get the member
            const member = await tx.member.findUnique({
              where: { id: data.memberId },
              include: { tier: true },
            });

            if (member) {
              // Calculate points based on settings and tier multiplier
              const pointsEarned = await calculateMemberPoints(
                transactionData.subtotal,
                member,
              );

              if (pointsEarned > 0) {
                // Award points and create point history
                await tx.memberPoint.create({
                  data: {
                    memberId: data.memberId,
                    transactionId: transaction.id,
                    pointsEarned,
                    dateEarned: new Date(),
                    notes: `Points from transaction ${transaction.id}`,
                  },
                });

                // Update member's total points
                const updatedMember = await tx.member.update({
                  where: { id: data.memberId },
                  data: {
                    totalPoints: { increment: pointsEarned },
                    totalPointsEarned: { increment: pointsEarned },
                  },
                  include: {
                    tier: true,
                  },
                });

                // Check if member is eligible for a higher tier
                const eligibleTier = await tx.memberTier.findFirst({
                  where: {
                    minPoints: { lte: updatedMember.totalPointsEarned },
                  },
                  orderBy: {
                    minPoints: 'desc',
                  },
                });

                // Update member tier if eligible for a higher one
                if (
                  eligibleTier &&
                  (!updatedMember.tierId ||
                    eligibleTier.id !== updatedMember.tierId)
                ) {
                  await tx.member.update({
                    where: { id: data.memberId },
                    data: {
                      tierId: eligibleTier.id,
                    },
                  });
                }
              }
            }
          }

          // Update product inventory for each item
          for (const item of items) {
            // Get the current batch
            const batch = await tx.productBatch.findUnique({
              where: { id: item.batchId },
            });

            if (!batch) {
              throw new Error(`Batch with ID ${item.batchId} not found`);
            }

            // Update the batch's remaining quantity
            await tx.productBatch.update({
              where: { id: item.batchId },
              data: {
                remainingQuantity: { decrement: item.quantity },
              },
            });

            // Update the product's current stock
            await tx.product.update({
              where: { id: batch.productId },
              data: {
                currentStock: { decrement: item.quantity },
              },
            });
          }
          return {
            success: true,
            data: transaction,
            finalAmount: finalAmount,
            cashAmount: data.cashAmount || 0,
            change: paymentCheck.change || 0,
            information: {
              member: '',
              inventory: '',
            },
          };
        } catch (error) {
          console.error('Transaction creation error:', error);
          throw error; // Re-throw to trigger transaction rollback
        }
      });
    } catch (error) {
      return errorHandling();
    }
  }
}
