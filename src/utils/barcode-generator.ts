/**
 * Generate a random barcode in EAN-13 format
 * EAN-13 format: 13 digits total
 * First 3 digits: Country code (Indonesia uses 899)
 * Next 4-5 digits: Company/manufacturer code
 * Next 4-5 digits: Product code
 * Last digit: Check digit (calculated)
 */
export function generateEAN13Barcode(): string {
  // Country code for Indonesia (899 is assigned to Indonesia)
  const countryCode = '899';

  // Generate 9 random digits for company and product code
  let digits = countryCode;
  for (let i = 0; i < 9; i++) {
    digits += Math.floor(Math.random() * 10).toString();
  }

  // Calculate check digit using EAN-13 algorithm
  const checkDigit = calculateEAN13CheckDigit(digits);

  return digits + checkDigit;
}

/**
 * Calculate EAN-13 check digit
 */
function calculateEAN13CheckDigit(digits: string): string {
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits[i]);
    // Multiply odd positions by 1, even positions by 3
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit.toString();
}

/**
 * Generate a simple numeric barcode
 */
export function generateNumericBarcode(length: number = 12): string {
  let barcode = '';
  for (let i = 0; i < length; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  return barcode;
}

/**
 * Validate EAN-13 barcode format
 */
export function validateEAN13(barcode: string): boolean {
  if (barcode.length !== 13 || !/^\d+$/.test(barcode)) {
    return false;
  }

  const providedCheckDigit = barcode[12];
  const calculatedCheckDigit = calculateEAN13CheckDigit(
    barcode.substring(0, 12),
  );

  return providedCheckDigit === calculatedCheckDigit;
}
