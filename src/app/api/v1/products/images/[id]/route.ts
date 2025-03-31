import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';

interface Context {
  params: {
    id: string;
  };
}

/**
 * DELETE /api/products/images/[id]
 * Delete a product image
 */
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;

    await ProductService.deleteProductImage(id);

    return NextResponse.json({
      success: true,
      message: 'Product image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product image:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete product image',
      },
      { status: 500 },
    );
  }
}
