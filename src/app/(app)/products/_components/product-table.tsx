'use client';

import * as React from 'react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye } from 'lucide-react';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getPaginatedProducts } from '../action';
import { formatRupiah } from '@/lib/currency';
import { ProductDeleteDialog } from './product-delete-dialog';
import { ProductWithRelations } from '@/lib/types/product';
import { TableFetchOptions } from '@/hooks/use-fetch';

interface ProductTableProps {
  onEdit?: (product: ProductWithRelations) => void;
  filterParams?: {
    isActive?: boolean;
    categoryId?: string;
    brandId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  filterToolbar?: React.ReactNode;
}

export function ProductTable({
  onEdit,
  filterParams,
  filterToolbar,
}: ProductTableProps) {
  // Combine deletion dialog state
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    product: ProductWithRelations | null;
  }>({
    isOpen: false,
    product: null,
  });

  // Define the fetch function for products
  const fetchProducts = async (
    options: TableFetchOptions,
  ): Promise<{
    data: ProductWithRelations[];
    totalRows: number;
  }> => {
    const response = await getPaginatedProducts({
      page: (options.page ?? 0) + 1, // Convert from 0-indexed to 1-indexed
      pageSize: options.limit ?? 10,
      sortField: options.sortBy?.id || 'name',
      sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
      search: options.search,
      ...filterParams, // Apply additional filter params
      ...options.filters, // Apply filters from the table
    });

    // Add proper type checking to handle potentially undefined data
    // Map API response to ensure it matches the ProductWithRelations type
    const products =
      response.success && response.data
        ? (response.data.products.map(
            (product: {
              id: string;
              name: string;
              price: number;
              [key: string]: any; // Allow other properties
            }) => ({
              ...product,
              sellPrice: product.price, // Map price to sellPrice if it doesn't exist
            }),
          ) as ProductWithRelations[])
        : [];

    return {
      data: products,
      totalRows:
        response.success && response.data ? response.data.totalCount : 0,
    };
  };

  const {
    data,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setFilters,
    totalRows,
    refresh,
  } = useFetch<ProductWithRelations[]>({
    fetchData: fetchProducts,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  // Handle pagination change
  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPage(newPagination.pageIndex);
    setLimit(newPagination.pageSize);
  };

  // Handle sorting change
  const handleSortingChange = (newSorting: any) => {
    setSortBy(newSorting);
  };

  // Handle search change
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle delete confirmation
  const handleDeleteClick = (product: ProductWithRelations) => {
    setDeleteState({ isOpen: true, product });
  };

  // Handle dialog open state change
  const handleDeleteDialogChange = (isOpen: boolean) => {
    setDeleteState((prev) => ({ ...prev, isOpen }));
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    refresh(); // Refresh the data after successful deletion
  };

  // Define table columns
  const columns: ColumnDef<ProductWithRelations>[] = [
    {
      header: 'Product Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }) => {
        const description = row.original.description || 'No description';
        return (
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {description}
          </div>
        );
      },
    },
    {
      header: 'Category',
      accessorKey: 'category.name',
      cell: ({ row }) => <div>{row.original.category.name}</div>,
    },
    {
      header: 'Brand',
      accessorKey: 'brand.name',
      cell: ({ row }) => <div>{row.original.brand?.name || 'N/A'}</div>,
    },
    {
      header: 'Barcode',
      accessorKey: 'barcode',
      cell: ({ row }) => <div>{row.original.barcode || 'N/A'}</div>,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: ({ row }) => (
        <div className="text-right">{formatRupiah(row.original.price)}</div>
      ),
    },
    {
      header: 'Stock',
      accessorKey: 'currentStock',
      cell: ({ row }) => {
        const stock = row.original.currentStock;
        return (
          <div className="flex items-center justify-center">
            <Badge
              variant={
                stock <= 5
                  ? 'destructive'
                  : stock <= 10
                  ? 'secondary'
                  : 'outline'
              }
            >
              {stock} {row.original.unit.symbol}
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => {
        return row.original.isActive ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const product = row.original;
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
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => onEdit?.(product)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(product)}
                >
                  Delete <IconTrash className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Table Layout Component */}
      <TableLayout
        data={data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={options.pagination}
        handlePaginationChange={handlePaginationChange}
        handleSortingChange={handleSortingChange}
        handleSearchChange={handleSearchChange}
        totalRows={totalRows}
        enableSelection={true}
        filterToolbar={filterToolbar}
      />

      {/* Delete dialog */}
      {deleteState.isOpen && deleteState.product && (
        <ProductDeleteDialog
          open={deleteState.isOpen}
          onOpenChange={handleDeleteDialogChange}
          product={deleteState.product}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
