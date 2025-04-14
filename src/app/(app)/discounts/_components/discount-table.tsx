import { TableLayout } from '@/components/layout/table-layout';
import { DiscountInterface } from '@/lib/types/discount';
import { getAllDiscounts } from '../actions';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DeleteDialog } from './discount-delete-dialog';
import { SortingButtonTable } from '@/components/addon-table-component';
import { Badge } from '@/components/ui/badge';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/use-fetch';

const DiscountTypeBagde = (value: string) => {
  if (value === 'member' || value === 'MEMBER') {
    return (
      <Badge variant={'outline'} className="cursor-pointer uppercase">
        {value}
      </Badge>
    );
  }
  return (
    <Badge variant={'secondary'} className="cursor-pointer uppercase">
      {value}
    </Badge>
  );
};

const isActive = (value: string) => {
  if (value) {
    return (
      <Badge className="cursor-pointer bg-green-300 text-white uppercase hover:bg-green-500">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant={'destructive'} className="cursor-pointer uppercase">
      Expired
    </Badge>
  );
};

const Value = ({ valueType, value }: { valueType: string; value: any }) => {
  if (valueType === 'percentage') {
    return <span>{value}%</span>;
  }
  return <span>{value}</span>;
};

export function DiscountTable() {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<string>('');

  const { push, refresh: refreshRoute } = useRouter();

  const handleOnDeleteClick = (data: any) => {
    setDeleteDialog(true);
    setDeleteData(data);
  };

  const fetchDiscountData = async (options: any) => {
    try {
      const response = await getAllDiscounts({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy,
        search: options.search,
        columnFilter: ['name', 'valueType', 'discountType'],
      });

      const formattedData = response.data.map((discount: any) => ({
        ...discount,
        type: discount.type || null,
      }));

      return {
        data: formattedData,
        totalRows: response.meta.rowsCount,
      };
    } catch (error) {
      console.log(error);
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
    fetchData: fetchDiscountData,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'id',
    initialSortDirection: false,
  });

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
    setSearchValue(search);
    setSearch(search);
  };

  const handleRefreshAfterDelete = () => {
    refresh();
  };
  console.log(data);
  const columns: ColumnDef<DiscountInterface>[] = [
    { header: 'ID', accessorKey: 'id' },
    {
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
      accessorKey: 'name',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      header: 'Type',
      accessorKey: 'discountType',
      cell: ({ row }) => {
        return DiscountTypeBagde(row.getValue('discountType'));
      },
    },
    {
      header: 'valueType',
      accessorKey: 'valueType',
      cell: ({ row }) => {
        return <span className="uppercase">{row.getValue('valueType')}</span>;
      },
    },
    {
      header: 'Value',
      accessorKey: 'value',
      cell: ({ row }) => {
        return (
          <Value
            valueType={row.getValue('valueType')}
            value={row.getValue('value')}
          />
        );
      },
    },
    {
      header: 'Discount Relations',
      // accessorFn: (row) =>
      //   row.discountType === 'product' ? 'discountProduct' : 'discountMember',
      accessorKey: 'discountRelation',
      cell: (info) => {
        const rowValue =
          info.row.getValue('discountType') === 'product'
            ? info.row.original.discountProducts
            : info.row.original.discountMembers;
        console.log(rowValue);
        const count = Array.isArray(rowValue) ? rowValue.length : 0;
        return (
          <Badge variant="outline" className="cursor-pointer">
            {count}{' '}
            {info.row.getValue('discountType') === 'product'
              ? 'Products'
              : 'Members'}
          </Badge>
        );
      },
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
      cell: ({ row }) => {
        return new Date(row.getValue('startDate')).toLocaleDateString('Id-ID');
      },
    },
    {
      header: 'Days Left',
      accessorKey: 'daysLeft',
      cell: ({ row }) => {
        let endDate = new Date(row.getValue('endDate'));
        let today = new Date();
        let timeDiff = endDate.getTime() - today.getTime();
        let daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return (
          <Badge
            variant={daysLeft < 0 ? 'destructive' : 'outline'}
            className="cursor-pointer uppercase"
          >
            {daysLeft} days
          </Badge>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => {
        return isActive(row.getValue('isActive'));
      },
    },

    {
      header: 'End Date',
      accessorKey: 'endDate',
      cell: ({ row }) => {
        return new Date(row.getValue('endDate')).toLocaleDateString('Id-ID');
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const discount = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => {
                    push(`/discounts/${discount.id}/update`);
                    refreshRoute();
                  }}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    const data = {
                      id: discount.id,
                      label: discount.name,
                    };
                    handleOnDeleteClick(data);
                  }}
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
  console.log(data);
  return (
    <div>
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
      />
      {deleteDialog && (
        <DeleteDialog
          isOpen={deleteDialog}
          data={deleteData}
          onClose={() => setDeleteDialog(false)}
          onRefresh={handleRefreshAfterDelete}
        />
      )}
    </div>
  );
}
