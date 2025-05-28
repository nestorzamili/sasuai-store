import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { MemberService } from '@/lib/services/member.service';

// ban a member
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

      const body = await req.json();
      if (!body.reason) {
        return NextResponse.json(
          { success: false, message: 'Ban reason is required' },
          { status: 400 },
        );
      }

      const member = await MemberService.ban(memberId, body.reason);

      return NextResponse.json(
        {
          success: true,
          data: member,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error('Error banning member:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to ban member',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  },
);
