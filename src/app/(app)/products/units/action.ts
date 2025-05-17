'use server';

import { revalidatePath } from 'next/cache';
import { UnitService } from '@/lib/services/unit.service';
import { z } from 'zod';

// Unit schema for validation
const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  symbol: z.string().min(1, 'Unit symbol is required'),
});

/**
 * Get all units with relation counts, support pagination/sort/search/filter
 */
export async function getAllUnitsWithCounts(options?: {
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
    const sortBy = options?.sortBy ?? { id: 'name', desc: false };
    const search = options?.search ?? '';
    const columnFilter = options?.columnFilter ?? ['name', 'symbol'];

    // Build where clause for search
    let where: any = {};
    if (search && columnFilter.length > 0) {
      where.OR = columnFilter.map((col) => ({
        [col]: { contains: search, mode: 'insensitive' },
      }));
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy && sortBy.id) {
      orderBy[sortBy.id] = sortBy.desc ? 'desc' : 'asc';
    } else {
      orderBy = { name: 'asc' };
    }

    // Count total rows
    const totalRows = await UnitService.countWithWhere(where);

    // Query data with pagination
    const units = await UnitService.getAllUnitsWithCounts({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: units,
      totalRows,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch units',
      data: [] as any[],
      totalRows: 0,
    };
  }
}

/**
 * Get all units
 */
export async function getAllUnits() {
  try {
    const units = await UnitService.getAll();

    return {
      success: true,
      data: units,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch units',
    };
  }
}

/**
 * Get a unit by ID
 */
export async function getUnit(id: string) {
  try {
    const unit = await UnitService.getById(id);

    if (!unit) {
      return {
        success: false,
        error: 'Unit not found',
      };
    }

    return {
      success: true,
      data: unit,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch unit',
    };
  }
}

/**
 * Create a new unit
 */
export async function createUnit(data: { name: string; symbol: string }) {
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

    return {
      success: true,
      data: unit,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to create unit',
    };
  }
}

/**
 * Update a unit
 */
export async function updateUnit(
  id: string,
  data: { name?: string; symbol?: string }
) {
  try {
    // Validate data
    const validatedData = unitSchema.partial().parse(data);

    // Update unit
    const unit = await UnitService.update(id, {
      name: validatedData.name,
      symbol: validatedData.symbol,
    });

    // Revalidate units path
    revalidatePath('/products/units');

    return {
      success: true,
      data: unit,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to update unit',
    };
  }
}

/**
 * Delete a unit
 */
export async function deleteUnit(id: string) {
  try {
    // Check if unit is in use
    const isInUse = await UnitService.isInUse(id);

    if (isInUse) {
      return {
        success: false,
        error: 'Cannot delete a unit that is in use by products', // Updated error message
      };
    }

    // Delete unit
    await UnitService.delete(id);

    // Revalidate units path
    revalidatePath('/products/units');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete unit',
    };
  }
}
