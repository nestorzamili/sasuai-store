'use client';

import * as React from 'react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TransactionWithRelations,
  PaginatedTransactionResponse,
  TransactionPaginationParams,
} from '@/lib/types/transaction';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransactionTableSkeleton } from './transaction-table-skeleton';
import { TransactionVoidDialog } from './transaction-void-dialog';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/currency';
import { getPaginatedTransactions, getTransaction } from '../action';
import { debounce } from '@/lib/common/debounce-effect';
import { formatDate, formatDateTime } from '@/lib/date';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconPrinter, IconTrash, IconEye } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { formatMemberInfo } from './transaction-helpers';
import { MemberTierBadge } from '../../members/_components/member-tier-badge';

interface TransactionTableProps {
  initialData?: PaginatedTransactionResponse;
  onView?: (transaction: TransactionWithRelations) => void;
  filterParams?: {
    paymentMethod?: string;
    startDate?: Date;
    endDate?: Date;
    cashierId?: string;
    memberId?: string;
  };
}

export function TransactionTable({
  initialData,
  onView,
  filterParams,
}: TransactionTableProps) {
  // Void dialog state
  const [voidState, setVoidState] = useState<{
    isOpen: boolean;
    transaction: TransactionWithRelations | null;
  }>({
    isOpen: false,
    transaction: null,
  });

  // Server-side state with combined paginationData and loading state
  const [tableState, setTableState] = useState<{
    paginationData: PaginatedTransactionResponse;
    paginationParams: TransactionPaginationParams;
    isLoading: boolean;
    searchQuery: string;
  }>({
    paginationData: initialData || {
      transactions: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    },
    paginationParams: {
      page: 1,
      pageSize: 10,
      sortField: 'createdAt',
      sortDirection: 'desc',
      ...filterParams, // Apply filter params here
    },
    isLoading: !initialData,
    searchQuery: '',
  });

  // Table UI state
  const [tableUIState, setTableUIState] = useState<{
    sorting: SortingState;
    columnVisibility: VisibilityState;
    rowSelection: Record<string, boolean>;
  }>({
    sorting: [],
    columnVisibility: {},
    rowSelection: {},
  });

  // Create stable reference to debouncedSearch
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: { ...prev.paginationParams, page: 1 },
          searchQuery: value,
        }));
      }, 300),
    [],
  );

  // Load data from server
  const loadData = useCallback(async () => {
    setTableState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await getPaginatedTransactions({
        ...tableState.paginationParams,
        search: tableState.searchQuery,
        ...filterParams, // Make sure filterParams are applied on every load
      });

      if (response.success && response.data) {
        setTableState((prev) => ({
          ...prev,
          paginationData: response.data as PaginatedTransactionResponse,
          isLoading: false,
        }));
      } else {
        setTableState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setTableState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [tableState.paginationParams, tableState.searchQuery, filterParams]);

  // Initial data load
  useEffect(() => {
    if (!initialData) {
      loadData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to load data when pagination params or search query change
  useEffect(() => {
    loadData();
  }, [tableState.paginationParams, tableState.searchQuery, loadData]);

  // Event handlers - combined and simplified
  const handlers = useMemo(
    () => ({
      // View transaction
      onViewTransaction: async (transaction: any) => {
        if (onView) {
          try {
            // Fetch complete transaction details before viewing
            const result = await getTransaction(transaction.id);
            if (result.success && result.data) {
              onView(result.data);
            } else {
              toast({
                title: 'Error',
                description: 'Failed to load transaction details',
                variant: 'destructive',
              });
            }
          } catch (error) {
            console.error('Error loading transaction details:', error);
            toast({
              title: 'Error',
              description: 'An unexpected error occurred',
              variant: 'destructive',
            });
          }
        }
      },

      // Void transaction handling
      onVoidClick: (transaction: TransactionWithRelations) => {
        setVoidState({ isOpen: true, transaction });
      },

      onVoidDialogChange: (isOpen: boolean) => {
        setVoidState((prev) => ({ ...prev, isOpen }));
      },

      onVoidSuccess: () => {
        loadData();
      },

      // Search handling
      onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
      },

      // Pagination handling
      onPageChange: (page: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: { ...prev.paginationParams, page },
        }));
      },

      onPageSizeChange: (pageSize: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: { ...prev.paginationParams, pageSize, page: 1 },
        }));
      },

      // Table navigation
      goToPage: (pageIndex: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            page: pageIndex + 1, // Convert to 1-indexed for server
          },
        }));
      },

      previousPage: () => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            page: Math.max(1, prev.paginationParams.page - 1),
          },
        }));
      },

      nextPage: () => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            page: Math.min(
              prev.paginationData.totalPages,
              prev.paginationParams.page + 1,
            ),
          },
        }));
      },

      setPageSize: (size: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            pageSize: size,
            page: 1,
          },
        }));
      },

      // Sorting handling
      onSortingChange: (
        updaterOrValue: SortingState | ((old: SortingState) => SortingState),
      ) => {
        const newSorting =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(tableUIState.sorting)
            : updaterOrValue;

        setTableUIState((prev) => ({ ...prev, sorting: newSorting }));

        if (newSorting.length) {
          setTableState((prev) => ({
            ...prev,
            paginationParams: {
              ...prev.paginationParams,
              sortField: newSorting[0].id,
              sortDirection: newSorting[0].desc ? 'desc' : 'asc',
              page: 1,
            },
          }));
        }
      },

      // UI state changes
      onColumnVisibilityChange: (
        updaterOrValue:
          | VisibilityState
          | ((old: VisibilityState) => VisibilityState),
      ) => {
        const newVisibility =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(tableUIState.columnVisibility)
            : updaterOrValue;

        setTableUIState((prev) => ({
          ...prev,
          columnVisibility: newVisibility,
        }));
      },

      onRowSelectionChange: (
        updaterOrValue:
          | Record<string, boolean>
          | ((old: Record<string, boolean>) => Record<string, boolean>),
      ) => {
        const newSelection =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(tableUIState.rowSelection)
            : updaterOrValue;

        setTableUIState((prev) => ({ ...prev, rowSelection: newSelection }));
      },
    }),
    [debouncedSearch, loadData, tableUIState.sorting, onView],
  );

  // Helper function for payment method badge
  const getPaymentMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return <Badge variant="secondary">Cash</Badge>;
      case 'card':
        return <Badge variant="outline">Card</Badge>;
      case 'transfer':
        return <Badge variant="default">Transfer</Badge>;
      default:
        return <Badge variant="secondary">{method}</Badge>;
    }
  };

  // Table columns definition - memoized
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      // Selection column
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => {
                table.toggleAllPageRowsSelected(!!value);
              }}
              aria-label="Select all"
              className="border-primary"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                row.toggleSelected(!!value);
              }}
              aria-label="Select row"
              className="border-primary"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },

      // Transaction ID column
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Transaction ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium truncate max-w-[150px]">
            {row.getValue('id')}
          </div>
        ),
      },

      // Date column
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-sm">
              <div className="font-medium">{formatDate(date)}</div>
              <div className="text-muted-foreground">
                {date.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        },
      },

      // Cashier column
      {
        accessorKey: 'cashierName',
        header: 'Cashier',
        cell: ({ row }) => <div>{row.getValue('cashierName')}</div>,
      },

      // Updated Member column
      {
        accessorKey: 'memberName',
        header: 'Member',
        cell: ({ row }) => {
          const isGuest = !row.getValue('memberName');

          if (isGuest) {
            return <span className="text-muted-foreground">Guest</span>;
          }

          // For detailed view, we'd need the full member object
          // This is a simplified version
          return (
            <div className="flex flex-col">
              <span>{row.getValue('memberName')}</span>
              {row.original.memberPoints && row.original.memberPoints > 0 && (
                <span className="text-xs text-primary">
                  +{row.original.memberPoints} points
                </span>
              )}
            </div>
          );
        },
      },

      // Payment Method column
      {
        accessorKey: 'paymentMethod',
        header: 'Payment',
        cell: ({ row }) => getPaymentMethodBadge(row.getValue('paymentMethod')),
      },

      // Item Count column
      {
        accessorKey: 'itemCount',
        header: 'Items',
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('itemCount')}</div>
        ),
      },

      // Total Amount column
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatRupiah(row.getValue('totalAmount'))}
          </div>
        ),
      },

      // Actions column
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          // Since we're using the row data directly from initialData, it should have all fields
          const transaction = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => handlers.onViewTransaction(transaction)}
                  >
                    View Details <IconEye className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex justify-between cursor-pointer">
                    Print Receipt <IconPrinter className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handlers.onVoidClick(transaction)}
                  >
                    Void Transaction <IconTrash className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handlers],
  );

  // Create table instance
  const table = useReactTable({
    data: tableState.paginationData.transactions,
    columns,
    pageCount: tableState.paginationData.totalPages,
    onSortingChange: handlers.onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: handlers.onColumnVisibilityChange,
    onRowSelectionChange: handlers.onRowSelectionChange,
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting: tableUIState.sorting,
      columnVisibility: tableUIState.columnVisibility,
      rowSelection: tableUIState.rowSelection,
      pagination: {
        pageIndex: tableState.paginationParams.page - 1, // Convert to 0-indexed for table
        pageSize: tableState.paginationParams.pageSize,
      },
    },
  });

  // Show skeleton while loading initial data
  if (tableState.isLoading && !tableState.paginationData.transactions.length) {
    return <TransactionTableSkeleton />;
  }

  return (
    <>
      {/* Search input */}
      <div className="space-y-4">
        <Input
          placeholder="Search by transaction ID, cashier, or member..."
          defaultValue={tableState.searchQuery}
          onChange={handlers.onSearchChange}
          className="max-w-sm"
        />

        {/* Table with loading state indicator */}
        <div className="rounded-md border relative">
          {tableState.isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tableState.paginationData.transactions.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span className="mr-2">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </span>
            )}
            <span>
              Total: {tableState.paginationData.totalCount} transactions
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rows per page</span>
              <Select
                value={`${tableState.paginationParams.pageSize}`}
                onValueChange={(value) => {
                  handlers.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={tableState.paginationParams.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex w-[120px] items-center justify-center text-sm font-medium">
                Page {tableState.paginationParams.page} of{' '}
                {tableState.paginationData.totalPages || 1}
              </div>

              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlers.goToPage(0)}
                disabled={tableState.paginationParams.page <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <DoubleArrowLeftIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlers.previousPage}
                disabled={tableState.paginationParams.page <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handlers.nextPage}
                disabled={
                  tableState.paginationParams.page >=
                  tableState.paginationData.totalPages
                }
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() =>
                  handlers.goToPage(tableState.paginationData.totalPages - 1)
                }
                disabled={
                  tableState.paginationParams.page >=
                  tableState.paginationData.totalPages
                }
              >
                <span className="sr-only">Go to last page</span>
                <DoubleArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Void dialog - Conditional rendering with short-circuit */}
      {voidState.isOpen && voidState.transaction && (
        <TransactionVoidDialog
          open={voidState.isOpen}
          onOpenChange={handlers.onVoidDialogChange}
          transaction={voidState.transaction}
          onSuccess={handlers.onVoidSuccess}
        />
      )}
    </>
  );
}
