import { useTranslations } from 'next-intl';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DiscountType } from '@/lib/types/discount';
import { UseFormReturn } from 'react-hook-form';
import { DiscountFormValues } from '../../schema';

interface BasicInfoProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function BasicInfo({ form }: BasicInfoProps) {
  const t = useTranslations('discount.form');
  const discountType = form.watch('type');

  // Super robust number formatter with guaranteed output
  const formatNumber = (value: string | number | null | undefined): string => {
    try {
      // Handle all possible edge cases
      if (value === null || value === undefined) return '0';
      if (typeof value === 'string' && value.trim() === '') return '0';

      // Force to number and validate
      const num = Number(value);
      if (isNaN(num) || !isFinite(num)) return '0';

      // Ensure we have a positive integer
      const safeNum = Math.max(0, Math.floor(num));
      return safeNum.toLocaleString('id-ID');
    } catch (e) {
      console.error('Error formatting number:', e);
      return '0';
    }
  };

  // Bulletproof parser for formatted numbers
  const parseFormattedNumber = (formattedValue: string): number => {
    try {
      // Handle empty input
      if (!formattedValue || formattedValue.trim() === '') return 0;

      // Remove all non-numeric characters
      const numericString = formattedValue.replace(/[^\d]/g, '');

      // Parse safely
      const result = parseInt(numericString, 10);
      return !isNaN(result) && isFinite(result) ? result : 0;
    } catch (error) {
      console.error('Error parsing number:', error);
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{t('basicInfo')}</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('discountName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('enterDiscountName')} {...field} />
              </FormControl>
              <FormDescription>{t('descriptiveName')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('enterDescription')}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('discountType')}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    form.setValue('value', 0, { shouldValidate: true });
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectDiscountType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DiscountType.PERCENTAGE}>
                      {t('percentage')}
                    </SelectItem>
                    <SelectItem value={DiscountType.FIXED_AMOUNT}>
                      {t('fixedAmount')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>{t('howApplied')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field: { onChange, value, ...restField } }) => (
              <FormItem>
                <FormLabel>{t('value')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    {discountType === DiscountType.FIXED_AMOUNT && (
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        Rp
                      </div>
                    )}

                    {discountType === DiscountType.PERCENTAGE ? (
                      // For percentage - use text input for better UX (no leading zeros)
                      <Input
                        type="text"
                        placeholder={t('enterPercentage')}
                        {...restField}
                        value={value === 0 ? '' : value.toString()}
                        onChange={(e) => {
                          const inputValue = e.target.value;

                          // Allow empty input
                          if (inputValue === '') {
                            onChange(0);
                            return;
                          }

                          // Only allow numbers and decimal point
                          if (!/^\d*\.?\d*$/.test(inputValue)) {
                            return;
                          }

                          const newValue = parseFloat(inputValue);
                          if (
                            !isNaN(newValue) &&
                            newValue >= 0 &&
                            newValue <= 100
                          ) {
                            onChange(newValue);
                          }
                        }}
                        onBlur={(e) => {
                          // Ensure we have a valid number on blur
                          const inputValue = e.target.value;
                          if (inputValue === '' || isNaN(Number(inputValue))) {
                            onChange(0);
                          } else {
                            const newValue = parseFloat(inputValue);
                            // Clamp to 0-100 range for percentage
                            const clampedValue = Math.min(
                              100,
                              Math.max(0, newValue)
                            );
                            onChange(clampedValue);
                          }
                        }}
                      />
                    ) : (
                      // For fixed amount - use text input with better formatting
                      <Input
                        type="text"
                        placeholder={t('enterAmount')}
                        className="pl-8"
                        {...restField}
                        value={value === 0 ? '' : formatNumber(value)}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === '') {
                            onChange(0);
                          } else {
                            const numericValue =
                              parseFormattedNumber(inputValue);
                            onChange(numericValue);
                          }
                        }}
                        onBlur={(e) => {
                          // Format the number properly on blur
                          const inputValue = e.target.value;
                          if (inputValue === '') {
                            onChange(0);
                          } else {
                            const numericValue =
                              parseFormattedNumber(inputValue);
                            onChange(numericValue);
                          }
                        }}
                      />
                    )}

                    {discountType === DiscountType.PERCENTAGE && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        %
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  {discountType === DiscountType.PERCENTAGE
                    ? t('percentageAmount')
                    : t('fixedAmountCurrency')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
