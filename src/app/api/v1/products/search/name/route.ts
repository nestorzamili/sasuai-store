import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';

/**
 * GET /api/products/search/name?name=ProductName
 * Search products by name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 },
      );
    }

    const products = await ProductService.searchProductsByName(name);

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products found with this name' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error searching product by name:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to search product by name' },
      { status: 500 },
    );
  }
}
