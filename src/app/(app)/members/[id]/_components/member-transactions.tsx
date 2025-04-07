'use client';

import { Transaction } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface MemberTransactionsProps {
  memberId: string;
  transactions: Transaction[];
}

export default function MemberTransactions({
  memberId,
  transactions,
}: MemberTransactionsProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-mono">
                    {transaction.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transaction.finalAmount)}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {transaction.paymentMethod}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No transaction history found for this member.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
