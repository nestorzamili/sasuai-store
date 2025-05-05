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

// Low stock products data
const lowStockProducts = [
  {
    id: 'PRD037',
    name: 'Wireless Earbuds Pro',
    category: 'Electronics',
    currentStock: 5,
    minRequired: 15,
    status: 'critical',
    reorderStatus: 'pending',
  },
  {
    id: 'PRD054',
    name: 'Ultra HD Monitor 27"',
    category: 'Electronics',
    currentStock: 3,
    minRequired: 10,
    status: 'critical',
    reorderStatus: 'ordered',
  },
  {
    id: 'PRD089',
    name: 'Premium Leather Belt',
    category: 'Accessories',
    currentStock: 8,
    minRequired: 20,
    status: 'low',
    reorderStatus: 'pending',
  },
  {
    id: 'PRD112',
    name: 'Fitness Tracker Band',
    category: 'Wearables',
    currentStock: 7,
    minRequired: 15,
    status: 'low',
    reorderStatus: 'pending',
  },
  {
    id: 'PRD126',
    name: 'Bluetooth Speaker',
    category: 'Audio',
    currentStock: 4,
    minRequired: 12,
    status: 'critical',
    reorderStatus: 'ordered',
  },
];

export function LowProductStock() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-base font-medium">
            Low Stock Alert
          </CardTitle>
        </div>
        <CardDescription>Products that need reordering soon</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.category}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {product.currentStock} units
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Min: {product.minRequired}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {product.status === 'critical' ? (
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
                  {product.reorderStatus === 'ordered' ? (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Ordered
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground"
                    >
                      Pending
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
