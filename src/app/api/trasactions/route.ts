import { NextResponse, NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('search');
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
export async function POST(request: NextRequest) {
  const body = await request.json();
  // return NextResponse.json(body);
  // try {
  //   const product = await ProductService.create(body);
  //   return NextResponse.json(product);
  // } catch (error) {
  //   console.log(error);
  // }
}
