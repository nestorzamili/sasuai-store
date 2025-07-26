import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { calculateMemberPoints } from '@/lib/services/setting.service';
import { MemberService } from '@/lib/services/member.service';
import {
  MemberWithTier,
  mapToMemberWithTier,
  MemberResponse,
} from '@/lib/types/member';

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { amount, memberId } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 },
      );
    }

    let member: MemberWithTier | null = null;
    if (memberId) {
      const fetchedMember = await MemberService.getById(memberId);
      if (fetchedMember) {
        // Use the proper utility function to map the response
        member = mapToMemberWithTier(fetchedMember as MemberResponse);
      }
    }

    const points = await calculateMemberPoints(amount, member);

    // Return the calculated points
    return NextResponse.json({ points }, { status: 200 });
  } catch (error) {
    console.error('Error calculating points:', error);
    return NextResponse.json(
      { error: 'Failed to calculate points' },
      { status: 500 },
    );
  }
});
