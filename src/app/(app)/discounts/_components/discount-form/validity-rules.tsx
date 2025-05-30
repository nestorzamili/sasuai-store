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
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { DiscountFormValues } from '../../schema';

interface ValidityRulesProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function ValidityRules({ form }: ValidityRulesProps) {
  const t = useTranslations('discount.form');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{t('validityRules')}</h3>
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('startDate')}</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormDescription>{t('whenActive')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('endDate')}</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormDescription>{t('whenExpires')}</FormDescription>
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
                <FormLabel>{t('minPurchase')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('minPurchaseAmount')}
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? null : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>{t('minPurchaseRequired')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('maxUses')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('unlimitedUses')}
                    {...field}
                    value={field.value === null ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? null : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>{t('maxUsesDescription')}</FormDescription>
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
                <FormLabel>{t('active')}</FormLabel>
                <FormDescription>{t('readyToApply')}</FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
