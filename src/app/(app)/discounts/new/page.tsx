'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { discountSchema, DiscountFormValues } from '../schema';
import { DiscountType, DiscountApplyTo } from '@prisma/client';
import { createDiscount } from '../action';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import BasicInfo from '../_components/discount-form/basic-info';
import ValidityRules from '../_components/discount-form/validity-rules';
import ApplicationScope from '../_components/discount-form/application-scope';

export default function CreateDiscountPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize the form
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
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
      applyTo: DiscountApplyTo.SPECIFIC_PRODUCTS,
      productIds: [],
      memberIds: [],
      memberTierIds: [],
    },
  });

  // Handle form submission
  const onSubmit = async (values: DiscountFormValues) => {
    try {
      setLoading(true);

      const result = await createDiscount(values);

      if (result.success) {
        toast({
          title: 'Discount created',
          description: 'New discount has been created successfully',
        });

        // Navigate back to the discounts page
        router.push('/discounts');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Create Discount
            </h2>
          </div>
          <p className="text-muted-foreground">
            Create a new discount that can be applied to products, members, or
            tiers
          </p>
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Discount'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
