'use client';

import { getProductsForSelection } from '../../action';
import EntitySelector from './entity-selector';
import {
  ProductForSelection,
  ProductSelectorProps,
  Column,
} from '@/lib/types/discount';

export default function ProductSelector({
  selectedIds,
  onChange,
}: ProductSelectorProps) {
  const fetchProducts = async (
    search: string,
    isIdSearch = false,
  ): Promise<{ success: boolean; data?: ProductForSelection[] }> => {
    try {
      // If this is an ID search, format the query appropriately
      const searchParam = isIdSearch ? `id:${search}` : search;
      const products = await getProductsForSelection(searchParam);

      if (Array.isArray(products)) {
        // Transform the response to match our interface
        const transformedProducts: ProductForSelection[] = products.map(
          (product) => ({
            id: product.id,
            name: product.name,
            barcode: product.barcode,
            category: product.category,
            brand: product.brand,
          }),
        );

        return {
          success: true,
          data: transformedProducts,
        };
      }
      return {
        success: false,
        data: [],
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, data: [] };
    }
  };

  // Handle ID-based lookups separately from regular searches
  const fetchItemById = async (
    id: string,
  ): Promise<{ success: boolean; data?: ProductForSelection[] }> => {
    return fetchProducts(id, true);
  };

  const renderProductDetails = (product: ProductForSelection) => (
    <>
      {product.barcode && <span>Barcode: {product.barcode}</span>}
      {product.category && <span>Category: {product.category.name}</span>}
      {product.brand && <span>Brand: {product.brand.name}</span>}
    </>
  );

  // Define columns for the selected products table
  const productColumns: Column<ProductForSelection>[] = [
    { header: 'Product Name', accessor: 'name' },
    {
      header: 'Barcode',
      accessor: (product: ProductForSelection) => product.barcode || 'N/A',
    },
    {
      header: 'Category',
      accessor: (product: ProductForSelection) =>
        product.category?.name || 'N/A',
    },
    {
      header: 'Brand',
      accessor: (product: ProductForSelection) => product.brand?.name || 'N/A',
    },
  ];

  return (
    <EntitySelector<ProductForSelection>
      selectedIds={selectedIds}
      onChange={onChange}
      fetchItems={fetchProducts}
      fetchItemById={fetchItemById}
      renderItemDetails={renderProductDetails}
      placeholder="Search products by name or barcode..."
      noSelectionText="No products selected"
      columns={productColumns}
    />
  );
}
