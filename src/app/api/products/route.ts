import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { ProductService } from '@/lib/services/product.service';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('search') || '';

    const products = await ProductService.getProductFiltered({
      search: query,
      take: 10,
    });

    return NextResponse.json(
      {
        success: true,
        data: products,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
