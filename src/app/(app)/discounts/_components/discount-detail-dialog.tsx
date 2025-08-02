'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { IconTicket } from '@tabler/icons-react';
import { DiscountDetailHeader } from './discount-details/discount-detail-header';
import { DiscountDetailOverview } from './discount-details/discount-detail-overview';
import { DiscountDetailProducts } from './discount-details/discount-detail-products';
import { DiscountDetailMembers } from './discount-details/discount-detail-members';
import { DiscountDetailMemberTiers } from './discount-details/discount-detail-member-tiers';
import type { DiscountWithRelations } from '@/lib/services/discount/types';

// === LOCAL TYPES ===
interface DiscountDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: DiscountWithRelations | null;
  isLoading?: boolean;
}

export function DiscountDetailDialog({
  open,
  onOpenChange,
  discount,
  isLoading = false,
}: DiscountDetailDialogProps) {
  const t = useTranslations('discount');
  const [activeTab, setActiveTab] = useState('overview');

  // Reset tab when dialog closes or new discount is loaded
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setActiveTab('overview');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Set active tab based on discount type when discount changes
  useEffect(() => {
    if (discount) {
      if (
        discount.applyTo === 'SPECIFIC_PRODUCTS' &&
        discount.products?.length
      ) {
        setActiveTab('products');
      } else if (
        discount.applyTo === 'SPECIFIC_MEMBERS' &&
        discount.members?.length
      ) {
        setActiveTab('members');
      } else if (
        discount.applyTo === 'SPECIFIC_MEMBER_TIERS' &&
        discount.memberTiers?.length
      ) {
        setActiveTab('tiers');
      } else {
        setActiveTab('overview');
      }
    }
  }, [discount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DiscountDetailHeader discount={discount} isLoading={isLoading} />
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">
            <DiscountDetailSkeleton />
          </div>
        ) : discount ? (
          <>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-6">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    {t('detail.overview')}
                  </TabsTrigger>
                  {discount.applyTo === 'SPECIFIC_PRODUCTS' &&
                    discount.products?.length &&
                    discount.products.length > 0 && (
                      <TabsTrigger value="products" className="flex-1">
                        {t('detail.products')} ({discount.products.length})
                      </TabsTrigger>
                    )}
                  {discount.applyTo === 'SPECIFIC_MEMBERS' &&
                    discount.members?.length &&
                    discount.members.length > 0 && (
                      <TabsTrigger value="members" className="flex-1">
                        {t('detail.members')} ({discount.members.length})
                      </TabsTrigger>
                    )}
                  {discount.applyTo === 'SPECIFIC_MEMBER_TIERS' &&
                    discount.memberTiers?.length &&
                    discount.memberTiers.length > 0 && (
                      <TabsTrigger value="tiers" className="flex-1">
                        {t('detail.memberTiers')} ({discount.memberTiers.length}
                        )
                      </TabsTrigger>
                    )}
                </TabsList>
              </div>

              <ScrollArea className="max-h-[60vh] mt-4 pb-16">
                <TabsContent value="overview" className="px-6 mt-2">
                  <DiscountDetailOverview discount={discount} />
                </TabsContent>

                <TabsContent value="products" className="px-6 mt-2">
                  <DiscountDetailProducts products={discount.products} />
                </TabsContent>

                <TabsContent value="members" className="px-6 mt-2">
                  <DiscountDetailMembers members={discount.members} />
                </TabsContent>

                <TabsContent value="tiers" className="px-6 mt-2">
                  <DiscountDetailMemberTiers
                    memberTiers={discount.memberTiers}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        ) : (
          <div className="py-12 text-center">
            <IconTicket className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              {t('detail.noInformationAvailable')}
            </p>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            {t('detail.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DiscountDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      <Skeleton className="h-24 w-full" />

      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full mt-1" />
        <Skeleton className="h-5 w-2/3 mt-1" />
      </div>
    </div>
  );
}
