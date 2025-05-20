'use client';

import { getProductsForSelection } from '../../action';
import EntitySelector from './entity-selector';

interface Product {
  id: string;
  name: string;
  barcode?: string | null;
  category?: {
    name: string;
  };
  brand?: {
    name: string;
  } | null;
  primaryImage?: string | null;
}

interface ProductSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ProductSelector({
  selectedIds,
  onChange,
}: ProductSelectorProps) {
  const fetchProducts = async (
    search: string,
    isIdSearch = false,
  ): Promise<{ success: boolean; data?: Product[] }> => {
    try {
      // If this is an ID search, format the query appropriately
      const searchParam = isIdSearch ? `id:${search}` : search;
      const products = await getProductsForSelection(searchParam);

      if (Array.isArray(products)) {
        return {
          success: true,
          data: products,
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
  ): Promise<{ success: boolean; data?: Product[] }> => {
    return fetchProducts(id, true);
  };

  const renderProductDetails = (product: Product) => (
    <>
      {product.barcode && <span>Barcode: {product.barcode}</span>}
      {product.category && <span>Category: {product.category.name}</span>}
      {product.brand && <span>Brand: {product.brand.name}</span>}
    </>
  );

  // Define columns for the selected products table
  const productColumns = [
    { header: 'Product Name', accessor: 'name' },
    {
      header: 'Barcode',
      accessor: (product: Product) => product.barcode || 'N/A',
    },
    {
      header: 'Category',
      accessor: (product: Product) => product.category?.name || 'N/A',
    },
    {
      header: 'Brand',
      accessor: (product: Product) => product.brand?.name || 'N/A',
    },
  ];

  return (
    <EntitySelector<Product>
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
