import { NextRequest, NextResponse } from 'next/server';
import { BrandService } from '@/lib/api/services/brand.service';

export const GET = async (request: NextRequest) => {
  try {
    const brands = await BrandService.getAll();
    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch brands' },
      { status: 500 },
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Brand name is required' },
        { status: 400 },
      );
    }

    const brand = await BrandService.create({
      name,
      description: description || null,
    });

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create brand' },
      { status: 500 },
    );
  }
};
