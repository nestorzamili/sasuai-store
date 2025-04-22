'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { MemberWithTier } from '@/lib/types/member';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { createMember, updateMember } from '../action';

// Define the form schema
const formSchema = z.object({
  cardId: z.string().nonempty('Card ID is required'),
  name: z.string().min(1, 'Member name is required'),
  email: z.string().email('Invalid email format').optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  tierId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface MemberFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: MemberWithTier;
  tiers: any[];
  onSuccess?: () => void;
}

export default function MemberFormDialog({
  open,
  onOpenChange,
  initialData,
  tiers,
  onSuccess,
}: MemberFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || null,
      phone: initialData?.phone || null,
      tierId: initialData?.tierId || null,
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        cardId: initialData.cardId || '',
        name: initialData.name || '',
        email: initialData.email || null,
        address: initialData.address || null,
        phone: initialData.phone || null,
        tierId: initialData.tierId || null,
      });
    } else {
      form.reset({
        name: '',
        cardId: '',
        address: null,
        email: null,
        phone: null,
        tierId: null,
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateMember(initialData.id, {
              name: values.name,
              cardId: values.cardId,
              address: values.address,
              email: values.email,
              phone: values.phone,
              tierId: values.tierId,
            })
          : await createMember({
              name: values.name,
              email: values.email,
              cardId: values.cardId,
              address: values.address,
              phone: values.phone,
              tierId: values.tierId,
            });

      if (result.success) {
        toast({
          title: isEditing ? 'Member updated' : 'Member created',
          description: isEditing
            ? 'Member has been updated successfully'
            : 'New member has been created',
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

  // Create dialog content
  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Member' : 'Create Member'}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Edit the member information below'
            : 'Add a new member to your loyalty program'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card ID</FormLabel>
                <FormControl>
                  <Input placeholder="Scan card" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Member Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter member name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter phone number"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Address"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membership Tier</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a membership tier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name} ({tier.minPoints} points)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <>{isEditing ? 'Update Member' : 'Create Member'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Only show trigger button when it's for creating a new member */}
      {!isEditing && (
        <DialogTrigger asChild>
          <Button variant="default" className="space-x-1">
            <span>Create</span> <IconPlus size={18} />
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
}
