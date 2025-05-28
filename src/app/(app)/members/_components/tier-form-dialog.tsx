'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { MemberTier } from '@/lib/types/member';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from '@/hooks/use-toast';
import { createMemberTier, updateMemberTier } from '../action';

// Form schema for tier
const tierFormSchema = z.object({
  name: z.string().min(1, 'Tier name is required'),
  minPoints: z.coerce
    .number()
    .int()
    .min(0, 'Minimum points must be a non-negative integer'),
  multiplier: z.coerce.number().min(0.1, 'Multiplier must be at least 0.1'),
});

type FormValues = z.infer<typeof tierFormSchema>;

interface TierFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: MemberTier;
  onSuccess?: () => void;
}

export default function TierFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: TierFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(tierFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      minPoints: initialData?.minPoints || 0,
      multiplier: initialData?.multiplier || 1,
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        minPoints: initialData.minPoints,
        multiplier: initialData.multiplier,
      });
    } else {
      form.reset({
        name: '',
        minPoints: 0,
        multiplier: 1,
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateMemberTier(initialData.id, {
              name: values.name,
              minPoints: values.minPoints,
              multiplier: values.multiplier,
            })
          : await createMemberTier({
              name: values.name,
              minPoints: values.minPoints,
              multiplier: values.multiplier,
            });

      if (result.success) {
        toast({
          title: isEditing ? 'Tier updated' : 'Tier created',
          description: isEditing
            ? 'Membership tier has been updated successfully'
            : 'New membership tier has been created',
        });

        form.reset();
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save member tier:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tier' : 'Create Tier'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the membership tier information below'
              : 'Add a new membership tier to your loyalty program'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tier name" {...field} />
                  </FormControl>
                  <FormDescription>
                    E.g., Bronze, Silver, Gold, Platinum
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Points</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minimum points"
                      value={field.value === 0 ? '' : field.value}
                      onFocus={(e) => {
                        if (e.target.value === '0') {
                          e.target.value = '';
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          e.target.value = '0';
                          field.onChange(0);
                        }
                      }}
                      onChange={(e) => {
                        const value =
                          e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum points required to reach this tier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="multiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points Multiplier</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Points earned will be multiplied by this value
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange && onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>{isEditing ? 'Updating...' : 'Creating...'}</>
                ) : (
                  <>{isEditing ? 'Update Tier' : 'Create Tier'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
