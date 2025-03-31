import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';
import { ZodError } from 'zod';

interface Context {
  params: {
    id: string;
  };
}

/**
 * PUT /api/products/variants/[id]
 * Update a product variant
 */
export async function PUT(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    const body = await request.json();

    const updatedVariant = await ProductService.updateProductVariant(id, body);

    return NextResponse.json({ success: true, variant: updatedVariant });
  } catch (error) {
    console.error('Error updating product variant:', error);

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
      { success: false, error: 'Failed to update product variant' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/variants/[id]
 * Delete a product variant
 */
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;

    await ProductService.deleteProductVariant(id);

    return NextResponse.json({
      success: true,
      message: 'Product variant deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product variant:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to delete product variant' },
      { status: 500 },
    );
  }
}
