import { DiscountType, DiscountApplyTo } from '../types/discount';
import { formatRupiah } from '../currency';

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
