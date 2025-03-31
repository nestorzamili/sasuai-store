import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';
import { ZodError } from 'zod';

interface Context {
  params: {
    id: string;
  };
}

/**
 * POST /api/products/variants/[id]/batches
 * Add a new batch to a product variant
 */
export async function POST(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    const body = await request.json();

    const batch = await ProductService.addProductBatch(id, body);

    return NextResponse.json({ success: true, batch }, { status: 201 });
  } catch (error) {
    console.error('Error adding product batch:', error);

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
      { success: false, error: 'Failed to add product batch' },
      { status: 500 },
    );
  }
}
