import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';
import { ProductVariantSchema } from '@/lib/api/schema/product';
import { ZodError } from 'zod';

interface Context {
  params: {
    id: string;
  };
}

/**
 * POST /api/products/[id]/variants
 * Add a new variant to a product
 */
export async function POST(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await ProductService.getProductById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      );
    }

    // Validate request body
    const variant = await ProductService.addProductVariant(id, body);

    return NextResponse.json({ success: true, variant }, { status: 201 });
  } catch (error) {
    console.error('Error adding product variant:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add product variant' },
      { status: 500 },
    );
  }
}
