import { Checkbox } from '@/components/ui/checkbox';
import {
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
import { DiscountApplyTo } from '@/lib/types/discount';
import { UseFormReturn } from 'react-hook-form';
import { DiscountFormValues } from '../../schema';
import ProductSelector from './product-selector';
import MemberSelector from './member-selector';
import TierSelector from './tier-selector';
import { useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ApplicationScopeProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function ApplicationScope({ form }: ApplicationScopeProps) {
  const t = useTranslations('discount.form');
  const isGlobal = form.watch('isGlobal');
  const applyTo = form.watch('applyTo');

  // When isGlobal changes, set applyTo to ALL
  useEffect(() => {
    if (isGlobal) {
      // Set applyTo to ALL for global discounts (instead of null)
      form.setValue('applyTo', DiscountApplyTo.ALL, { shouldValidate: true });
      // Clear selected items
      form.setValue('productIds', [], { shouldValidate: true });
      form.setValue('memberIds', [], { shouldValidate: true });
      form.setValue('memberTierIds', [], { shouldValidate: true });
    }
  }, [isGlobal, form]);

  // Memoize the selector components to prevent unnecessary re-renders
  const ProductSelectorMemoized = useMemo(() => {
    if (!isGlobal && applyTo === DiscountApplyTo.SPECIFIC_PRODUCTS) {
      return (
        <FormField
          control={form.control}
          name="productIds"
          render={({ field }) => (
            <FormItem className="border rounded-md p-4">
              <FormLabel className="text-base">{t('selectProducts')}</FormLabel>
              <FormDescription className="mt-1 mb-3">
                {t('chooseProducts')}
              </FormDescription>
              <FormControl>
                <ProductSelector
                  selectedIds={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    return null;
  }, [form, isGlobal, applyTo, t]);

  const MemberSelectorMemoized = useMemo(() => {
    if (!isGlobal && applyTo === DiscountApplyTo.SPECIFIC_MEMBERS) {
      return (
        <FormField
          control={form.control}
          name="memberIds"
          render={({ field }) => (
            <FormItem className="border rounded-md p-4">
              <FormLabel className="text-base">{t('selectMembers')}</FormLabel>
              <FormDescription className="mt-1 mb-3">
                {t('chooseMembersEligible')}
              </FormDescription>
              <FormControl>
                <MemberSelector
                  selectedIds={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    return null;
  }, [form, isGlobal, applyTo, t]);

  const TierSelectorMemoized = useMemo(() => {
    if (!isGlobal && applyTo === DiscountApplyTo.SPECIFIC_MEMBER_TIERS) {
      return (
        <FormField
          control={form.control}
          name="memberTierIds"
          render={({ field }) => (
            <FormItem className="border rounded-md p-4">
              <FormLabel className="text-base">
                {t('selectMemberTiers')}
              </FormLabel>
              <FormDescription className="mt-1 mb-3">
                {t('chooseTiersEligible')}
              </FormDescription>
              <FormControl>
                <TierSelector
                  selectedIds={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    return null;
  }, [form, isGlobal, applyTo, t]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{t('discountApplication')}</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="isGlobal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('globalDiscount')}</FormLabel>
                <FormDescription>{t('applyAutomatically')}</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {!isGlobal ? (
          <FormField
            control={form.control}
            name="applyTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('applyDiscountTo')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                  value={field.value || undefined}
                  disabled={isGlobal}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectApplicationScope')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DiscountApplyTo.SPECIFIC_PRODUCTS}>
                      {t('specificProducts')}
                    </SelectItem>
                    <SelectItem value={DiscountApplyTo.SPECIFIC_MEMBERS}>
                      {t('specificMembers')}
                    </SelectItem>
                    <SelectItem value={DiscountApplyTo.SPECIFIC_MEMBER_TIERS}>
                      {t('memberTiers')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>{t('chooseAppliesTo')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="rounded-md border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              {t('globalDiscountNote')}
            </p>
          </div>
        )}

        {/* Show selectors only if not global */}
        {!isGlobal && (
          <>
            {ProductSelectorMemoized}
            {MemberSelectorMemoized}
            {TierSelectorMemoized}
          </>
        )}
      </div>
    </div>
  );
}
