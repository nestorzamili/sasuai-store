import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { MemberService } from '@/lib/services/member.service';
import { RewardService } from '@/lib/services/reward.service';

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { memberId, rewardId } = await req.json();

    const claim = await MemberService.claimReward(memberId, rewardId);

    return NextResponse.json(
      {
        success: true,
        data: claim,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to claim reward',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const search = req.nextUrl.searchParams.get('search') || '';
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;
    const sortBy = req.nextUrl.searchParams.get('sortBy') || 'claimDate';
    const sortDirection =
      (req.nextUrl.searchParams.get('sortDirection') as 'asc' | 'desc') ||
      'desc';
    const status = req.nextUrl.searchParams.get('status') || '';

    const results = await RewardService.getPaginatedClaims({
      search,
      page,
      limit,
      sortBy,
      sortDirection,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        data: results,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching reward claims:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch reward claims',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
