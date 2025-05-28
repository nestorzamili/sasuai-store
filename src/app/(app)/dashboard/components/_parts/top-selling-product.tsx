import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTopSellingProductsByQuantity } from '@/app/(app)/dashboard/actions';
import { useEffect, useState, useCallback } from 'react';
import { DateFilter as FilterDateFilter } from '@/lib/types/filter';
import { LoaderCardContent } from '@/components/loader-card-content';
import { UnavailableData } from '@/components/unavailable-data';

// Define interfaces for type safety
interface TopSellingProductProps {
  filter?: FilterDateFilter;
}

interface ProductData {
  batchId: string;
  _sum: {
    quantity: number | null;
  };
  batch?: {
    id: string;
    product: {
      id: string;
      name: string;
      categoryId: string;
      price: number;
    };
  };
}

export function TopSellingProduct({ filter }: TopSellingProductProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTopSellingProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Convert FilterDateFilter to ExtendedDateFilter format expected by the API
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 7); // Last 7 days
      const defaultEnd = new Date();

      const apiFilter = {
        startDate:
          filter?.from instanceof Date
            ? filter.from.toISOString().split('T')[0]
            : filter?.from
              ? String(filter.from)
              : defaultStart.toISOString().split('T')[0],
        endDate:
          filter?.to instanceof Date
            ? filter.to.toISOString().split('T')[0]
            : filter?.to
              ? String(filter.to)
              : defaultEnd.toISOString().split('T')[0],
      };

      const response = await getTopSellingProductsByQuantity(apiFilter);

      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTopSellingProducts();
  }, [fetchTopSellingProducts]);

  // Calculate totals
  const totalUnits = products.reduce(
    (sum, product) => sum + (product._sum.quantity || 0),
    0,
  );
  const totalRevenue = products.reduce((sum, product) => {
    const quantity = product._sum.quantity || 0;
    const price = product.batch?.product.price || 0;
    return sum + quantity * price;
  }, 0);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Top Selling Products
        </CardTitle>
        <CardDescription>
          Products with highest sales volume this period
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <LoaderCardContent className="w-full h-full" />
          </div>
        ) : products.length === 0 ? (
          <UnavailableData
            title="No Product Data"
            description="No product sales data available for the selected period."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 5).map((product, index) => {
                const quantity = product._sum.quantity || 0;
                const price = product.batch?.product.price || 0;
                const revenue = quantity * price;

                return (
                  <TableRow key={product.batchId}>
                    <TableCell className="font-medium">
                      {product.batch?.product.name || 'Unknown Product'}
                      {index < 3 && (
                        <Badge className="ml-2 bg-green-500">↑</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.batch?.product.categoryId || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">{quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatRupiah(revenue)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{totalUnits}</TableCell>
                <TableCell className="text-right">
                  {formatRupiah(totalRevenue)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
