import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { TransactionService } from '@/lib/services/transaction.service';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Extract all possible query parameters
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as
      | 'asc'
      | 'desc';
    const search = searchParams.get('search') || '';
    const cashierId = searchParams.get('cashierId') || undefined;
    const memberId = searchParams.get('memberId') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;

    // Handle date filters
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    // Handle amount filters
    const minAmount = searchParams.get('minAmount')
      ? Number(searchParams.get('minAmount'))
      : undefined;
    const maxAmount = searchParams.get('maxAmount')
      ? Number(searchParams.get('maxAmount'))
      : undefined;

    // Get paginated transactions with filters
    const transactions = await TransactionService.getPaginated({
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
      minAmount,
      maxAmount,
    });

    return NextResponse.json(
      {
        success: true,
        data: transactions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch transactions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
