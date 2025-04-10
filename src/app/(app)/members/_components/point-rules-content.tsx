'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
const formSchema = z.object({
  enabled: z.boolean(),
  baseAmount: z.coerce
    .number()
    .int()
    .min(1000, 'Base amount must be at least 1,000'),
  pointMultiplier: z.coerce
    .number()
    .min(0.1, 'Multiplier must be at least 0.1'),
});

type FormValues = z.infer<typeof formSchema>;

// Define tier multipliers
const TIER_MULTIPLIERS = {
  Bronze: 1,
  Silver: 1.2,
  Gold: 1.5,
  Platinum: 2,
  Diamond: 2.5,
};

// Tooltip descriptions
const TOOLTIPS = {
  enabled:
    'When enabled, customers will earn points for every purchase based on the settings below. Disabling this will stop all point accumulation.',
  baseAmount:
    'This is the transaction amount required to earn 1 point. For example, if set to 10,000, then a 50,000 purchase will earn 5 points (before multipliers).',
  pointMultiplier:
    'A global multiplier applied to all point calculations. For example, setting this to 2 will double all points earned by all customers.',
  tierMultiplier:
    'Each membership tier has its own multiplier that is applied after the global multiplier. Higher tiers receive more points for the same purchase amount.',
};

export default function PointRulesContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exampleAmount, setExampleAmount] = useState(1000);
  const [originalValues, setOriginalValues] = useState<FormValues | null>(null);
  const [formChanged, setFormChanged] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
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
            title: 'Error',
            description: error || 'Failed to load point rule settings',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load point rule settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPointRuleSettings();
  }, [form]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);

      const { success, error } = await updatePointRuleSettings(values);

      if (success) {
        toast({
          title: 'Settings updated',
          description: 'Point rule settings have been updated successfully',
        });
        setOriginalValues(values);
        setFormChanged(false);
      } else {
        toast({
          title: 'Error',
          description: error || 'Failed to update point rule settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update point rule settings',
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
            Point Rules Configuration
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how points are awarded to members for their purchases
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconSettings className="w-5 h-5 mr-2" />
            Point Calculation Settings
          </CardTitle>
          <CardDescription>
            These settings determine how points are calculated for each
            transaction
          </CardDescription>
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
                        Enable Points System
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {TOOLTIPS.enabled}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormDescription>
                        When disabled, no points will be awarded for any
                        purchases
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
                        Base Amount
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {TOOLTIPS.baseAmount}
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
                        For every {formatRupiah(field.value)} spent, customers
                        earn 1 point
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
                        Global Point Multiplier
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {TOOLTIPS.pointMultiplier}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} step="0.1" min="0.1" />
                      </FormControl>
                      <FormDescription>
                        Multiply all points earned by this value
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
                      Example Point Calculation
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border border-t-0 rounded-b-md p-4 bg-muted/30">
                    <div className="mb-4">
                      <div className="text-sm mb-2 flex items-center">
                        Example transaction amount:
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Enter any amount to see how many points each tier
                              would earn for this purchase.
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
                      Points earned by tier:
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconInfoCircle className="w-4 h-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {TOOLTIPS.tierMultiplier}
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
                              points
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
                Reset to Default
              </Button>
              <Button type="submit" disabled={isSaving || !formChanged}>
                {isSaving ? 'Saving...' : 'Save Settings'}
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
