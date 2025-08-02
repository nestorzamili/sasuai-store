'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { IconPercentage, IconCurrencyDollar } from '@tabler/icons-react';
import { DiscountType } from '@/lib/services/discount/types';
import { DiscountFormValues } from '../../schema';

interface DiscountBasicInfoProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function DiscountBasicInfo({ form }: DiscountBasicInfoProps) {
  const t = useTranslations('discount.form');

  const typeOptions = [
    {
      value: DiscountType.PERCENTAGE,
      label: t('percentage'),
      icon: <IconPercentage size={16} />,
    },
    {
      value: DiscountType.FIXED_AMOUNT,
      label: t('fixedAmount'),
      icon: <IconCurrencyDollar size={16} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Discount Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('discountName')} *</FormLabel>
            <FormControl>
              <Input placeholder={t('enterDiscountName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('description')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('enterDescription')}
                rows={3}
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Discount Type - Radio Group */}
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('discountType')} *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-3"
              >
                {typeOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <label
                      htmlFor={option.value}
                      className="flex items-center gap-2 cursor-pointer text-sm font-normal"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
