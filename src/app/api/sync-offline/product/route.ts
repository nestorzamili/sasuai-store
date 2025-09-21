import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { SyncProductService } from '@/lib/services/offline-mode/sync-product';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    // TODO: Implement your logic here, for now just return success
    const query = searchParams.get('last_modify') || '';
    const data = await SyncProductService.syncProducts({
      lastModified: query ? new Date(query) : undefined,
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Products synced successfully',
        data: data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    console.log('GET request processed');
  }
});
