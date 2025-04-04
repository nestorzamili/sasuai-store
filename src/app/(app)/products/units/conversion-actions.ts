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
    console.error('Failed to fetch unit conversions:', error);
    return {
      success: false,
      error: 'Failed to fetch unit conversions',
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
    console.error(`Failed to fetch conversions for unit ${unitId}:`, error);
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
    console.error('Failed to create unit conversion:', error);

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
    console.error(`Failed to update unit conversion ${id}:`, error);
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
    console.error(`Failed to delete unit conversion ${id}:`, error);
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
    console.error('Failed to convert quantity:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to convert quantity',
    };
  }
}
