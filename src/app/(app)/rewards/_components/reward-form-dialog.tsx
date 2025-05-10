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
import { RewardImageUpload } from './reward-image-upload';

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
  showTrigger?: boolean;
}

export default function RewardFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  showTrigger = false,
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
      if (values.expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset waktu ke awal hari

        const expiryDate = new Date(values.expiryDate);
        expiryDate.setHours(0, 0, 0, 0); // Reset waktu ke awal hari

        // Validasi: hanya tolak tanggal yang SEBELUM hari ini
        if (expiryDate < today) {
          toast({
            title: 'Invalid date',
            description: 'Expiry date cannot be in the past',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
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

  // Handle image upload
  const handleImageChange = (imageUrl: string) => {
    form.setValue('imageUrl', imageUrl);
    form.trigger('imageUrl');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="default" className="space-x-1">
            <span>Create</span> <IconPlus size={18} />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            {/* Scrollable content area with side-by-side layout */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left side - Image upload */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="md:w-[280px] flex-shrink-0">
                      <FormLabel>Reward Image</FormLabel>
                      <FormControl>
                        <RewardImageUpload
                          currentImage={field.value || ''}
                          name={form.getValues('name')}
                          onImageChange={handleImageChange}
                        />
                      </FormControl>
                      <FormDescription className="mt-2 text-xs">
                        Upload an image to make your reward more appealing
                        (recommended ratio: 16:9)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Right side - Form fields */}
                <div className="flex-1 space-y-5">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Basic Information
                    </h3>

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

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter reward description"
                                className="resize-none h-[80px]"
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
                    </div>
                  </div>

                  {/* Reward Value Section */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Reward Value
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pointsCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points Cost</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                {...field}
                              />
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
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Availability
                    </h3>

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Active Status
                              </FormLabel>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed footer with action buttons */}
            <div className="p-4 border-t flex flex-row justify-end gap-2 mt-auto">
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
