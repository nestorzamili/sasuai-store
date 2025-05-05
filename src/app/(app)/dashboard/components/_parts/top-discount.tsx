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
import { Progress } from '@/components/ui/progress';

// Top discounts data
const topDiscounts = [
  {
    id: 'DSC001',
    name: 'Summer Sale',
    code: 'SUMMER25',
    discount: '25%',
    usageCount: 452,
    usagePercent: 85,
    revenue: '$14,280.00',
    status: 'active',
  },
  {
    id: 'DSC002',
    name: 'New Customer',
    code: 'WELCOME15',
    discount: '15%',
    usageCount: 387,
    usagePercent: 72,
    revenue: '$9,675.00',
    status: 'active',
  },
  {
    id: 'DSC003',
    name: 'Clearance',
    code: 'CLEAR40',
    discount: '40%',
    usageCount: 283,
    usagePercent: 60,
    revenue: '$7,075.00',
    status: 'active',
  },
  {
    id: 'DSC004',
    name: 'Holiday Special',
    code: 'HOLIDAY20',
    discount: '20%',
    usageCount: 196,
    usagePercent: 45,
    revenue: '$4,900.00',
    status: 'expired',
  },
  {
    id: 'DSC005',
    name: 'Loyalty Reward',
    code: 'LOYAL10',
    discount: '10%',
    usageCount: 174,
    usagePercent: 32,
    revenue: '$3,480.00',
    status: 'active',
  },
];

export function TopDiscount() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Top Discount Codes
        </CardTitle>
        <CardDescription>
          Most used discount codes and their performance
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promotion</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topDiscounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell>
                  <div className="font-medium">{discount.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <code className="bg-muted px-1 py-0.5 rounded">
                      {discount.code}
                    </code>
                    <span>{discount.discount} off</span>
                    {discount.status === 'expired' && (
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground"
                      >
                        Expired
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {discount.usageCount} uses
                    </span>
                    <span className="text-xs font-medium">
                      {discount.usagePercent}%
                    </span>
                  </div>
                  <Progress value={discount.usagePercent} className="h-2" />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {discount.revenue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
