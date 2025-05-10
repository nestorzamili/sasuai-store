import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DiscountFormValues } from '../../schema';

interface ValidityRulesProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function ValidityRules({ form }: ValidityRulesProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Validity & Usage Rules</h3>
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormDescription>
                  When the discount becomes active
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormDescription>When the discount expires</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="minPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Purchase (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Minimum purchase amount"
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? null : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Minimum purchase amount required
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Uses (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited uses"
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? null : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of times this discount can be used
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  This discount is ready to be applied to purchases
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
