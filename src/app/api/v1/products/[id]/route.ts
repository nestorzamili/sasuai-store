import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/api/services/product.service';
import { UpdateProductSchema } from '@/lib/api/schema/product';
import { ZodError } from 'zod';

interface Context {
  params: {
    id: string;
  };
}

/**
 * GET /api/products/[id]
 * Get a product by ID
 */
export async function GET(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;

    const product = await ProductService.getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update a product
 */
export async function PUT(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    const body = await request.json();

    // Validate request body against schema
    const validatedData = UpdateProductSchema.parse({
      id,
      ...body,
    });

    // Check if product exists
    const existingProduct = await ProductService.getProductById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      );
    }

    // Update product
    const product = await ProductService.updateProduct(id, validatedData);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);

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
      { success: false, error: 'Failed to update product' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product
 */
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const { id } = context.params;

    // Check if product exists
    const existingProduct = await ProductService.getProductById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      );
    }

    // Delete product
    await ProductService.deleteProduct(id);

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting product:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 },
    );
  }
}
