'use server';

import { revalidatePath } from 'next/cache';
import { UnitService } from '@/lib/services/unit.service';
import { z } from 'zod';

// Unit conversion schema for validation
const unitConversionSchema = z.object({
  fromUnitId: z.string().uuid('Invalid source unit'),
  toUnitId: z.string().uuid('Invalid target unit'),
  conversionFactor: z.number().positive('Conversion factor must be positive'),
});

/**
 * Get all unit conversions
 */
export async function getAllConversions() {
  try {
    const conversions = await UnitService.getAllConversions();

    return {
      success: true,
      data: conversions,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch unit conversions',
    };
  }
}

/**
 * Get all unit conversions with pagination, sorting and filtering
 */
export async function getAllConversionsWithOptions(options?: {
  page?: number;
  limit?: number;
  sortBy?: { id: string; desc: boolean };
  search?: string;
  columnFilter?: string[];
}) {
  try {
    // Default values
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const sortBy = options?.sortBy ?? { id: 'fromUnit.name', desc: false };
    const search = options?.search ?? '';

    // Build where clause for search
    let where: any = {};
    if (search) {
      where.OR = [
        { fromUnit: { name: { contains: search, mode: 'insensitive' } } },
        { fromUnit: { symbol: { contains: search, mode: 'insensitive' } } },
        { toUnit: { name: { contains: search, mode: 'insensitive' } } },
        { toUnit: { symbol: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy && sortBy.id) {
      if (sortBy.id === 'fromUnit') {
        orderBy = { fromUnit: { name: sortBy.desc ? 'desc' : 'asc' } };
      } else if (sortBy.id === 'toUnit') {
        orderBy = { toUnit: { name: sortBy.desc ? 'desc' : 'asc' } };
      } else {
        orderBy[sortBy.id] = sortBy.desc ? 'desc' : 'asc';
      }
    } else {
      orderBy = { fromUnit: { name: 'asc' } };
    }

    // Count total rows
    const totalRows = await UnitService.countConversionsWithWhere(where);

    // Query data with pagination
    const conversions = await UnitService.getAllConversionsWithOptions({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: conversions,
      totalRows,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch unit conversions',
      data: [],
      totalRows: 0,
    };
  }
}

/**
 * Get conversions for a specific unit
 */
export async function getConversionsForUnit(unitId: string) {
  try {
    const fromConversions = await UnitService.getConversionsFromUnit(unitId);
    const toConversions = await UnitService.getConversionsToUnit(unitId);

    return {
      success: true,
      data: {
        fromConversions,
        toConversions,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch unit conversions',
    };
  }
}

/**
 * Create a new unit conversion
 */
export async function createConversion(data: {
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
}) {
  try {
    // Validate data
    const validatedData = unitConversionSchema.parse(data);

    // Check if units are the same
    if (validatedData.fromUnitId === validatedData.toUnitId) {
      return {
        success: false,
        error: 'Source and target units cannot be the same',
      };
    }

    // Create conversion
    const conversion = await UnitService.createConversion({
      fromUnitId: validatedData.fromUnitId,
      toUnitId: validatedData.toUnitId,
      conversionFactor: validatedData.conversionFactor,
    });

    // Revalidate units path
    revalidatePath('/products/units');

    return {
      success: true,
      data: conversion,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    // Handle specific error from service
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to create unit conversion',
    };
  }
}

/**
 * Update a unit conversion
 */
export async function updateConversion(
  id: string,
  data: { conversionFactor: number },
) {
  try {
    // Validate conversion factor
    if (data.conversionFactor <= 0) {
      return {
        success: false,
        error: 'Conversion factor must be positive',
      };
    }

    // Update conversion
    const conversion = await UnitService.updateConversion(id, {
      conversionFactor: data.conversionFactor,
    });

    // Revalidate units path
    revalidatePath('/products/units');

    return {
      success: true,
      data: conversion,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update unit conversion',
    };
  }
}

/**
 * Delete a unit conversion
 */
export async function deleteConversion(id: string) {
  try {
    await UnitService.deleteConversion(id);

    // Revalidate units path
    revalidatePath('/products/units');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete unit conversion',
    };
  }
}

/**
 * Convert a quantity between units
 */
export async function convertQuantity(
  fromUnitId: string,
  toUnitId: string,
  quantity: number,
) {
  try {
    const result = await UnitService.convertQuantity(
      fromUnitId,
      toUnitId,
      quantity,
    );
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to convert quantity',
    };
  }
}
