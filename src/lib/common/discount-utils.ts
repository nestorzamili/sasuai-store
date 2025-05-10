import { DiscountType, DiscountApplyTo } from '@prisma/client';
import { customAlphabet } from 'nanoid';

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
  return type === 'PERCENTAGE' ? `${value}%` : `$${value.toLocaleString()}`;
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
 * Auto-generate a discount code based on name
 */
export function generateDiscountCode(name: string): string {
  if (!name) return '';

  // Convert to uppercase and remove special characters and spaces
  const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Take first 4-6 characters (or less if name is shorter)
  const prefix = cleanName.substring(0, Math.min(6, cleanName.length));

  // Generate a unique suffix
  const suffix = nanoid();

  // Store prefix
  const storedPrefix = 'SAS';

  return `${storedPrefix}${prefix}${suffix}`;
}
