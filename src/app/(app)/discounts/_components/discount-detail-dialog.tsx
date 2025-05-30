'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { getDiscount } from '../action';
import {
  IconCalendar,
  IconTicket,
  IconPercentage,
  IconUsers,
  IconBoxSeam,
  IconCreditCard,
  IconShoppingCart,
  IconBadge,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  formatDiscountValue,
  formatApplyTo,
} from '@/lib/common/discount-utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DiscountDetailDialogProps,
  DiscountDetailWithValidation,
  ProductForDiscount,
  MemberForDiscount,
  MemberTierForDiscount,
  StatusInfo,
  DiscountType,
  DiscountApplyTo,
} from '@/lib/types/discount';

export function DiscountDetailDialog({
  open,
  onOpenChange,
  discountId,
}: DiscountDetailDialogProps) {
  const t = useTranslations('discount');
  const [discount, setDiscount] = useState<DiscountDetailWithValidation | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch discount details when the dialog opens
  useEffect(() => {
    const fetchDiscount = async () => {
      if (!discountId || !open) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getDiscount(discountId);
        if (response.success && response.discount) {
          setDiscount(response.discount as DiscountDetailWithValidation);

          // Set active tab based on discount type
          if (response.discount.applyTo === 'SPECIFIC_PRODUCTS') {
            setActiveTab('products');
          } else if (response.discount.applyTo === 'SPECIFIC_MEMBERS') {
            setActiveTab('members');
          } else if (response.discount.applyTo === 'SPECIFIC_MEMBER_TIERS') {
            setActiveTab('tiers');
          } else {
            setActiveTab('overview');
          }
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to fetch discount details',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching discount details:', error);
        toast({
          title: 'Error fetching discount details',
          description:
            'An unexpected error occurred while fetching discount details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscount();
  }, [discountId, open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset with a slight delay to prevent UI flicker
      const timer = setTimeout(() => {
        setDiscount(null);
        setActiveTab('overview');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Determine if discount is expired
  const isExpired = discount && new Date(discount.endDate) < new Date();

  // Calculate usage percentage
  const usagePercentage = discount?.maxUses
    ? Math.min(100, (discount.usedCount / discount.maxUses) * 100)
    : 0;

  // Get status label and badge variant
  const getStatusInfo = (): StatusInfo => {
    if (!discount)
      return { label: t('detail.unavailable'), variant: 'outline' };
    if (!discount.isActive)
      return { label: t('table.inactive'), variant: 'outline' };
    if (isExpired)
      return { label: t('detail.expired'), variant: 'destructive' };
    return { label: t('table.active'), variant: 'default' };
  };

  const statusInfo = getStatusInfo();

  // Format date range to be more readable
  const formatDateRange = (): string => {
    if (!discount) return '';
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    return `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-48" />
                ) : discount ? (
                  <>
                    {discount.name}
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </>
                ) : (
                  t('detail.title')
                )}
              </DialogTitle>

              {!isLoading && discount && (
                <div className="mr-8">
                  <Badge
                    variant={
                      discount.type === 'PERCENTAGE' ? 'default' : 'secondary'
                    }
                    className="text-lg px-3 py-1"
                  >
                    {formatDiscountValue(
                      discount.type as DiscountType,
                      discount.value,
                    )}
                  </Badge>
                </div>
              )}
            </div>

            {!isLoading && discount && discount.code && (
              <div className="mb-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t('detail.code')}:
                </p>
                <Badge
                  variant="outline"
                  className="font-mono text-base px-3 py-1"
                >
                  {discount.code}
                </Badge>
              </div>
            )}

            {!isLoading && discount && !discount.code && (
              <DialogDescription className="mt-1">
                <span className="text-muted-foreground italic">
                  {t('detail.noCodeRequired')}
                </span>
              </DialogDescription>
            )}
          </div>
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
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="col-span-2">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <IconCalendar className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {t('detail.validityPeriod')}
                              </span>
                            </div>
                            <p className="font-medium">{formatDateRange()}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <IconShoppingCart className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {t('detail.minPurchase')}
                              </span>
                            </div>
                            <p className="font-medium">
                              {discount.minPurchase
                                ? `Rp ${discount.minPurchase.toLocaleString()}`
                                : t('detail.noMinimum')}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              {discount.isGlobal ? (
                                <IconPercentage className="h-4 w-4" />
                              ) : discount.applyTo === 'SPECIFIC_PRODUCTS' ? (
                                <IconBoxSeam className="h-4 w-4" />
                              ) : discount.applyTo === 'SPECIFIC_MEMBERS' ? (
                                <IconUsers className="h-4 w-4" />
                              ) : (
                                <IconBadge className="h-4 w-4" />
                              )}
                              <span className="text-sm font-medium">
                                {t('detail.application')}
                              </span>
                            </div>
                            <p className="font-medium">
                              {discount.isGlobal
                                ? t('detail.globalDiscount')
                                : formatApplyTo(
                                    discount.applyTo as DiscountApplyTo,
                                  )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {discount.maxUses && discount.maxUses > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <IconCreditCard className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {t('detail.usageLimit')}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>
                                {t('detail.used')}: {discount.usedCount}{' '}
                                {t('detail.times')}
                              </span>
                              <span>
                                {t('detail.limit')}: {discount.maxUses}
                              </span>
                            </div>
                            <Progress value={usagePercentage} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {discount.description && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <IconTicket className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {t('detail.description')}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-line">
                            {discount.description}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="products" className="px-6 mt-2">
                  {discount.products && discount.products.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="max-h-[50vh] overflow-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                              <TableHead className="w-1/3">
                                {t('detail.product')}
                              </TableHead>
                              <TableHead>{t('detail.barcode')}</TableHead>
                              <TableHead>{t('detail.category')}</TableHead>
                              <TableHead>{t('detail.brand')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {discount.products.map(
                              (product: ProductForDiscount) => (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">
                                    {product.name}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {product.barcode || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {product.category?.name || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {product.brand?.name || 'N/A'}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IconBoxSeam className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        {t('detail.noProductsAssociated')}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="members" className="px-6 mt-2">
                  {discount.members && discount.members.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="max-h-[50vh] overflow-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                              <TableHead className="w-1/3">
                                {t('detail.member')}
                              </TableHead>
                              <TableHead>{t('detail.tier')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {discount.members.map(
                              (member: MemberForDiscount) => (
                                <TableRow key={member.id}>
                                  <TableCell className="font-medium">
                                    {member.name}
                                  </TableCell>
                                  <TableCell>
                                    {member.tier?.name || 'N/A'}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IconUsers className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        {t('detail.noMembersAssociated')}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tiers" className="px-6 mt-2">
                  {discount.memberTiers && discount.memberTiers.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="max-h-[50vh] overflow-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow>
                              <TableHead className="w-1/3">
                                {t('detail.tierName')}
                              </TableHead>
                              <TableHead>{t('detail.minPoints')}</TableHead>
                              <TableHead>{t('detail.multiplier')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {discount.memberTiers.map(
                              (tier: MemberTierForDiscount) => (
                                <TableRow key={tier.id}>
                                  <TableCell className="font-medium">
                                    {tier.name}
                                  </TableCell>
                                  <TableCell>{tier.minPoints}</TableCell>
                                  <TableCell>{tier.multiplier}x</TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IconBadge className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        {t('detail.noTiersAssociated')}
                      </p>
                    </div>
                  )}
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
