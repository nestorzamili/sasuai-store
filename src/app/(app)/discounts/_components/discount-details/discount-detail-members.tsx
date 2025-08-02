'use client';

import { useTranslations } from 'next-intl';
import { IconUsers } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SimpleMember {
  id: string;
  name: string;
  tier?: { name: string } | null;
}

interface DiscountDetailMembersProps {
  members: SimpleMember[] | undefined;
}

export function DiscountDetailMembers({ members }: DiscountDetailMembersProps) {
  const t = useTranslations('discount');

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8">
        <IconUsers className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">
          {t('detail.noMembersAssociated')}
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
              <TableHead className="w-1/3">{t('detail.member')}</TableHead>
              <TableHead>{t('detail.tier')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member: SimpleMember) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.tier?.name || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
