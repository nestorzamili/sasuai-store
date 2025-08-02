'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { createTranslatedDiscountSchema, DiscountFormValues } from '../schema';
import { DiscountType, DiscountApplyTo } from '@/lib/services/discount/types';
import { useMemo, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DiscountBasicInfo from './discount-form/discount-basic-info';
import DiscountValueSettings from './discount-form/discount-value-settings';
import DiscountDateRange from './discount-form/discount-date-range';
import DiscountApplication from './discount-form/discount-application';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { DiscountWithRelations } from '@/lib/services/discount/types';
import { createDiscount, updateDiscount } from '../action';

interface DiscountFormProps {
  mode: 'create' | 'edit';
  initialData?: DiscountWithRelations;
  discountId?: string;
}

const defaultFormValues: DiscountFormValues = {
  name: '',
  code: null,
  description: null,
  type: undefined,
  value: 0,
  minPurchase: null,
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  isActive: true,
  isGlobal: false,
  maxUses: null,
  applyTo: undefined,
  productIds: [],
  memberIds: [],
  memberTierIds: [],
};

export default function DiscountForm({
  mode,
  initialData,
  discountId,
}: DiscountFormProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations('discount');
  const router = useRouter();

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: DiscountFormValues) => {
      try {
        setLoading(true);

        // Validate required fields
        if (!values.type) {
          throw new Error('Discount type is required');
        }

        // Ensure global discounts use ALL enum
        if (values.isGlobal) {
          values.applyTo = 'ALL' as DiscountFormValues['applyTo'];
        }

        // Prepare data with required type field
        const discountData = {
          ...values,
          type: values.type, // Ensure type is not undefined
        };

        let result;
        if (mode === 'create') {
          result = await createDiscount(discountData);
        } else {
          if (!discountId) {
            throw new Error('Discount ID is required for update');
          }
          result = await updateDiscount(discountId, discountData);
        }

        if (result.success) {
          toast({
            title:
              mode === 'create'
                ? t('pages.discountCreated')
                : t('pages.discountUpdated'),
            description:
              mode === 'create'
                ? t('pages.newDiscountSuccess')
                : t('pages.discountUpdateSuccess'),
          });
          router.push('/discounts');
          return true;
        } else {
          toast({
            title: t('pages.error'),
            description:
              result.error || result.message || t('pages.unexpectedError'),
            variant: 'destructive',
          });
          return false;
        }
      } catch (error) {
        console.error('Form submission error:', error);
        toast({
          title: t('pages.error'),
          description: t('pages.unexpectedError'),
          variant: 'destructive',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [mode, discountId, t, router],
  );

  // Handle form validation errors
  const handleError = useCallback(() => {
    toast({
      title: t('pages.validationError'),
      description: t('pages.checkFormErrors'),
      variant: 'destructive',
    });
  }, [t]);

  // Memoize translated schema to prevent recreation
  const translatedSchema = useMemo(() => {
    return createTranslatedDiscountSchema((key: string) => t(key));
  }, [t]);

  // Memoize initial values based on mode
  const initialValues = useMemo(() => {
    if (mode === 'edit' && initialData) {
      // Handle applyTo for global discounts
      let applyToValue;
      if (initialData.isGlobal) {
        applyToValue = DiscountApplyTo.ALL;
      } else {
        applyToValue = initialData.applyTo || DiscountApplyTo.SPECIFIC_PRODUCTS;
      }

      return {
        id: initialData.id,
        name: initialData.name,
        code: initialData.code || null,
        description: initialData.description || null,
        type: initialData.type as DiscountType,
        value: initialData.value,
        minPurchase: initialData.minPurchase || null,
        startDate: new Date(initialData.startDate),
        endDate: new Date(initialData.endDate),
        isActive: initialData.isActive,
        isGlobal: initialData.isGlobal,
        maxUses: initialData.maxUses || null,
        applyTo: applyToValue as DiscountApplyTo,
        productIds: initialData.products?.map((product) => product.id) || [],
        memberIds: initialData.members?.map((member) => member.id) || [],
        memberTierIds: initialData.memberTiers?.map((tier) => tier.id) || [],
      };
    }
    return defaultFormValues;
  }, [mode, initialData]);

  // Initialize form with memoized values
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(translatedSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset(initialValues);
    }
  }, [mode, initialData, initialValues, form]);

  // Memoized submit handler
  const onSubmit = useCallback(
    async (values: DiscountFormValues) => {
      await handleSubmit(values);
    },
    [handleSubmit],
  );

  const isCreate = mode === 'create';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {isCreate ? t('pages.createTitle') : t('pages.editTitle')}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {isCreate
              ? t('pages.createDescription')
              : t('pages.editDescription')}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, handleError)}
          className="space-y-6"
        >
          <Card className="w-full">
            <CardContent className="space-y-6 pt-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <DiscountBasicInfo form={form} />
                  <DiscountValueSettings form={form} />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <DiscountDateRange form={form} />
                  <DiscountApplication form={form} />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href="/discounts">
                  <Button variant="outline" type="button">
                    {t('pages.cancel')}
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? isCreate
                      ? t('pages.creating')
                      : t('pages.updating')
                    : isCreate
                      ? t('pages.createButton')
                      : t('pages.updateButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
