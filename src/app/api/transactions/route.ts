import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { TransactionService } from '@/lib/services/transaction.service';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Extract all query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const search = searchParams.get('search') || '';
    const cashierId = searchParams.get('cashierId') || undefined;
    const memberId = searchParams.get('memberId') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;

    // Better date parsing with timezone handling
    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;

    if (searchParams.get('startDate')) {
      startDate = new Date(searchParams.get('startDate')!);
      // Set to beginning of the day
      startDate.setHours(0, 0, 0, 0);
    }

    if (searchParams.get('endDate')) {
      endDate = new Date(searchParams.get('endDate')!);
      // Set to end of the day
      endDate.setHours(23, 59, 59, 999);
    }

    // Parse numeric values
    const minAmount = searchParams.get('minAmount')
      ? parseFloat(searchParams.get('minAmount')!)
      : undefined;
    const maxAmount = searchParams.get('maxAmount')
      ? parseFloat(searchParams.get('maxAmount')!)
      : undefined;

    const transactions = await TransactionService.getPaginated({
      page,
      pageSize,
      sortField,
      sortDirection: sortDirection as 'asc' | 'desc',
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
