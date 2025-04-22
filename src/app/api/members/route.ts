import { NextResponse } from 'next/server';

import { NextRequest } from 'next/server';
import { MemberService } from '@/lib/services/member.service';
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('search');
  try {
    const member = await MemberService.search({
      query: query || '',
      limit: 10,
      page: 1,
    });
    return NextResponse.json({
      data: member,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
}

// create a new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMember = await MemberService.create(body);
    return NextResponse.json(
      {
        data: newMember,
        success: true,
        message: 'Member created successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create member:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create member',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
