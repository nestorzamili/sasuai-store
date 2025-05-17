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
  ): Promise<{ success: boolean; data?: Product[] }> => {
    try {
      const products = await getProductsForSelection(search);

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
      renderItemDetails={renderProductDetails}
      placeholder="Search products by name or barcode..."
      noSelectionText="No products selected"
      columns={productColumns}
    />
  );
}
