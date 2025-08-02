'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { IconUsers } from '@tabler/icons-react';
import { DiscountType } from '@/lib/services/discount/types';
import { DiscountFormValues } from '../../schema';
import { useState } from 'react';

interface DiscountValueSettingsProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function DiscountValueSettings({
  form,
}: DiscountValueSettingsProps) {
  const type = form.watch('type');
  const maxUses = form.watch('maxUses');
  const minPurchase = form.watch('minPurchase');

  const [hasMinPurchase, setHasMinPurchase] = useState(!!minPurchase);
  const [hasMaxUses, setHasMaxUses] = useState(!!maxUses);

  const formatDisplayValue = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '';
    return num.toLocaleString('id-ID');
  };

  const parseFormattedValue = (formatted: string): number | null => {
    if (!formatted || formatted.trim() === '') return null;
    const numericString = formatted.replace(/[^\d]/g, '');
    const result = parseInt(numericString, 10);
    return !isNaN(result) && isFinite(result) ? result : null;
  };

  if (!type) return null;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nilai Diskon *</FormLabel>
            <FormControl>
              <div className="relative">
                {type === DiscountType.FIXED_AMOUNT && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rp
                  </div>
                )}
                <Input
                  type={type === DiscountType.PERCENTAGE ? 'number' : 'text'}
                  min={type === DiscountType.PERCENTAGE ? '0' : undefined}
                  step={type === DiscountType.PERCENTAGE ? '0.01' : undefined}
                  max={type === DiscountType.PERCENTAGE ? '100' : undefined}
                  placeholder={type === DiscountType.PERCENTAGE ? '0' : '0'}
                  className={type === DiscountType.FIXED_AMOUNT ? 'pl-10' : ''}
                  {...field}
                  value={
                    field.value === null || field.value === undefined
                      ? ''
                      : type === DiscountType.PERCENTAGE
                        ? field.value.toString()
                        : formatDisplayValue(field.value)
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '' || inputValue === null) {
                      field.onChange(null);
                    } else {
                      if (type === DiscountType.PERCENTAGE) {
                        const numValue = Number(inputValue);
                        if (!isNaN(numValue) && isFinite(numValue)) {
                          field.onChange(Math.min(100, Math.max(0, numValue)));
                        }
                      } else {
                        const numValue = parseFormattedValue(inputValue);
                        if (numValue !== null) {
                          field.onChange(Math.max(0, numValue));
                        }
                      }
                    }
                  }}
                />
                {type === DiscountType.PERCENTAGE && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Minimum Pembelian</FormLabel>
            <Switch
              checked={hasMinPurchase}
              onCheckedChange={(checked) => {
                setHasMinPurchase(checked);
                if (!checked) {
                  form.setValue('minPurchase', null);
                }
              }}
            />
          </div>
          {hasMinPurchase && (
            <FormField
              control={form.control}
              name="minPurchase"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        Rp
                      </div>
                      <Input
                        type="text"
                        placeholder="0"
                        className="pl-10"
                        {...field}
                        value={
                          field.value === null || field.value === undefined
                            ? ''
                            : formatDisplayValue(field.value)
                        }
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === '' || inputValue === null) {
                            field.onChange(null);
                          } else {
                            const numValue = parseFormattedValue(inputValue);
                            if (numValue !== null) {
                              field.onChange(Math.max(0, numValue));
                            }
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Batas Penggunaan</FormLabel>
            <Switch
              checked={hasMaxUses}
              onCheckedChange={(checked) => {
                setHasMaxUses(checked);
                if (!checked) {
                  form.setValue('maxUses', null);
                }
              }}
            />
          </div>
          {hasMaxUses && (
            <FormField
              control={form.control}
              name="maxUses"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="0"
                      {...field}
                      value={
                        field.value === null || field.value === undefined
                          ? ''
                          : field.value.toString()
                      }
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '' || inputValue === null) {
                          field.onChange(null);
                        } else {
                          const numValue = Number(inputValue);
                          if (!isNaN(numValue) && isFinite(numValue)) {
                            field.onChange(Math.max(1, Math.floor(numValue)));
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {/* Usage Info */}
      {maxUses && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <IconUsers size={16} className="text-amber-600" />
          <span className="text-sm text-amber-800">
            Diskon akan otomatis nonaktif setelah digunakan {maxUses} kali
          </span>
        </div>
      )}
    </div>
  );
}
