import { z } from 'zod';

// Base schemas for related entities
export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().nullable().optional(),
});

export const BrandSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Brand name is required'),
  logoUrl: z.string().url().nullable().optional(),
});

export const UnitSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Unit name is required'),
  symbol: z.string().min(1, 'Unit symbol is required'),
});

export const BarcodeSchema = z.object({
  id: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  code: z.string().min(1, 'Barcode code is required'),
  isPrimary: z.boolean().default(false),
});

export const ProductImageSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  isPrimary: z.boolean(),
});

export const ProductBatchSchema = z.object({
  id: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  batchCode: z.string().min(1, 'Batch code is required'),
  expiryDate: z.coerce.date(),
  initialQuantity: z.number().int().positive(),
  remainingQuantity: z.number().int().min(0),
  buyPrice: z.number().positive(),
  barcodes: z.array(BarcodeSchema).optional(),
});

export const ProductVariantSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  name: z.string().min(1, 'Variant name is required'),
  unitId: z.string().uuid(),
  price: z.number().positive(),
  currentStock: z.number().int().min(0),
  skuCode: z.string().nullable().optional(),
  batches: z.array(ProductBatchSchema).optional(),
});

export const DiscountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Discount name is required'),
  type: z.string().min(1, 'Discount type is required'),
  value: z.number().positive(),
  minPurchase: z.number().positive().nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const ProductDiscountSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  discountId: z.string().uuid(),
});

// Main Product schema
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  variants: z.array(ProductVariantSchema).optional(),
  images: z.array(ProductImageSchema).optional(),
  productDiscounts: z.array(ProductDiscountSchema).optional(),
});

// Create product input schema (for API endpoints)
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  variants: true,
  images: true,
  productDiscounts: true,
});

// Update product input schema
export const UpdateProductSchema = ProductSchema.partial().extend({
  id: z.string().uuid(),
});

// Types based on schemas
export type Product = z.infer<typeof ProductSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductBatch = z.infer<typeof ProductBatchSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type Barcode = z.infer<typeof BarcodeSchema>;
export type Discount = z.infer<typeof DiscountSchema>;
export type ProductDiscount = z.infer<typeof ProductDiscountSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
