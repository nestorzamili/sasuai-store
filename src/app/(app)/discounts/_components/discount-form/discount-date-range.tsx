'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { DiscountFormValues } from '../../schema';

interface DiscountDateRangeProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function DiscountDateRange({ form }: DiscountDateRangeProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Mulai *</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={(date) => field.onChange(date)}
                  placeholder="Pilih tanggal mulai"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Berakhir *</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={(date) => field.onChange(date)}
                  placeholder="Pilih tanggal berakhir"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
