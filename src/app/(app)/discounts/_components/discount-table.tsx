import { TableLayout } from '@/components/layout/table-layout';
import { DiscountInterface } from '@/lib/types/discount';
import { getAllDiscounts } from '../actions';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<DiscountInterface>[] = [
  { header: 'ID', accessorKey: 'id' },
  { header: 'Name', accessorKey: 'name' },
  { header: 'Discount Type', accessorKey: 'discountType' },
  { header: 'Value Type', accessorKey: 'valueType' },
  { header: 'Value', accessorKey: 'value' },
  { header: 'Is Active', accessorKey: 'isActive' },
  {
    header: (col) => {
      return (
        <div
          onClick={() =>
            col.column.toggleSorting(col.column.getIsSorted() === 'asc')
          }
        >
          Start Date
        </div>
      );
    },
    accessorKey: 'startDate',

    cell: ({ row }) => {
      return new Date(row.getValue('startDate')).toLocaleDateString('Id-ID');
    },
    enableSorting: true,
    enableColumnFilter: true,
    enableHiding: false,
  },
  {
    header: 'End Date',
    accessorKey: 'endDate',
    cell: ({ row }) => {
      return new Date(row.getValue('endDate')).toLocaleDateString('Id-ID');
    },
  },
];
export function DiscountTable() {
  const [data, setData] = React.useState<DiscountInterface[]>([]);
  const getDiscount = async () => {
    await getAllDiscounts()
      .then((response) => {
        // Transform the API response to match DiscountInterface
        const transformedData = response.data.data.map((item: any) => ({
          ...item,
          type: item.discountType, // Add the missing 'type' property using the value from 'discountType'
        }));
        setData(transformedData);
      })
      .catch((error) => {
        console.error('Error fetching discounts:', error);
      });
  };
  React.useEffect(() => {
    console.log('Fetching discounts...');
    getDiscount();
  }, []);

  return (
    <TableLayout data={data} columns={columns} isLoading={true}></TableLayout>
  );
}
