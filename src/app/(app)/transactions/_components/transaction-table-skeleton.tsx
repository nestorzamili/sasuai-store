import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const TransactionTableSkeleton = React.memo(() => {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-10 w-[384px]" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Skeleton className="h-6 w-6" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-16" />
              </TableHead>
              <TableHead>
                <div className="flex justify-center">
                  <Skeleton className="h-7 w-14" />
                </div>
              </TableHead>
              <TableHead>
                <div className="text-right">
                  <Skeleton className="h-7 w-20 ml-auto" />
                </div>
              </TableHead>
              <TableHead className="w-[80px]">
                <div className="flex justify-end">
                  <Skeleton className="h-7 w-8" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-8" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="ml-auto text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-5 w-[200px]" />
          <div className="flex items-center space-x-6">
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
        </div>
      </div>
    </div>
  );
});
