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
      <h3 className="text-lg font-medium">Basic Information</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter discount name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this discount
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter discount description"
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
                <FormLabel>Discount Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    // Reset value when changing types to avoid formatting issues
                    form.setValue('value', 0, { shouldValidate: true });
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DiscountType.PERCENTAGE}>
                      Percentage
                    </SelectItem>
                    <SelectItem value={DiscountType.FIXED_AMOUNT}>
                      Fixed Amount
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How the discount value should be applied
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field: { onChange, value, ...restField } }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <div className="relative">
                    {discountType === DiscountType.FIXED_AMOUNT && (
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        Rp
                      </div>
                    )}

                    {discountType === DiscountType.PERCENTAGE ? (
                      // For percentage - use number input with better UX
                      <Input
                        type="number"
                        placeholder="Enter percentage"
                        min={0}
                        max={100}
                        step={0.01}
                        {...restField}
                        value={value ?? ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === '') {
                            onChange(0);
                          } else {
                            const newValue = Number(inputValue);
                            if (!isNaN(newValue)) {
                              onChange(newValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // Ensure we have a valid number on blur
                          const inputValue = e.target.value;
                          if (inputValue === '' || isNaN(Number(inputValue))) {
                            onChange(0);
                          }
                        }}
                      />
                    ) : (
                      // For fixed amount - use text input with better formatting
                      <Input
                        type="text"
                        placeholder="Enter amount"
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
                    ? 'Percentage amount (0-100)'
                    : 'Fixed amount in currency'}
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
