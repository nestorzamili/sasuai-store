import { TableLayout } from '@/components/layout/table-layout';
import { DiscountInterface } from '@/lib/types/discount';
import { getAllDiscounts } from '../actions';
import * as React from 'react';
import { columns } from '../_data/discount-column';
export function DiscountTable() {
  const [data, setData] = React.useState<DiscountInterface[]>([]);
  const getDiscount = async () => {
    const response = await getAllDiscounts();
    const formattedData = response.data.map((discount: any) => ({
      ...discount,
      type: discount.type || null,
    }));
    setData(formattedData);
  };
  React.useEffect(() => {
    getDiscount();
  }, []);

  return (
    <TableLayout data={data} columns={columns} isLoading={true}></TableLayout>
  );
}
