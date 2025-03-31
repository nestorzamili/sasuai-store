import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';
import { ZodError } from 'zod';

interface Context {
  params: {
    id: string;
  };
}

/**
 * POST /api/products/[id]/images
 * Add a new image to a product
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

    const imageData = {
      imageUrl: body.imageUrl,
      isPrimary: body.isPrimary || false,
    };

    const image = await ProductService.addProductImage(id, imageData);

    return NextResponse.json({ success: true, image }, { status: 201 });
  } catch (error) {
    console.error('Error adding product image:', error);

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
      { success: false, error: 'Failed to add product image' },
      { status: 500 },
    );
  }
}
