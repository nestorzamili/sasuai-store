import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';

/**
 * GET /api/products/search/barcode?code=1234567890
 * Search products by barcode
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Barcode code is required' },
        { status: 400 },
      );
    }

    const product = await ProductService.findProductByBarcode(code);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found with this barcode' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error searching product by barcode:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to search product by barcode' },
      { status: 500 },
    );
  }
}
