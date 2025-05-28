import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { MemberService } from '@/lib/services/member.service';

export const GET = withAuth(
  async (req: NextRequest, _authContext, routeContext) => {
    try {
      const memberId = await routeContext.getParam('id');

      if (!memberId) {
        return NextResponse.json(
          { success: false, message: 'Member ID is required' },
          { status: 400 },
        );
      }

      const member = await MemberService.getById(memberId);

      if (!member) {
        return NextResponse.json(
          { success: false, message: 'Member not found' },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { success: true, data: member },
        { status: 200 },
      );
    } catch (error) {
      console.error('Error fetching member:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch member',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  },
);

export const PUT = withAuth(
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
      if (!body) {
        return NextResponse.json(
          { success: false, message: 'Request body is required' },
          { status: 400 },
        );
      }

      const member = await MemberService.update(memberId, body);

      return NextResponse.json(
        {
          success: true,
          data: member,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error('Error updating member:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update member',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withAuth(
  async (req: NextRequest, _authContext, routeContext) => {
    try {
      const memberId = await routeContext.getParam('id');

      if (!memberId) {
        return NextResponse.json(
          { success: false, message: 'Member ID is required' },
          { status: 400 },
        );
      }

      await MemberService.delete(memberId);

      return NextResponse.json(
        {
          success: true,
          message: 'Member deleted successfully',
        },
        { status: 200 },
      );
    } catch (error) {
      console.error('Error deleting member:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to delete member',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  },
);
