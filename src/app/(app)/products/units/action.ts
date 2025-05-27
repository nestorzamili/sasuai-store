'use server';

import { revalidatePath } from 'next/cache';
import { UnitService } from '@/lib/services/unit.service';
import { z } from 'zod';
import {
  CreateUnitData,
  UpdateUnitData,
  UnitSearchParams,
  GetUnitsResponse,
  GetUnitResponse,
  CreateUnitResponse,
  UpdateUnitResponse,
  DeleteUnitResponse,
  UnitFetchResult,
  UnitWithCounts,
} from '@/lib/types/unit';

// Unit schema for validation
const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').max(50, 'Name too long'),
  symbol: z
    .string()
    .min(1, 'Unit symbol is required')
    .max(10, 'Symbol too long'),
});

/**
 * Get all units with relation counts, support pagination/sort/search/filter
 */
export async function getAllUnitsWithCounts(
  params: UnitSearchParams = {},
): Promise<UnitFetchResult<UnitWithCounts[]>> {
  try {
    const result = await UnitService.search({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy ?? 'name',
      sortDirection: params.sortDirection ?? 'asc',
      query: params.query ?? '',
    });

    return {
      data: result.units,
      totalRows: result.totalCount,
    };
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return {
      data: [],
      totalRows: 0,
    };
  }
}

/**
 * Get all units (simple list)
 */
export async function getAllUnits(): Promise<GetUnitsResponse> {
  try {
    const units = await UnitService.getAllWithRelationCounts();
    return {
      success: true,
      data: {
        units,
        totalCount: units.length,
        totalPages: 1,
        currentPage: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return { success: false, error: 'Failed to fetch units' };
  }
}

/**
 * Get a unit by ID
 */
export async function getUnit(id: string): Promise<GetUnitResponse> {
  try {
    const unit = await UnitService.getById(id);
    if (!unit) return { success: false, error: 'Unit not found' };

    return { success: true, data: unit };
  } catch (error) {
    console.error('Failed to fetch unit:', error);
    return { success: false, error: 'Failed to fetch unit' };
  }
}

/**
 * Create a new unit
 */
export async function createUnit(
  data: CreateUnitData,
): Promise<CreateUnitResponse> {
  try {
    // Validate data
    const validatedData = unitSchema.parse(data);

    // Create unit
    const unit = await UnitService.create({
      name: validatedData.name,
      symbol: validatedData.symbol,
    });

    // Revalidate units path
    revalidatePath('/products/units');

    return { success: true, data: unit };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    console.error('Failed to create unit:', error);
    return { success: false, error: 'Failed to create unit' };
  }
}

/**
 * Update a unit
 */
export async function updateUnit(
  id: string,
  data: UpdateUnitData,
): Promise<UpdateUnitResponse> {
  try {
    // Validate data
    const validatedData = unitSchema.partial().parse(data);

    // Update unit
    const unit = await UnitService.update(id, validatedData);

    // Revalidate units path
    revalidatePath('/products/units');

    return { success: true, data: unit };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    console.error('Failed to update unit:', error);
    return { success: false, error: 'Failed to update unit' };
  }
}

/**
 * Delete a unit
 */
export async function deleteUnit(id: string): Promise<DeleteUnitResponse> {
  try {
    // Check if unit is in use
    const isInUse = await UnitService.isInUse(id);
    if (isInUse) {
      return {
        success: false,
        error: 'Cannot delete a unit that is in use by products',
      };
    }

    // Delete unit
    await UnitService.delete(id);
    revalidatePath('/products/units');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete unit:', error);
    return { success: false, error: 'Failed to delete unit' };
  }
}

/**
 * Check if unit is in use
 */
export async function checkUnitInUse(id: string): Promise<{ inUse: boolean }> {
  try {
    const inUse = await UnitService.isInUse(id);
    return { inUse };
  } catch (error) {
    console.error('Failed to check unit usage:', error);
    return { inUse: false };
  }
}
