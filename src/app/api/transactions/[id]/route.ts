import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { TransactionService } from '@/lib/services/transaction.service';

export const GET = withAuth(async (req: NextRequest, context) => {
  try {
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
