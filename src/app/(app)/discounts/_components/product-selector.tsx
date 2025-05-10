'use client';

import { getProductsForSelection } from '../action';
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
      const response = await getProductsForSelection(search);
      if (response.success && 'products' in response) {
        return {
          success: true,
          data: response.products as Product[],
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
      {product.category && <span>{product.category.name}</span>}
      {product.brand && <span>{product.brand.name}</span>}
      {product.barcode && <span>Barcode: {product.barcode}</span>}
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
      placeholder="Search products..."
      noSelectionText="No products selected"
      columns={productColumns}
    />
  );
}
