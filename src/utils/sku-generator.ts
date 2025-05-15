export function generateSKU(
  productName: string,
  categoryPrefix?: string,
  randomSuffix = true,
): string {
  if (!productName) return '';

  // Normalize the product name (remove accents, convert to uppercase)
  const normalized = productName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  // Remove special characters, keep only alphanumeric
  const alphanumeric = normalized.replace(/[^A-Z0-9]/g, '');

  // Start with category prefix if available
  let sku = categoryPrefix ? `${categoryPrefix}-` : '';

  // Take first 6-8 characters from product name (depending on whether we have a category prefix)
  const nameLength = categoryPrefix ? 6 : 8;
  sku += alphanumeric.substring(0, nameLength);

  // Add random suffix for uniqueness if requested
  if (randomSuffix) {
    // Generate a 4-character random alphanumeric string
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    sku += `-${randomStr}`;
  }

  return sku;
}

/**
 * Generate a category prefix based on category name (2-3 chars)
 */
export function generateCategoryPrefix(categoryName: string): string {
  if (!categoryName) return '';

  // Take first 3 characters, remove spaces and special chars
  return categoryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase();
}
