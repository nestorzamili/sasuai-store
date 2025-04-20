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
