import { TableLayout } from '@/components/layout/table-layout';
import { ColumnDef } from '@tanstack/react-table';
import { getAllProducts } from '../../products/action';
import { useCallback, useEffect, useState } from 'react';
export const DiscountProductRelation = () => {
  type Product = {
    productName: string;
  };

  const columns: ColumnDef<Product>[] = [
    { header: 'Product Name', accessorKey: 'productName' },
  ];
  const fetchProduct = async () => {
    try {
      const response = await getAllProducts();
      console.log('response', response);
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetchProduct();
      console.log('Products:', response?.data);
      // if (response) {
      //   // setProducts(response.data);
      // }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  return (
    <div>
      <TableLayout columns={columns} data={[]} />
    </div>
  );
};
