'use client';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { z } from 'zod';
import { createDiscount, updateDiscount } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DiscountInterface } from '@/lib/types/discount';
const formSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(5, {
      message: 'Name must be at least 5 characters.',
    }),
    discountType: z
      .enum(['product', 'member'], {
        message: 'Discount type is required.',
      })
      .default('product'),
    valueType: z
      .enum(['percentage', 'flat'], {
        message: 'Value type is required.',
      })
      .default('percentage'),
    value: z.number(),
    // relation_id: z.string().optional(),
    minPurchase: z.number().optional(),
    startDate: z
      .date()
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: 'Start date cannot be earlier than today.',
      }),
    endDate: z.date(),
  })
  .refine(
    (data) => {
      if (!data.endDate || !data.startDate) return true;

      const today = new Date(new Date().setHours(0, 0, 0, 0));
      return data.endDate >= today && data.endDate >= data.startDate;
    },
    {
      message: 'End date must not be earlier than start date or today.',
      path: ['endDate'],
    }
  );
interface FormType {
  type: 'create' | 'update';
  initialValues?: DiscountInterface;
  id?: string;
}
async function onCreateDiscount(values: any) {
  try {
    const discount = await createDiscount(values);
    return discount;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
}
async function onUpdateDiscount(id: string, values: any) {
  try {
    const discount = await updateDiscount(id, values);
    console.log('Discount updated:', discount);
    return discount;
  } catch (error) {
    console.error('Error updating discount:', error);
    throw error;
  }
}
export function DiscountForm({ type, initialValues, id }: FormType) {
  const { toast } = useToast();
  const { push, refresh } = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      type === 'update'
        ? {
            name: initialValues?.name,
            discountType: initialValues?.discountType,
            valueType: initialValues?.valueType,
            value: initialValues?.value,
            startDate: initialValues?.startDate
              ? new Date(initialValues.startDate)
              : new Date(),
            endDate: initialValues?.endDate
              ? new Date(initialValues?.endDate)
              : undefined,
            minPurchase: initialValues?.minPurchase || 0,
          }
        : {
            name: '',
            discountType: 'product',
            valueType: 'percentage',
            value: 0,
            startDate: new Date(),
            endDate: undefined,
            // relation_id: 'none',
            minPurchase: 0,
          },
  });
  const [minPurchase, setMinPurchase] = useState(false);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (type === 'create') {
        // Handle create logic here
        await onCreateDiscount(values)
          .then((res) => {
            if (res.success) {
              toast({
                title: 'Discount created',
                description: `${res.data.name} has been created. ${new Date(
                  res.data.createdAt
                ).toLocaleDateString()}`,
                variant: 'default',
              });
              form.reset();
              setMinPurchase(false);
              push('/discounts');
              refresh();
            }
          })
          .catch((error) => {
            toast({
              title: 'Something get wrong',
              variant: 'destructive',
            });
          });
      }
      if (type === 'update') {
        // Handle update logic here
        await onUpdateDiscount(id || '', values)
          .then((res) => {
            if (res.success) {
              toast({
                title: 'Discount updated',
                // description: `${res.data.name} has been updated. ${new Date(
                //   res.data.updatedAt
                // ).toLocaleDateString()}`,
                variant: 'default',
              });
              form.reset();
              setMinPurchase(false);
              push('/discounts');
              refresh();
            }
          })
          .catch((error) => {
            toast({
              title: 'Something get wrong',
              variant: 'destructive',
            });
          });

        console.log('Updating discount with values:', values);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex gap-4">
            <div className="w-1/2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Diskon Lebaran 2025" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of the discount that will be displayed to
                      the customer.
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      This is the type of discount that will be applied.
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.discountType?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select value type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {form.watch('valueType')}
                      This is the type of discount that will be applied.
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.valueType?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => {
                          const numberValue = Number(e.target.value) || 0;
                          const valueType = form.watch('valueType');
                          if (valueType === 'percentage') {
                            field.onChange(Math.min(100, numberValue));
                            if (numberValue > 100) {
                              form.setError('value', {
                                type: 'manual',
                                message: 'Percentage cannot exceed 100%',
                              });
                            }
                            if (numberValue < 100) {
                              form.clearErrors('value');
                            }
                          } else {
                            field.onChange(numberValue);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch('valueType') === 'percentage' ? (
                        <span className="text-teal-500">
                          Enter a percentage discount (0-100)
                        </span>
                      ) : (
                        'Enter a fixed amount discount'
                      )}
                      {''} This is the name of the discount that will be
                      displayed to the customer.
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.value?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Set your discount start date. This is the date when the
                      discount will start being applied.
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.startDate?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Set your discount end date. This is the date when the
                      discount will stop being applied. Leave empty for a
                      discount with no expiration.
                    </FormDescription>
                    <FormMessage>
                      {form.formState.errors.endDate?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/2">
              <FormField
                name="min-purchase"
                render={(field) => (
                  <FormItem>
                    <FormLabel htmlFor="min-purchase">
                      Minimum Purcahse
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch
                          id="min-purchase"
                          checked={minPurchase}
                          onCheckedChange={() => {
                            setMinPurchase(!minPurchase);
                          }}
                        />
                        <Label htmlFor="min-purchase">
                          {minPurchase ? 'Active' : 'Not Active'}
                        </Label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Set your minimum purchase amount. This is the minimum
                      amount that a customer must spend to be eligible for the
                      discount.
                    </FormDescription>
                  </FormItem>
                )}
              />
              {minPurchase && (
                <FormField
                  control={form.control}
                  name="minPurchase"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Min Purchase</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0"
                          value={field.value}
                          onChange={(e) => {
                            const numberValue = Number(e.target.value) || 0;
                            field.onChange(numberValue);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum purchase amount to apply this discount.
                      </FormDescription>
                      <FormMessage>
                        {form.formState.errors.minPurchase?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                name="relation_button"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Add your relation</FormLabel>
                    <FormControl className="flex gap-2">
                      <Button variant={'outline'} type="button">
                        Open Relation
                      </Button>
                    </FormControl>
                    <FormDescription>
                      Specify which items or members this discount applies to.
                      For product discounts, enter the product ID; for member
                      discounts, enter the membership tier ID. You can configure
                      this now or add it later after creating the discount.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Submitting...'
              : type === 'create'
              ? 'Create Discount'
              : 'Update Discount'}
          </Button>
        </form>
      </Form>
    </>
  );
}
