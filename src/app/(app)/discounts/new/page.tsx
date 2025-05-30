'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { createTranslatedDiscountSchema, DiscountFormValues } from '../schema';
import { DiscountType, DiscountApplyTo } from '@/lib/types/discount';
import { createDiscount } from '../action';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import BasicInfo from '../_components/discount-form/basic-info';
import ValidityRules from '../_components/discount-form/validity-rules';
import ApplicationScope from '../_components/discount-form/application-scope';
import { useTranslations } from 'next-intl';

export default function CreateDiscountPage() {
  const t = useTranslations('discount');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Create translated schema
  const translatedSchema = createTranslatedDiscountSchema((key: string) =>
    t(key),
  );

  // Initialize the form with translated schema
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(translatedSchema),
    defaultValues: {
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
      applyTo: DiscountApplyTo.SPECIFIC_PRODUCTS, // Default for non-global
      productIds: [],
      memberIds: [],
      memberTierIds: [],
    },
  });

  // Handle form submission
  const onSubmit = async (values: DiscountFormValues) => {
    try {
      setLoading(true);

      // Convert form values to the expected service type
      const discountData = {
        name: values.name,
        code: values.code,
        description: values.description,
        type: values.type,
        value: values.value,
        minPurchase: values.minPurchase,
        startDate: values.startDate,
        endDate: values.endDate,
        isActive: values.isActive,
        isGlobal: values.isGlobal,
        maxUses: values.maxUses,
        applyTo: values.applyTo,
        productIds: values.productIds,
        memberIds: values.memberIds,
        memberTierIds: values.memberTierIds,
      };

      const result = await createDiscount(discountData);

      if (result.success) {
        toast({
          title: t('pages.discountCreated'),
          description: t('pages.newDiscountSuccess'),
        });

        // Navigate back to the discounts page
        router.push('/discounts');
      } else {
        // Show specific error message
        toast({
          title: t('deleteDialog.error'),
          description: result.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: t('deleteDialog.error'),
        description: t('deleteDialog.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Form error event handler to catch validation errors
  const onError = (errors: unknown) => {
    console.error('Form validation errors:', errors);
    toast({
      title: t('pages.validationError'),
      description: t('pages.checkFormErrors'),
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('pages.createTitle')}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {t('pages.createDescription')}
          </p>
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
              {loading ? t('pages.creating') : t('pages.createButton')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
