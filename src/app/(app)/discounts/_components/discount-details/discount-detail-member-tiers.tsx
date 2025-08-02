'use client';

import { useTranslations } from 'next-intl';
import { IconBadge } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SimpleMemberTier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
}

interface DiscountDetailMemberTiersProps {
  memberTiers: SimpleMemberTier[] | undefined;
}

export function DiscountDetailMemberTiers({
  memberTiers,
}: DiscountDetailMemberTiersProps) {
  const t = useTranslations('discount');

  if (!memberTiers || memberTiers.length === 0) {
    return (
      <div className="text-center py-8">
        <IconBadge className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">
          {t('detail.noTiersAssociated')}
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
              <TableHead className="w-1/3">{t('detail.tierName')}</TableHead>
              <TableHead>{t('detail.minPoints')}</TableHead>
              <TableHead>{t('detail.multiplier')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberTiers.map((tier: SimpleMemberTier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell>{tier.minPoints}</TableCell>
                <TableCell>{tier.multiplier}x</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
