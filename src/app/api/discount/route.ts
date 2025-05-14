import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { DiscountService } from '@/lib/services/discount.service';

// GET getGlobalDiscounts
export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Extract code from query parameters
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: 'Discount code is required',
        },
        { status: 400 },
      );
    }

    const result = await DiscountService.getGlobalDiscountByCode(code);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching discount:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch discount',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
