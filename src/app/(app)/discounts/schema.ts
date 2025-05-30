import { z } from 'zod';
import { DiscountType, DiscountApplyTo } from '@/lib/types/discount';

// Base schema without refinement
const baseDiscountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  code: z.string().nullable(),
  description: z.string().nullable(),
  type: z.nativeEnum(DiscountType),
  value: z.coerce.number().min(0, 'Value must be positive'),
  minPurchase: z.coerce.number().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
  isGlobal: z.boolean(),
  maxUses: z.coerce.number().nullable(),
  // Make applyTo required (not nullable/optional)
  applyTo: z.nativeEnum(DiscountApplyTo),
  productIds: z.array(z.string()).default([]).optional(),
  memberIds: z.array(z.string()).default([]).optional(),
  memberTierIds: z.array(z.string()).default([]).optional(),
});

// Full schema with refinement for validation
export const discountSchema = baseDiscountSchema.refine(
  (data) => {
    // Global discounts should use the ALL enum value
    if (data.isGlobal) {
      return data.applyTo === DiscountApplyTo.ALL;
    }

    // For non-global discounts, validate based on applyTo type
    if (data.applyTo === DiscountApplyTo.SPECIFIC_PRODUCTS) {
      return data.productIds && data.productIds.length > 0;
    }
    if (data.applyTo === DiscountApplyTo.SPECIFIC_MEMBERS) {
      return data.memberIds && data.memberIds.length > 0;
    }
    if (data.applyTo === DiscountApplyTo.SPECIFIC_MEMBER_TIERS) {
      return data.memberTierIds && data.memberTierIds.length > 0;
    }
    return true;
  },
  {
    message:
      'Please select at least one item for the selected application type',
    path: ['applyTo'],
  },
);

// Create partial schema from the base schema
export const partialDiscountSchema = baseDiscountSchema.partial();

export type DiscountFormValues = z.infer<typeof discountSchema>;

// Translation-aware schema factory (for future use)
export const createTranslatedDiscountSchema = (t: (key: string) => string) => {
  return baseDiscountSchema
    .extend({
      name: z.string().min(1, t('validation.nameRequired')),
      value: z.coerce.number().min(0, t('validation.valuePositive')),
    })
    .refine(
      (data) => {
        if (data.isGlobal) {
          return data.applyTo === DiscountApplyTo.ALL;
        }

        if (data.applyTo === DiscountApplyTo.SPECIFIC_PRODUCTS) {
          return data.productIds && data.productIds.length > 0;
        }
        if (data.applyTo === DiscountApplyTo.SPECIFIC_MEMBERS) {
          return data.memberIds && data.memberIds.length > 0;
        }
        if (data.applyTo === DiscountApplyTo.SPECIFIC_MEMBER_TIERS) {
          return data.memberTierIds && data.memberTierIds.length > 0;
        }
        return true;
      },
      {
        message: t('validation.selectItems'),
        path: ['applyTo'],
      },
    );
};
