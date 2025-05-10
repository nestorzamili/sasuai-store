import { z } from 'zod';
import { DiscountType, DiscountApplyTo } from '@prisma/client';

// Main discount schema
export const discountSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, 'Discount name is required'),
    code: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    type: z.nativeEnum(DiscountType, {
      errorMap: () => ({ message: 'Please select a valid discount type' }),
    }),
    value: z.coerce.number().min(0, 'Value must be a positive number'),
    minPurchase: z.coerce.number().nullable().optional(),
    startDate: z.date(),
    endDate: z.date(),
    isActive: z.boolean().default(true),
    isGlobal: z.boolean().default(false),
    maxUses: z.coerce.number().nullable().optional(),
    applyTo: z.nativeEnum(DiscountApplyTo),
    productIds: z.array(z.string()).optional(),
    memberIds: z.array(z.string()).optional(),
    memberTierIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(
    (data) =>
      data.type !== DiscountType.PERCENTAGE ||
      (data.value >= 0 && data.value <= 100),
    {
      message: 'Percentage discount must be between 0 and 100',
      path: ['value'],
    },
  )
  .refine(
    (data) =>
      data.applyTo !== DiscountApplyTo.SPECIFIC_PRODUCTS ||
      (data.productIds && data.productIds.length > 0),
    {
      message: 'You must select at least one product',
      path: ['productIds'],
    },
  )
  .refine(
    (data) =>
      data.applyTo !== DiscountApplyTo.SPECIFIC_MEMBERS ||
      (data.memberIds && data.memberIds.length > 0),
    {
      message: 'You must select at least one member',
      path: ['memberIds'],
    },
  )
  .refine(
    (data) =>
      data.applyTo !== DiscountApplyTo.SPECIFIC_MEMBER_TIERS ||
      (data.memberTierIds && data.memberTierIds.length > 0),
    {
      message: 'You must select at least one member tier',
      path: ['memberTierIds'],
    },
  );

// Partial schema for updates (without refinements)
export const partialDiscountSchema = z.object({
  name: z.string().min(1, 'Discount name is required').optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  type: z
    .nativeEnum(DiscountType, {
      errorMap: () => ({ message: 'Please select a valid discount type' }),
    })
    .optional(),
  value: z.number().min(0, 'Value must be a positive number').optional(),
  minPurchase: z.number().nullable().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  isGlobal: z.boolean().optional(),
  maxUses: z.number().nullable().optional(),
  applyTo: z.nativeEnum(DiscountApplyTo).optional(),
  productIds: z.array(z.string()).optional(),
  memberIds: z.array(z.string()).optional(),
  memberTierIds: z.array(z.string()).optional(),
});

// Type definition for form values
export type DiscountFormValues = z.infer<typeof discountSchema>;
