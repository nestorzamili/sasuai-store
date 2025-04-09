'use client';
import { DiscountForm } from '../../_components/discount-form';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DiscountInterface } from '@/lib/types/discount';
import { getDiscountById } from '../../actions';
export default function UpdateDiscount() {
  const params = useParams();
  const id = params.id as string;
  const [discountData, setDiscountData] = useState<
    DiscountInterface | undefined
  >(undefined);
  const fetchDiscountData = async (id: string) => {
    try {
      const response = await getDiscountById(id);
      if (response.success) {
        const formated: DiscountInterface = {
          id: response.data?.id || '',
          name: response.data?.name || '',
          discountType:
            response.data?.discountType === 'product' ? 'product' : 'member',
          valueType:
            response.data?.valueType === 'percentage' ? 'percentage' : 'flat',
          value: response.data?.value || 0,
          startDate: response.data?.startDate || new Date(),
          endDate: response.data?.endDate || new Date(),
          discountRelations: response.data?.discountRelations || [],
        };

        setDiscountData(formated);
      }
    } catch (error) {
      console.error('Error fetching discount data:', error);
    }
  };
  useEffect(() => {
    if (id) {
      fetchDiscountData(id);
    }
  }, []);

  return (
    <>
      {discountData ? (
        <DiscountForm type="update" initialValues={discountData} id={id} />
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
