'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { RewardWithClaimCount } from '@/lib/types/reward';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { createReward, updateReward } from '../actions';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Reward name is required'),
  pointsCost: z.coerce.number().min(1, 'Points cost must be at least 1'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  expiryDate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface RewardFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: RewardWithClaimCount;
  onSuccess?: () => void;
}

export default function RewardFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: RewardFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      pointsCost: initialData?.pointsCost || 100,
      stock: initialData?.stock || 10,
      isActive: initialData?.isActive ?? true,
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate)
        : null,
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        pointsCost: initialData.pointsCost || 100,
        stock: initialData.stock || 0,
        isActive: initialData.isActive ?? true,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate)
          : null,
      });
    } else {
      form.reset({
        name: '',
        pointsCost: 100,
        stock: 10,
        isActive: true,
        description: '',
        imageUrl: '',
        expiryDate: null,
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Check if expiry date is in the past
      if (values.expiryDate && values.expiryDate < new Date()) {
        toast({
          title: 'Invalid date',
          description: 'Expiry date cannot be in the past',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const result =
        isEditing && initialData
          ? await updateReward(initialData.id, {
              name: values.name,
              pointsCost: values.pointsCost,
              stock: values.stock,
              isActive: values.isActive,
              description: values.description,
              imageUrl: values.imageUrl,
              expiryDate: values.expiryDate,
            })
          : await createReward({
              name: values.name,
              pointsCost: values.pointsCost,
              stock: values.stock,
              isActive: values.isActive,
              description: values.description,
              imageUrl: values.imageUrl,
              expiryDate: values.expiryDate,
            });

      if (result.success) {
        toast({
          title: isEditing ? 'Reward updated' : 'Reward created',
          description: isEditing
            ? 'Reward has been updated successfully'
            : 'New reward has been created',
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
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>Create</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Reward' : 'Create Reward'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the reward information below'
              : 'Add a new reward for your members to claim'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reward name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reward description"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what the reward includes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pointsCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points Cost</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Add image URL field */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/reward-image.jpg"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide an image URL for the reward (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date & Time</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => {
                            // Keep the time from the existing date if available
                            if (date && field.value) {
                              const currentTime = field.value;
                              date.setHours(
                                currentTime.getHours(),
                                currentTime.getMinutes(),
                                currentTime.getSeconds(),
                              );
                            }
                            field.onChange(date);
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {field.value && (
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="time"
                            step="1" // Include seconds
                            value={
                              field.value ? format(field.value, 'HH:mm:ss') : ''
                            }
                            onChange={(e) => {
                              if (field.value) {
                                const [hours, minutes, seconds] = e.target.value
                                  .split(':')
                                  .map(Number);
                                const newDate = new Date(field.value);
                                newDate.setHours(
                                  hours || 0,
                                  minutes || 0,
                                  seconds || 0,
                                );
                                field.onChange(newDate);
                              }
                            }}
                            className="w-full"
                            placeholder="Set time (HH:MM:SS)"
                          />
                        </FormControl>
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    The reward will automatically expire and become inactive on
                    this exact date and time
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Make this reward available for members to claim
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
                  <>{isEditing ? 'Update Reward' : 'Create Reward'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
