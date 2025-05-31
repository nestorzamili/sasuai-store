'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconCoin,
  IconSettings,
  IconCalculator,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  fetchPointRuleSettings,
  updatePointRuleSettings,
} from '../point-rules-action';
import { formatRupiah } from '@/lib/currency';

// Form schema for point rules
const pointRulesSchema = z.object({
  enabled: z.boolean(),
  baseAmount: z.coerce
    .number()
    .int()
    .min(1000, 'Base amount must be at least 1,000'),
  pointMultiplier: z.coerce
    .number()
    .min(0.1, 'Multiplier must be at least 0.1'),
});

type FormValues = z.infer<typeof pointRulesSchema>;

// Define tier multipliers
const TIER_MULTIPLIERS = {
  Bronze: 1,
  Silver: 1.2,
  Gold: 1.5,
  Platinum: 2,
  Diamond: 2.5,
};

export default function PointRulesContent() {
  const t = useTranslations('member.pointRules');
  const tCommon = useTranslations('member.common');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exampleAmount, setExampleAmount] = useState(1000);
  const [originalValues, setOriginalValues] = useState<FormValues | null>(null);
  const [formChanged, setFormChanged] = useState(false);

  // Initialize the form with translated validation messages
  const form = useForm<FormValues>({
    resolver: zodResolver(
      pointRulesSchema.superRefine((data, ctx) => {
        if (data.baseAmount < 1000) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 1000,
            type: 'number',
            inclusive: true,
            path: ['baseAmount'],
            message: t('validation.baseAmountMin'),
          });
        }
        if (data.pointMultiplier < 0.1) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 0.1,
            type: 'number',
            inclusive: true,
            path: ['pointMultiplier'],
            message: t('validation.multiplierMin'),
          });
        }
      }),
    ),
    defaultValues: {
      enabled: true,
      baseAmount: 10000,
      pointMultiplier: 1,
    },
  });

  // Watch for form changes
  const watchedValues = form.watch();

  useEffect(() => {
    if (originalValues) {
      const hasChanged =
        originalValues.enabled !== watchedValues.enabled ||
        originalValues.baseAmount !== watchedValues.baseAmount ||
        originalValues.pointMultiplier !== watchedValues.pointMultiplier;

      setFormChanged(hasChanged);
    }
  }, [watchedValues, originalValues]);

  // Handle example amount change
  const handleExampleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setExampleAmount(value);
    }
  };

  // Fetch current point rule settings
  useEffect(() => {
    async function loadPointRuleSettings() {
      try {
        setIsLoading(true);
        const { success, data, error } = await fetchPointRuleSettings();

        if (success && data) {
          const formValues = {
            enabled: data.enabled,
            baseAmount: data.baseAmount,
            pointMultiplier: data.pointMultiplier,
          };

          setOriginalValues(formValues);
          form.reset(formValues);
        } else {
          toast({
            title: tCommon('error'),
            description: error || t('errors.failedToLoad'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to load point rule settings:', error);
        toast({
          title: tCommon('error'),
          description: t('errors.failedToLoad'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPointRuleSettings();
  }, [form, t, tCommon]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);

      const { success, error } = await updatePointRuleSettings({
        enabled: values.enabled,
        baseAmount: values.baseAmount,
        pointMultiplier: values.pointMultiplier,
      });

      if (success) {
        toast({
          title: t('success.title'),
          description: t('success.message'),
        });
        setOriginalValues(values);
        setFormChanged(false);
      } else {
        toast({
          title: tCommon('error'),
          description: error || t('errors.failedToUpdate'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update point rule settings:', error);
      toast({
        title: tCommon('error'),
        description: t('errors.failedToUpdate'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    const defaultValues = {
      enabled: true,
      baseAmount: 1000,
      pointMultiplier: 1,
    };
    form.reset(defaultValues);

    // Update form changed state based on comparison with original values
    if (originalValues) {
      const hasChanged =
        originalValues.enabled !== defaultValues.enabled ||
        originalValues.baseAmount !== defaultValues.baseAmount ||
        originalValues.pointMultiplier !== defaultValues.pointMultiplier;

      setFormChanged(hasChanged);
    }
  };

  // Calculate points for a given amount based on current settings
  const calculatePoints = (amount: number, tierMultiplier = 1) => {
    const basePoints = Math.floor(amount / form.watch('baseAmount'));
    const withGlobalMultiplier = Math.floor(
      basePoints * form.watch('pointMultiplier'),
    );
    const withTierMultiplier = Math.floor(
      withGlobalMultiplier * tierMultiplier,
    );
    return withTierMultiplier;
  };

  if (isLoading) {
    return <PointRulesContentSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <IconCoin className="w-5 h-5 mr-2 text-amber-500" />
            {t('title')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconSettings className="w-5 h-5 mr-2" />
            {t('settings.title')}
          </CardTitle>
          <CardDescription>{t('settings.description')}</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center">
                        {t('fields.enabled.label')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {t('tooltips.enabled')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormDescription>
                        {t('fields.enabled.description')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="baseAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        {t('fields.baseAmount.label')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {t('tooltips.baseAmount')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min="1000"
                          step="1000"
                        />
                      </FormControl>
                      <FormDescription>
                        {t('fields.baseAmount.description', {
                          amount: formatRupiah(field.value),
                        })}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pointMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        {t('fields.pointMultiplier.label')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {t('tooltips.pointMultiplier')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} step="0.1" min="0.1" />
                      </FormControl>
                      <FormDescription>
                        {t('fields.pointMultiplier.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="example-calculation">
                  <AccordionTrigger className="px-4 py-3 bg-muted/30 border rounded-t-md hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center text-base">
                      <IconCalculator className="w-4 h-4 mr-2 text-blue-500" />
                      {t('calculator.title')}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border border-t-0 rounded-b-md p-4 bg-muted/30">
                    <div className="mb-4">
                      <div className="text-sm mb-2 flex items-center">
                        {t('calculator.exampleAmount')}:
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {t('tooltips.exampleCalculation')}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={exampleAmount}
                          onChange={handleExampleAmountChange}
                          className="max-w-xs"
                          min="0"
                          step="1000"
                        />
                        <span className="text-sm">
                          {formatRupiah(exampleAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 mb-2 flex items-center text-sm font-medium">
                      {t('calculator.pointsByTier')}:
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {t('tooltips.tierMultiplier')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="space-y-3 mt-2 text-sm">
                      {Object.entries(TIER_MULTIPLIERS).map(
                        ([tier, multiplier]) => (
                          <div
                            key={tier}
                            className="grid grid-cols-3 gap-2 p-3 border rounded-md bg-background"
                          >
                            <div className="font-medium">{tier}</div>
                            <div className="text-muted-foreground">
                              {multiplier}x
                            </div>
                            <div className="text-right font-semibold">
                              {calculatePoints(exampleAmount, multiplier)}{' '}
                              {t('calculator.points')}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>

            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button
                variant="outline"
                type="button"
                onClick={resetToDefaults}
                disabled={isSaving}
              >
                {t('actions.resetToDefault')}
              </Button>
              <Button type="submit" disabled={isSaving || !formChanged}>
                {isSaving ? t('actions.saving') : t('actions.saveSettings')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

function PointRulesContentSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-5 w-96 mt-1" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-80 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-1" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-72" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          <div className="bg-muted/30 border rounded-lg">
            <div className="p-4 border-b">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="pl-4 pt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full mt-3" />
                <Skeleton className="h-10 w-full mt-3" />
                <Skeleton className="h-10 w-full mt-3" />
                <Skeleton className="h-10 w-full mt-3" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  );
}
