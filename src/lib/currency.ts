/**
 * Format options for Indonesian currency
 */
interface FormatRupiahOptions {
  /** Include the Rp symbol (default: true) */
  withSymbol?: boolean;
  /** Include decimal digits (default: 0) */
  decimalDigits?: number;
  /** Use compact notation for large numbers (default: false) */
  compact?: boolean;
}

/**
 * Formats a number to Indonesian Rupiah (IDR) format
 *
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * // Returns "Rp 12.345"
 * formatRupiah(12345)
 *
 * @example
 * // Returns "12.345"
 * formatRupiah(12345, { withSymbol: false })
 */
export function formatRupiah(
  value: number | string | null | undefined,
  options: FormatRupiahOptions = {}
): string {
  // Default options
  const { withSymbol = true, decimalDigits = 0, compact = false } = options;

  // Handle null/undefined/invalid values
  if (value === null || value === undefined || isNaN(Number(value))) {
    return withSymbol ? "Rp 0" : "0";
  }

  // Convert to number if string
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Format using Intl.NumberFormat with Indonesian locale
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
    notation: compact ? "compact" : "standard",
  });

  const formattedValue = formatter.format(numValue);

  return withSymbol ? `Rp ${formattedValue}` : formattedValue;
}
