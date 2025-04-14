import { useFetch } from '@/hooks/use-fetch';
import { ColumnDef } from '@tanstack/react-table';
import { optimalizeGetProduct } from '../../products/action';
import { TableLayout } from '@/components/layout/table-layout';
import { useEffect, useState } from 'react';
interface RelationReturn {
  relationOnChange: (data: any) => void;
  initialSelectedRows?: any;
}
export function DiscountRelationProduct({
  relationOnChange,
  initialSelectedRows,
}: RelationReturn) {
  const fetchProduct = async (options: any) => {
    try {
      const response = await optimalizeGetProduct({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy,
        search: options.search,
        columnFilter: ['name', 'barcode', 'category.name', 'brand.name'],
      });
      return {
        data: response.data,
        totalRows: response.meta.rowsCount,
      };
    } catch (error) {
      console.log('error', error);
      // Return a default value with the expected structure instead of undefined
      return {
        data: [],
        totalRows: 0,
      };
    }
  };
  const {
    data,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    totalRows,
    refresh,
  } = useFetch({
    fetchData: fetchProduct,
    options: {
      page: 0,
      limit: 10,
      search: '',
      sortBy: { id: 'createdAt', desc: false },
    },
    initialPageIndex: 0,
  });
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'id',
      header: 'id',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'barcode',
      header: 'Barcode',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'name',
      header: 'Product',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'Category',
      header: 'category',
      cell: (info) => info.row.original.category.name,
    },
    {
      accessorKey: 'Brand',
      header: 'brand',
      cell: (info) => info.row.original.brand.name,
    },
  ];
  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPage(newPagination.pageIndex);
    setLimit(newPagination.pageSize);
  };

  const handleSortingChange = (newSorting: any) => {
    setSortBy(newSorting);
  };

  const handleSearchChange = (search: string) => {
    setSearch(search);
  };
  const [selectionData, setSelectionData] = useState([]);
  const handleRelationOnchange = (data: any) => {
    setSelectionData(data);
  };

  useEffect(() => {
    relationOnChange(selectionData);
  }, [selectionData]);
  return (
    <>
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
        onSelectionChange={handleRelationOnchange}
        initialSelectedRows={initialSelectedRows || []}
      />
    </>
  );
}
