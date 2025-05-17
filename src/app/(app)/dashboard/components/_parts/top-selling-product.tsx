import {
  Table,
  TableBody,
  TableCaption,
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
import { useEffect } from 'react';

// Top selling products data
const topProducts = [
  {
    id: 'PRD001',
    name: 'Premium T-Shirt',
    category: 'Clothing',
    sold: 287,
    revenue: '$8,610.00',
    trend: 'up',
  },
  {
    id: 'PRD002',
    name: 'Wireless Earbuds',
    category: 'Electronics',
    sold: 254,
    revenue: '$12,700.00',
    trend: 'up',
  },
  {
    id: 'PRD003',
    name: 'Leather Wallet',
    category: 'Accessories',
    sold: 198,
    revenue: '$5,940.00',
    trend: 'down',
  },
  {
    id: 'PRD004',
    name: 'Smart Watch',
    category: 'Electronics',
    sold: 187,
    revenue: '$28,050.00',
    trend: 'up',
  },
  {
    id: 'PRD005',
    name: 'Yoga Mat',
    category: 'Fitness',
    sold: 156,
    revenue: '$4,680.00',
    trend: 'stable',
  },
];

export function TopSellingProduct(filter?: any) {
  const fetchTopSellingProducts = async () => {
    try {
      const response = await getTopSellingProductsByQuantity(filter);
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      return {
        success: false,
        error: 'Failed to fetch top selling products',
      };
    }
  };
  useEffect(() => {
    fetchTopSellingProducts();
  }, [filter]);
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
            {topProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  {product.name}
                  {product.trend === 'up' && (
                    <Badge className="ml-2 bg-green-500">↑</Badge>
                  )}
                  {product.trend === 'down' && (
                    <Badge className="ml-2 bg-red-500">↓</Badge>
                  )}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.sold}</TableCell>
                <TableCell className="text-right">{product.revenue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total Revenue</TableCell>
              <TableCell className="text-right">1,082</TableCell>
              <TableCell className="text-right">$59,980.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
