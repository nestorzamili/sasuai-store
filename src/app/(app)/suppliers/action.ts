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
 * Get all suppliers with stock-in count
 */
export async function getAllSuppliersWithCount() {
  try {
    // Get suppliers with stock-in counts
    const suppliers = await SupplierService.getAllWithStockInCount();

    return {
      success: true,
      data: suppliers,
    };
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return {
      success: false,
      error: 'Failed to fetch suppliers',
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
    console.error('Failed to fetch suppliers:', error);
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
    console.error(`Failed to fetch supplier ${id}:`, error);
    return {
      success: false,
      error: 'Failed to fetch supplier',
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
    console.error('Failed to create supplier:', error);

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
  data: { name?: string; contact?: string },
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
    console.error(`Failed to update supplier ${id}:`, error);

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
 * Delete a supplier
 */
export async function deleteSupplier(id: string) {
  try {
    // Check if supplier has stock-ins
    const hasStockIns = await SupplierService.hasStockIns(id);

    if (hasStockIns) {
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
    console.error(`Failed to delete supplier ${id}:`, error);
    return {
      success: false,
      error: 'Failed to delete supplier',
    };
  }
}
