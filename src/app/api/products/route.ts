import { NextResponse } from 'next/server';

import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('search'); // e.g. `/api/search?search=hello`
  try {
    const products = await ProductService.getProductFiltered({
      search: query || '',
      take: 10,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.log(error);
  }
}
