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
import { DiscountApplyTo } from '@prisma/client';
import { UseFormReturn } from 'react-hook-form';
import { DiscountFormValues } from '../../schema';
import ProductSelector from '../product-selector';
import MemberSelector from '../member-selector';
import TierSelector from '../tier-selector';

interface ApplicationScopeProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function ApplicationScope({ form }: ApplicationScopeProps) {
  const isGlobal = form.watch('isGlobal');
  const applyTo = form.watch('applyTo');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Discount Application</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="isGlobal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Global Discount</FormLabel>
                <FormDescription>
                  Apply this discount to all eligible purchases automatically
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applyTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apply Discount To</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={isGlobal}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application scope" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={DiscountApplyTo.SPECIFIC_PRODUCTS}>
                    Specific Products
                  </SelectItem>
                  <SelectItem value={DiscountApplyTo.SPECIFIC_MEMBERS}>
                    Specific Members
                  </SelectItem>
                  <SelectItem value={DiscountApplyTo.SPECIFIC_MEMBER_TIERS}>
                    Member Tiers
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {isGlobal
                  ? 'Global discounts apply to all eligible items'
                  : 'Choose which items or members this discount applies to'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isGlobal && applyTo === DiscountApplyTo.SPECIFIC_PRODUCTS && (
          <FormField
            control={form.control}
            name="productIds"
            render={({ field }) => (
              <FormItem className="border rounded-md p-4">
                <FormLabel className="text-base">Select Products</FormLabel>
                <FormDescription className="mt-1 mb-3">
                  Choose which products this discount will apply to
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
        )}

        {!isGlobal && applyTo === DiscountApplyTo.SPECIFIC_MEMBERS && (
          <FormField
            control={form.control}
            name="memberIds"
            render={({ field }) => (
              <FormItem className="border rounded-md p-4">
                <FormLabel className="text-base">Select Members</FormLabel>
                <FormDescription className="mt-1 mb-3">
                  Choose which members will be eligible for this discount
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
        )}

        {!isGlobal && applyTo === DiscountApplyTo.SPECIFIC_MEMBER_TIERS && (
          <FormField
            control={form.control}
            name="memberTierIds"
            render={({ field }) => (
              <FormItem className="border rounded-md p-4">
                <FormLabel className="text-base">Select Member Tiers</FormLabel>
                <FormDescription className="mt-1 mb-3">
                  Choose which membership tiers will be eligible for this
                  discount
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
        )}
      </div>
    </div>
  );
}
