'use client';

import { useState, useMemo } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Filter, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StockOutComplete, StockMovement } from '@/lib/types/stock-movement';
import { format, formatDistance } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StockOutTableProps {
  data: (StockOutComplete | StockMovement)[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function StockOutTable({
  data,
  isLoading = false,
  onRefresh,
}: StockOutTableProps) {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true }, // Default sort by date, newest first
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<
    StockOutComplete | StockMovement | null
  >(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Format date function
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP');
  };

  // Get relative time for better UX
  const getRelativeTime = (date: Date | string) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };

  // Group data by transaction (for better overview)
  const groupedByDate = useMemo(() => {
    const grouped = new Map<string, (StockOutComplete | StockMovement)[]>();
    data.forEach((item) => {
      const dateKey = format(new Date(item.date), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(item);
    });
    return grouped;
  }, [data]);

  // Calculate statistics for better insights
  const stats = useMemo(() => {
    let manualCount = 0;
    let transactionCount = 0;
    let totalQuantity = 0;

    data.forEach((item) => {
      if ('transactionId' in item && item.transactionId) {
        transactionCount++;
      } else {
        manualCount++;
      }
      totalQuantity += item.quantity;
    });

    return { manualCount, transactionCount, totalQuantity };
  }, [data]);

  // Define columns with proper type handling and improved UX
  const columns: ColumnDef<StockOutComplete | StockMovement>[] = [
    // Selection column
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Product and Batch column (combined for better readability)
    {
      id: 'product',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="whitespace-nowrap"
        >
          Product & Batch
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const productName = row.original.batch?.product?.name;
        const batchCode = row.original.batch?.batchCode;
        return (
          <div className="flex flex-col">
            <div className="font-medium">{productName || 'Unknown'}</div>
            <div className="text-xs text-muted-foreground">
              Batch: {batchCode || 'N/A'}
            </div>
          </div>
        );
      },
      accessorFn: (row) => row.batch?.product?.name || '',
    },

    // Source/Type column with enhanced badges
    {
      id: 'source',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Source
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        // Determine if it's a transaction or manual stock out
        const isTransaction =
          'transactionId' in row.original && row.original.transactionId;
        return (
          <div>
            {isTransaction ? (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
              >
                Transaction
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
              >
                Manual
              </Badge>
            )}
          </div>
        );
      },
      accessorFn: (row) =>
        'transactionId' in row && row.transactionId ? 'Transaction' : 'Manual',
    },

    // Date column with relative time for better UX
    {
      accessorKey: 'date',
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
        const date = new Date(row.original.date);
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm">
                  <div>{formatDate(date)}</div>
                  <div className="text-xs text-muted-foreground">
                    {getRelativeTime(date)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{date.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },

    // Quantity column with unit information
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-end text-right"
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const quantity = row.getValue('quantity') as number;
        const unit = row.original.unit?.symbol || '';
        return (
          <div className="text-right font-medium">
            {quantity} {unit}
          </div>
        );
      },
    },

    // Details column (Reason or Transaction ID) with improved display
    {
      id: 'details',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        // For transaction stock outs, show transaction ID
        if ('transactionId' in row.original && row.original.transactionId) {
          const transactionId = row.original.transactionId;
          return (
            <div className="flex items-center">
              <span className="mr-1 text-xs text-muted-foreground">ID:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-2 py-1 h-auto font-mono text-xs"
                      onClick={() => {
                        setSelectedItem(row.original);
                        setDetailsOpen(true);
                      }}
                    >
                      {transactionId.substring(0, 8)}...
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to view transaction details</p>
                    <p className="font-mono text-xs">{transactionId}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }

        // For manual stock outs, show reason with proper formatting
        const reason = row.original.reason || '';
        if (reason.length > 20) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 h-auto text-xs text-left justify-start font-normal w-full max-w-[200px] truncate"
                    onClick={() => {
                      setSelectedItem(row.original);
                      setDetailsOpen(true);
                    }}
                  >
                    {reason.substring(0, 20)}...
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <p className="whitespace-pre-wrap">{reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <Button
            variant="ghost"
            className="px-2 py-1 h-auto text-xs text-left justify-start font-normal"
            onClick={() => {
              setSelectedItem(row.original);
              setDetailsOpen(true);
            }}
          >
            {reason || (
              <span className="text-muted-foreground">No reason provided</span>
            )}
          </Button>
        );
      },
      accessorFn: (row) => {
        if ('transactionId' in row && row.transactionId) {
          return `Transaction: ${row.transactionId}`;
        }
        return row.reason || '';
      },
    },

    // Actions column
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedItem(row.original);
            setDetailsOpen(true);
          }}
          className="h-8 w-8"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">View details</span>
        </Button>
      ),
    },
  ];

  // Create table instance with improved filtering and sorting
  const table = useReactTable({
    data,
    columns,
    onGlobalFilterChange: setSearchQuery,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: searchQuery,
    },
  });

  // Show skeleton while loading
  if (isLoading) {
    return <StockOutTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <Input
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!columnFilters.some((f) => f.id === 'source')}
                onCheckedChange={() => {
                  setColumnFilters((prev) =>
                    prev.filter((f) => f.id !== 'source'),
                  );
                }}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnFilters.some(
                  (f) => f.id === 'source' && f.value === 'Manual',
                )}
                onCheckedChange={() => {
                  setColumnFilters((prev) => [
                    ...prev.filter((f) => f.id !== 'source'),
                    { id: 'source', value: 'Manual' },
                  ]);
                }}
              >
                Manual Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnFilters.some(
                  (f) => f.id === 'source' && f.value === 'Transaction',
                )}
                onCheckedChange={() => {
                  setColumnFilters((prev) => [
                    ...prev.filter((f) => f.id !== 'source'),
                    { id: 'source', value: 'Transaction' },
                  ]);
                }}
              >
                Transactions Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Toggle columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Stock Movement Details</DialogTitle>
            <DialogDescription>
              Details about this stock movement record
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <Tabs defaultValue="details" className="mt-2">
              <TabsList className="grid grid-cols-2 w-[200px]">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="product">Product</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {formatDate(selectedItem.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(selectedItem.date), 'p')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Source</p>
                    <div>
                      {'transactionId' in selectedItem &&
                      selectedItem.transactionId ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          Transaction
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                        >
                          Manual
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">
                      {selectedItem.quantity} {selectedItem.unit.symbol}
                    </p>
                  </div>

                  {'transactionId' in selectedItem &&
                  selectedItem.transactionId ? (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Transaction ID
                      </p>
                      <p className="font-mono text-xs overflow-hidden text-ellipsis">
                        {selectedItem.transactionId}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Performed By
                      </p>
                      <p className="font-medium">System User</p>
                    </div>
                  )}

                  <div className="col-span-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {'transactionId' in selectedItem &&
                      selectedItem.transactionId
                        ? 'Transaction Reference'
                        : 'Reason'}
                    </p>
                    <p className="bg-muted p-2 rounded-md whitespace-pre-wrap text-sm">
                      {'transactionId' in selectedItem &&
                      selectedItem.transactionId
                        ? 'Stock reduction from sales transaction'
                        : selectedItem.reason || 'No reason provided'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="product" className="pt-3">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Product</p>
                    <p className="font-medium">
                      {selectedItem.batch?.product?.name || 'Unknown Product'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Batch Code
                      </p>
                      <p className="font-medium">
                        {selectedItem.batch?.batchCode || 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Unit</p>
                      <p className="font-medium">
                        {selectedItem.unit?.name || 'N/A'} (
                        {selectedItem.unit?.symbol || ''})
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {/* If needed, add actions here like print or edit buttons */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StockOutTableSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-10 w-[384px]" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-7 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={`${rowIndex}-${cellIndex}`}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
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
}
