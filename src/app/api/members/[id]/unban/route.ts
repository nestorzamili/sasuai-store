import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { MemberService } from '@/lib/services/member.service';

// unban a member
export const POST = withAuth(
  async (req: NextRequest, _authContext, routeContext) => {
    try {
      const memberId = await routeContext.getParam('id');

      if (!memberId) {
        return NextResponse.json(
          { success: false, message: 'Member ID is required' },
          { status: 400 },
        );
      }

      const member = await MemberService.unban(memberId);

      if (!member) {
        return NextResponse.json(
          { success: false, message: 'Member not found' },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Member unbanned successfully',
        },
        { status: 200 },
      );
    } catch (error) {
      console.error('Error unbanning member:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to unban member',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  },
);
