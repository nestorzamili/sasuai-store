'use server';

import { revalidatePath } from 'next/cache';
import { SupplierService } from '@/lib/services/supplier.service';
import { z } from 'zod';

// Supplier schema for validation
const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact: z.string().optional(),
});

/**
 * Get all suppliers with stock-in count, support pagination/sort/search/filter
 */
export async function getAllSuppliersWithCount(options?: {
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
    const columnFilter = options?.columnFilter ?? ['name', 'contact'];

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
    const totalRows = await SupplierService.countWithWhere(where);

    // Query data with pagination
    const suppliers = await SupplierService.getAllSuppliersWithCount({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: suppliers,
      totalRows,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch suppliers',
      data: [] as any[],
      totalRows: 0,
    };
  }
}

/**
 * Get all suppliers
 */
export async function getAllSuppliers() {
  try {
    const suppliers = await SupplierService.getAll();

    return {
      success: true,
      data: suppliers,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch suppliers',
    };
  }
}

/**
 * Get a supplier by ID
 */
export async function getSupplier(id: string) {
  try {
    const supplier = await SupplierService.getById(id);

    if (!supplier) {
      return {
        success: false,
        error: 'Supplier not found',
      };
    }

    return {
      success: true,
      data: supplier,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch supplier',
    };
  }
}

/**
 * Get supplier with stock-ins
 */
export async function getSupplierWithStockIns(id: string) {
  try {
    const supplier = await SupplierService.getWithStockIns(id);

    if (!supplier) {
      return {
        success: false,
        error: 'Supplier not found',
      };
    }

    return {
      success: true,
      data: supplier,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch supplier details',
    };
  }
}

/**
 * Create a new supplier
 */
export async function createSupplier(data: { name: string; contact?: string }) {
  try {
    // Validate data
    const validatedData = supplierSchema.parse(data);

    // Create supplier
    const supplier = await SupplierService.create({
      name: validatedData.name,
      contact: validatedData.contact,
    });

    // Revalidate suppliers page
    revalidatePath('/suppliers');

    return {
      success: true,
      data: supplier,
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
      error: 'Failed to create supplier',
    };
  }
}

/**
 * Update a supplier
 */
export async function updateSupplier(
  id: string,
  data: { name?: string; contact?: string }
) {
  try {
    // Validate data
    const validatedData = supplierSchema.partial().parse(data);

    // Update supplier
    const supplier = await SupplierService.update(id, {
      name: validatedData.name,
      contact: validatedData.contact,
    });

    // Revalidate suppliers page
    revalidatePath('/suppliers');

    return {
      success: true,
      data: supplier,
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
      error: 'Failed to update supplier',
    };
  }
}

/**
 * Check if supplier can be deleted
 */
export async function canDeleteSupplier(id: string) {
  try {
    const canDelete = await SupplierService.canDelete(id);

    return {
      success: true,
      canDelete,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to check if supplier can be deleted',
      canDelete: false,
    };
  }
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(id: string) {
  try {
    // Check if supplier can be deleted
    const canDelete = await SupplierService.canDelete(id);

    if (!canDelete) {
      return {
        success: false,
        error: 'Cannot delete supplier with associated stock-ins',
      };
    }

    // Delete supplier
    await SupplierService.delete(id);

    // Revalidate suppliers page
    revalidatePath('/suppliers');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete supplier',
    };
  }
}
