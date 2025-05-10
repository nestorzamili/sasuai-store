import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { RewardService } from '@/lib/services/reward.service';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const query = req.nextUrl.searchParams.get('search') || '';
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;
    const sortBy = req.nextUrl.searchParams.get('sortBy') || 'pointsCost';
    const sortDirection =
      (req.nextUrl.searchParams.get('sortDirection') as 'asc' | 'desc') ||
      'asc';
    const includeInactive =
      req.nextUrl.searchParams.get('includeInactive') === 'true';

    const results = await RewardService.search({
      query,
      page,
      limit,
      sortBy,
      sortDirection,
      includeInactive,
    });

    return NextResponse.json(
      {
        success: true,
        data: results,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch rewards',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
