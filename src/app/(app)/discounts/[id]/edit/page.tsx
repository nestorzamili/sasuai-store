'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import { DiscountWithRelations } from '@/lib/services/discount/types';
import DiscountForm from '../../_components/discount-form';
import { getDiscountById } from '../../action';

export default function EditDiscountPage() {
  const t = useTranslations('discount');
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;
  const [discountData, setDiscountData] =
    useState<DiscountWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  // Page orchestrates data fetching
  const loadDiscountData = useCallback(async () => {
    if (!discountId) {
      router.push('/discounts');
      return;
    }

    try {
      setLoading(true);
      const response = await getDiscountById(discountId);

      if (response.success && response.data) {
        setDiscountData(response.data);
      } else {
        toast({
          title: t('pages.error'),
          description:
            response.error || response.message || t('pages.couldNotLoad'),
          variant: 'destructive',
        });
        router.push('/discounts');
      }
    } catch (error) {
      console.error('Error loading discount:', error);
      toast({
        title: t('pages.error'),
        description: t('pages.unexpectedErrorLoading'),
        variant: 'destructive',
      });
      router.push('/discounts');
    } finally {
      setLoading(false);
    }
  }, [discountId, router, t]);

  // Fetch data on mount
  useEffect(() => {
    loadDiscountData();
  }, [loadDiscountData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">{t('pages.loadingData')}</h2>
          <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!discountData) {
    return null;
  }

  return (
    <DiscountForm
      mode="edit"
      initialData={discountData}
      discountId={discountId}
    />
  );
}
