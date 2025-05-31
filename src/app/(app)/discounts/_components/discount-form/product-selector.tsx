'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('discount.form');

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
      {product.barcode && (
        <span>
          {t('barcode')}: {product.barcode}
        </span>
      )}
      {product.category && (
        <span>
          {t('category')}: {product.category.name}
        </span>
      )}
      {product.brand && (
        <span>
          {t('brand')}: {product.brand.name}
        </span>
      )}
    </>
  );

  // Define columns for the selected products table
  const productColumns: Column<ProductForSelection>[] = [
    { header: t('productName'), accessor: 'name' },
    {
      header: t('barcode'),
      accessor: (product: ProductForSelection) => product.barcode || 'N/A',
    },
    {
      header: t('category'),
      accessor: (product: ProductForSelection) =>
        product.category?.name || 'N/A',
    },
    {
      header: t('brand'),
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
      placeholder={t('searchProducts')}
      noSelectionText={t('noProductsSelected')}
      columns={productColumns}
    />
  );
}
