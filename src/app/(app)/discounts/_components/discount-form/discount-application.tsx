'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  FormControl,
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
import {
  IconUsers,
  IconWorld,
  IconBoxSeam,
  IconBadge,
  IconPlus,
} from '@tabler/icons-react';
import { DiscountApplyTo } from '@/lib/services/discount/types';
import { DiscountFormValues } from '../../schema';
import { useState, useCallback, useMemo } from 'react';
import ProductSelectionDialog from './product-selection-dialog';
import MemberSelectionDialog from './member-selection-dialog';
import TierSelectionDialog from './tier-selection-dialog';

interface DiscountApplicationProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function DiscountApplication({
  form,
}: DiscountApplicationProps) {
  const t = useTranslations('discount.form');
  const applyTo = form.watch('applyTo');
  const productIds = form.watch('productIds');
  const memberIds = form.watch('memberIds');
  const memberTierIds = form.watch('memberTierIds');

  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);

  const applicationOptions = [
    {
      value: DiscountApplyTo.ALL,
      label: t('allProductsCustomers'),
      icon: <IconWorld size={16} />,
      description: t('allProductsCustomersDesc'),
    },
    {
      value: DiscountApplyTo.SPECIFIC_PRODUCTS,
      label: t('specificProducts'),
      icon: <IconBoxSeam size={16} />,
      description: t('specificProductsDesc'),
    },
    {
      value: DiscountApplyTo.SPECIFIC_MEMBERS,
      label: t('specificMembers'),
      icon: <IconUsers size={16} />,
      description: t('specificMembersDesc'),
    },
    {
      value: DiscountApplyTo.SPECIFIC_MEMBER_TIERS,
      label: t('memberTiers'),
      icon: <IconBadge size={16} />,
      description: t('memberTiersDesc'),
    },
  ];

  // Handle application type change
  const handleApplyToChange = useCallback(
    (value: DiscountApplyTo) => {
      form.setValue('applyTo', value, { shouldValidate: true });
      form.setValue('isGlobal', value === DiscountApplyTo.ALL, {
        shouldValidate: true,
      });

      // Clear selections when changing application type
      if (value !== DiscountApplyTo.SPECIFIC_PRODUCTS) {
        form.setValue('productIds', [], { shouldValidate: true });
      }
      if (value !== DiscountApplyTo.SPECIFIC_MEMBERS) {
        form.setValue('memberIds', [], { shouldValidate: true });
      }
      if (value !== DiscountApplyTo.SPECIFIC_MEMBER_TIERS) {
        form.setValue('memberTierIds', [], { shouldValidate: true });
      }
    },
    [form],
  );

  // Get selected application option
  const selectedApplicationOption = useMemo(() => {
    return applicationOptions.find((option) => option.value === applyTo);
  }, [applyTo]);

  // Get selection counts for display
  const getSelectionSummary = () => {
    switch (applyTo) {
      case DiscountApplyTo.SPECIFIC_PRODUCTS:
        return productIds?.length
          ? `${productIds.length} ${t('productsSelected')}`
          : t('noProductsSelectedYet');
      case DiscountApplyTo.SPECIFIC_MEMBERS:
        return memberIds?.length
          ? `${memberIds.length} ${t('membersSelected')}`
          : t('noMembersSelectedYet');
      case DiscountApplyTo.SPECIFIC_MEMBER_TIERS:
        return memberTierIds?.length
          ? `${memberTierIds.length} ${t('tiersSelected')}`
          : t('noTiersSelectedYet');
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Application Type Dropdown */}
      <FormField
        control={form.control}
        name="applyTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('applyTo')} *</FormLabel>
            <Select onValueChange={handleApplyToChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectDiscountScope')}>
                    {selectedApplicationOption && (
                      <div className="flex items-center gap-2">
                        {selectedApplicationOption.icon}
                        <span>{selectedApplicationOption.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {applicationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Selection Buttons for Specific Types */}
      {applyTo === DiscountApplyTo.SPECIFIC_PRODUCTS && (
        <FormField
          control={form.control}
          name="productIds"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconBoxSeam size={16} className="text-orange-600" />
                    <span className="font-medium">{t('selectedProducts')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getSelectionSummary()}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProductDialogOpen(true)}
                  className="shrink-0"
                >
                  <IconPlus size={16} className="mr-1" />
                  {t('selectProducts')}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {applyTo === DiscountApplyTo.SPECIFIC_MEMBERS && (
        <FormField
          control={form.control}
          name="memberIds"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconUsers size={16} className="text-green-600" />
                    <span className="font-medium">{t('selectedMembers')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getSelectionSummary()}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMemberDialogOpen(true)}
                  className="shrink-0"
                >
                  <IconPlus size={16} className="mr-1" />
                  {t('selectMembers')}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {applyTo === DiscountApplyTo.SPECIFIC_MEMBER_TIERS && (
        <FormField
          control={form.control}
          name="memberTierIds"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconBadge size={16} className="text-purple-600" />
                    <span className="font-medium">{t('selectedTiers')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getSelectionSummary()}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTierDialogOpen(true)}
                  className="shrink-0"
                >
                  <IconPlus size={16} className="mr-1" />
                  {t('selectTiers')}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Selection Dialogs */}
      <ProductSelectionDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        selectedIds={productIds || []}
        onSelectionSave={(ids) =>
          form.setValue('productIds', ids, { shouldValidate: true })
        }
      />

      <MemberSelectionDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        selectedIds={memberIds || []}
        onSelectionSave={(ids) =>
          form.setValue('memberIds', ids, { shouldValidate: true })
        }
      />

      <TierSelectionDialog
        open={tierDialogOpen}
        onOpenChange={setTierDialogOpen}
        selectedIds={memberTierIds || []}
        onSelectionSave={(ids) =>
          form.setValue('memberTierIds', ids, { shouldValidate: true })
        }
      />
    </div>
  );
}
