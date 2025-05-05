import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { MemberService } from '@/lib/services/member.service';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const query = req.nextUrl.searchParams.get('search') || '';
    const tier = req.nextUrl.searchParams.get('tier') || '';
    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;

    const members = await MemberService.search({
      query,
      tier,
      page,
      limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: members,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch members',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const member = await MemberService.create(body);

    return NextResponse.json(
      {
        success: true,
        data: member,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create member',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
