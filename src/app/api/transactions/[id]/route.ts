import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { TransactionService } from '@/lib/services/transaction.service';

export const GET = withAuth(
  async (req: NextRequest, _authContext, routeContext) => {
    try {
      const id = await routeContext.getParam('id');

      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Transaction ID is required' },
          { status: 400 },
        );
      }

      const result = await TransactionService.getTransactionDetail(id);

      return NextResponse.json(result, {
        status: result.success ? 200 : 404,
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  },
);
