import { ColumnDef } from '@tanstack/react-table';
import { DiscountInterface } from '@/lib/types/discount';
import { SortingButtonTable } from '@/components/addon-table-component';
import { Badge } from '@/components/ui/badge';
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
      <Badge className="cursor-pointer bg-green-500 text-white uppercase">
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
export const columns: ColumnDef<DiscountInterface>[] = [
  { header: 'ID', accessorKey: 'id' },
  {
    header: ({ column }) => {
      return <SortingButtonTable column={column} label={'Brand Name'} />;
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
    accessorKey: 'name',
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    header: ({ column }) => {
      return <SortingButtonTable column={column} label={'Discount Type'} />;
    },
    accessorKey: 'discountType',
    cell: ({ row }) => {
      return DiscountTypeBagde(row.getValue('discountType'));
    },
  },
  {
    header: ({ column }) => {
      return <SortingButtonTable column={column} label={'Value Type'} />;
    },
    accessorKey: 'valueType',
    cell: ({ row }) => {
      return <span className="uppercase">{row.getValue('valueType')}</span>;
    },
  },
  {
    header: ({ column }) => {
      return <SortingButtonTable column={column} label={'Value'} />;
    },
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
    header: ({ column }) => {
      return <span className="">Days Left</span>;
    },
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
    header: ({ column }) => {
      return <SortingButtonTable column={column} label={'Status'} />;
    },
    accessorKey: 'isActive',
    cell: ({ row }) => {
      return isActive(row.getValue('isActive'));
    },
  },

  {
    header: ({ column }) => {
      return <SortingButtonTable column={column} label={'End Date'} />;
    },
    accessorKey: 'endDate',
    cell: ({ row }) => {
      return new Date(row.getValue('endDate')).toLocaleDateString('Id-ID');
    },
  },
];
