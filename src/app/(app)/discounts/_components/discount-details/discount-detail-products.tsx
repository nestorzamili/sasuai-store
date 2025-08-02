'use client';

import { useTranslations } from 'next-intl';
import { IconBoxSeam } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SimpleProduct {
  id: string;
  name: string;
  barcode?: string | null;
  category?: { name: string } | null;
  brand?: { name: string } | null;
}

interface DiscountDetailProductsProps {
  products: SimpleProduct[] | undefined;
}

export function DiscountDetailProducts({
  products,
}: DiscountDetailProductsProps) {
  const t = useTranslations('discount');

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <IconBoxSeam className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">
          {t('detail.noProductsAssociated')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="max-h-[50vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-1/3">{t('detail.product')}</TableHead>
              <TableHead>{t('detail.barcode')}</TableHead>
              <TableHead>{t('detail.category')}</TableHead>
              <TableHead>{t('detail.brand')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: SimpleProduct) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-mono text-xs">
                  {product.barcode || 'N/A'}
                </TableCell>
                <TableCell>{product.category?.name || 'N/A'}</TableCell>
                <TableCell>{product.brand?.name || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
