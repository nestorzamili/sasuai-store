import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { DiscountService } from '@/lib/services/discount.service';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code') || '';
    const totalAmountParam = url.searchParams.get('totalAmount') || '';
    const totalAmount = parseFloat(totalAmountParam);

    const result = await DiscountService.getGlobalDiscountByCode({
      code,
      totalAmount,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
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
});
