import { NextRequest, NextResponse } from 'next/server';
import { BrandService } from '@/lib/api/services/brand.service';

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const brand = await BrandService.getById(params.id);

    if (!brand) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch brand' },
      { status: 500 },
    );
  }
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Brand name is required' },
        { status: 400 },
      );
    }

    const brand = await BrandService.update(params.id, {
      name,
      description,
    });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update brand' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  try {
    // Check if the brand has associated products
    const hasProducts = await BrandService.hasProducts(params.id);

    if (hasProducts) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete brand because it has associated products',
        },
        { status: 400 },
      );
    }

    await BrandService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete brand' },
      { status: 500 },
    );
  }
};
