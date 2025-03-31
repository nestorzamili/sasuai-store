import { CategoryWhereInput } from './category';
import { BrandWhereInput } from './brand';
import { VariantWhereInput } from './variant';
import { Prisma } from '@prisma/client';

/**
 * Product-specific Prisma types
 */

export interface ProductWhereInput {
  id?: string | { equals: string } | { in: string[] };
  name?: string | { contains: string; mode?: 'insensitive' | 'sensitive' };
  categoryId?: string;
  brandId?: string | null;
  isActive?: boolean;
  AND?: ProductWhereInput[];
  OR?: ProductWhereInput[];
  variants?: VariantWhereInput;
  category?: { is?: CategoryWhereInput };
  brand?: { is?: BrandWhereInput } | null;
}

export interface ProductBatchCreateInput {
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  remainingQuantity?: number;
  buyPrice: Prisma.Decimal | number | string;
  variant?: { connect: { id: string } };
  barcodes?: {
    create: {
      code: string;
      isPrimary: boolean;
    }[];
  };
}
