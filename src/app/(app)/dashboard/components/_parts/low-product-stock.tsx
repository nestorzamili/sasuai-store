import {
  Table,
  TableBody,
  TableCell,
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
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { getLowStockProducts } from '../../actions';
import { LowStockBatchData } from '@/lib/types/dashboard';
import { LoaderCardContent } from '@/components/loader-card-content';
import { UnavailableData } from '@/components/unavailable-data';

export function LowProductStock() {
  const [products, setProducts] = useState<LowStockBatchData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Define the threshold for low stock (could be made configurable)
  const threshold = 10;

  const fetchLowStockProducts = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      const response = await getLowStockProducts(threshold);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        setProducts(response.data);
        setTotalCount(response.totalCount || 0);
      } else {
        setProducts([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching low stock products:', error);
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    fetchLowStockProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchLowStockProducts]);
  return (
    <Card className="h-full">
      {' '}
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-base font-medium flex items-center">
            Low Stock Alert
            {totalCount > 0 && (
              <Badge
                className={`ml-2 ${
                  totalCount > 10
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {totalCount} items
              </Badge>
            )}
          </CardTitle>
        </div>
        <CardDescription>
          Products that need reordering soon
          {totalCount > products.length &&
            ` (showing top ${products.length} of ${totalCount})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <LoaderCardContent className="w-full h-full" />
          </div>
        ) : products.length === 0 ? (
          <UnavailableData
            title="No Low Stock Products"
            description="All products have sufficient stock levels."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                // Calculate stock percentage
                const stockPercentage = Math.round(
                  (product.remainingQuantity / product.initialQuantity) * 100
                );

                // Determine status based on remaining quantity
                const status =
                  product.remainingQuantity <= threshold * 0.3
                    ? 'critical'
                    : 'low';

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.product.category.name} • {product.batchCode}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {product.remainingQuantity} units
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {stockPercentage}% of initial{' '}
                          {product.initialQuantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {status === 'critical' ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          Critical
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Low
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          new Date(product.expiryDate) < new Date()
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }
                      >
                        {format(new Date(product.expiryDate), 'dd MMM yyyy')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
