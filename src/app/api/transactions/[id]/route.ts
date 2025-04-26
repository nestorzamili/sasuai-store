import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { TransactionService } from '@/lib/services/transaction.service';

// Modifikasi cara menerima params
export const GET = withAuth(async (req: NextRequest, context) => {
  try {
    // Pastikan context.params diawait terlebih dahulu
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required' },
        { status: 400 },
      );
    }

    const transaction = await TransactionService.getTransactionById(id);

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});

// Void a transaction
export const POST = withAuth(async (req: NextRequest, context) => {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required' },
        { status: 400 },
      );
    }

    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json(
        {
          success: false,
          message: 'Reason is required for voiding transaction',
        },
        { status: 400 },
      );
    }

    const result = await TransactionService.voidTransaction(id, reason);

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction successfully voided',
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error voiding transaction:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to void transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
