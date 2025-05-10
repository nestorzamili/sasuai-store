import { DiscountType, DiscountApplyTo } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { formatRupiah } from '../currency';

// Generate alphanumeric IDs with uppercase letters and numbers
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

/**
 * Format discount value for display
 */
export function formatDiscountValue(
  type?: DiscountType,
  value?: number,
): string {
  if (type === undefined || value === undefined) return 'N/A';
  return type === 'PERCENTAGE' ? `${value}%` : formatRupiah(value);
}

/**
 * Format application scope for display
 */
export function formatApplyTo(applyTo?: DiscountApplyTo): string {
  switch (applyTo) {
    case 'SPECIFIC_PRODUCTS':
      return 'Specific Products';
    case 'SPECIFIC_MEMBERS':
      return 'Specific Members';
    case 'SPECIFIC_MEMBER_TIERS':
      return 'Member Tiers';
    default:
      return 'All Items';
  }
}

/**
 * Auto-generate a discount code based on name (6 characters total)
 */
export function generateDiscountCode(name: string): string {
  if (!name) return '';

  const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const prefixLength = Math.min(3, cleanName.length);
  const prefix = cleanName.substring(0, prefixLength);

  const suffixLength = 6 - prefixLength;
  const suffix = nanoid().substring(0, suffixLength);

  return `${prefix}${suffix}`;
}
