'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import {
  createTranslatedDiscountSchema,
  DiscountFormValues,
} from '../../schema';
import { DiscountType, DiscountApplyTo } from '@/lib/types/discount';
import { getDiscount, updateDiscount } from '../../action';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import BasicInfo from '../../_components/discount-form/basic-info';
import ValidityRules from '../../_components/discount-form/validity-rules';
import ApplicationScope from '../../_components/discount-form/application-scope';
import { useTranslations } from 'next-intl';

const defaultValues: DiscountFormValues = {
  name: '',
  code: null,
  description: null,
  type: DiscountType.PERCENTAGE,
  value: 0,
  minPurchase: null,
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  isActive: true,
  isGlobal: false,
  maxUses: null,
  applyTo: DiscountApplyTo.SPECIFIC_PRODUCTS,
  productIds: [],
  memberIds: [],
  memberTierIds: [],
};

export default function EditDiscountPage() {
  const t = useTranslations('discount');

  // Use the useParams hook to get the ID from the route
  const params = useParams();
  const discountId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // Create translated schema
  const translatedSchema = createTranslatedDiscountSchema((key: string) =>
    t(key),
  );

  // Initialize the form with translated schema
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(translatedSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Memoize the data fetching to avoid unnecessary rerenders
  const fetchDiscountData = async () => {
    if (!discountId) return;

    try {
      setInitialLoading(true);
      const response = await getDiscount(discountId);

      if (response.success && response.discount) {
        const discount = response.discount;

        // Update how we handle applyTo for global discounts
        let applyToValue;
        if (discount.isGlobal) {
          // Use ALL for global discounts (not SPECIFIC_PRODUCTS)
          applyToValue = DiscountApplyTo.ALL;
        } else {
          // For non-global discounts, use the stored value
          applyToValue = discount.applyTo || DiscountApplyTo.SPECIFIC_PRODUCTS;
        }

        // Create a new form values object instead of setting fields individually
        const formValues: DiscountFormValues = {
          id: discount.id,
          name: discount.name,
          code: discount.code || null,
          description: discount.description || null,
          type: discount.type as DiscountType, // Add type assertion here
          value: discount.value,
          minPurchase: discount.minPurchase || null,
          startDate: new Date(discount.startDate),
          endDate: new Date(discount.endDate),
          isActive: discount.isActive,
          isGlobal: discount.isGlobal,
          maxUses: discount.maxUses || null,
          applyTo: applyToValue as DiscountApplyTo, // Add type assertion here
          productIds:
            discount.products?.map((product: { id: string }) => product.id) ||
            [],
          memberIds:
            discount.members?.map((member: { id: string }) => member.id) || [],
          memberTierIds:
            discount.memberTiers?.map((tier: { id: string }) => tier.id) || [],
        };

        // Reset form with all values at once to avoid cascading updates
        form.reset(formValues);
        return true;
      } else {
        toast({
          title: t('deleteDialog.error'),
          description: t('pages.couldNotLoad'),
          variant: 'destructive',
        });
        router.push('/discounts');
        return false;
      }
    } catch (error) {
      console.error('Error loading discount:', error);
      toast({
        title: t('deleteDialog.error'),
        description: t('pages.unexpectedErrorLoading'),
        variant: 'destructive',
      });
      router.push('/discounts');
      return false;
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch discount data once on component mount
  useEffect(() => {
    fetchDiscountData();
  }, [discountId]);

  // Handle form submission
  const onSubmit = async (values: DiscountFormValues) => {
    if (!discountId) return;

    try {
      setLoading(true);

      // Always ensure global discounts use the ALL enum
      if (values.isGlobal) {
        values.applyTo = DiscountApplyTo.ALL;
      }

      const result = await updateDiscount(discountId, values);

      if (result.success) {
        toast({
          title: t('pages.discountUpdated'),
          description: t('pages.discountUpdateSuccess'),
        });

        // Navigate back to the discounts page
        router.push('/discounts');
      } else {
        toast({
          title: t('deleteDialog.error'),
          description: result.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      toast({
        title: t('deleteDialog.error'),
        description: t('deleteDialog.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add an onError handler for form validation errors
  const onError = () => {
    toast({
      title: t('pages.validationError'),
      description: t('pages.checkFormErrors'),
      variant: 'destructive',
    });
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">{t('pages.loadingData')}</h2>
          <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('pages.editTitle')}
            </h2>
          </div>
          <p className="text-muted-foreground">{t('pages.editDescription')}</p>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <BasicInfo form={form} />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <ValidityRules form={form} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <ApplicationScope form={form} />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/discounts">
              <Button variant="outline" type="button">
                {t('pages.cancel')}
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? t('pages.updating') : t('pages.updateButton')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
