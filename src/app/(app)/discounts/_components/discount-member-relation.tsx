import { useFetch } from '@/hooks/use-fetch';
import { ColumnDef } from '@tanstack/react-table';
import { TableLayout } from '@/components/layout/table-layout';
import { optimalizeGetMember } from '../../members/action';
import { useEffect, useState } from 'react';
interface RelationReturn {
  relationOnChange: (data: any) => void;
  initialSelectedRows?: any;
}
export function DiscountRelationMember({
  relationOnChange,
  initialSelectedRows,
}: RelationReturn) {
  const fetchMember = async (options: any) => {
    try {
      const response = await optimalizeGetMember({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy,
        search: options.search,
        columnFilter: ['name', 'phone', 'id'],
      });
      return {
        data: response.data,
        totalRows: 0,
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
    fetchData: fetchMember,
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
      header: 'Membership ID',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: (info) => info.getValue(),
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
