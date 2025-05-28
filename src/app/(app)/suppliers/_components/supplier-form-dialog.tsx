'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { createSupplier, updateSupplier } from '../action';
import { SupplierFormInitialData } from '@/lib/types/supplier';

// Form schema for supplier
const formSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contact: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SupplierFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: SupplierFormInitialData;
  onSuccess?: () => void;
  trigger?: boolean;
}

export default function SupplierFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  trigger = false,
}: SupplierFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled
    ? (value: boolean) => {
        onOpenChange?.(value);
        // If dialog is closing and we're in controlled mode, let parent handle it
      }
    : setInternalOpen;

  const isEditing = Boolean(initialData?.id);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact: '',
    },
  });

  // Update form when initialData or open status changes
  useEffect(() => {
    if (isOpen) {
      // Only update form when dialog is open
      form.reset({
        name: initialData?.name || '',
        contact: initialData?.contact || '',
      });
    } else if (!isOpen && form.formState.isDirty) {
      // Reset form when dialog closes
      form.reset();
    }
  }, [form, initialData, isOpen]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateSupplier(initialData.id, {
              name: values.name,
              contact: values.contact,
            })
          : await createSupplier({
              name: values.name,
              contact: values.contact,
            });

      if (result.success) {
        toast({
          title: isEditing ? 'Supplier updated' : 'Supplier created',
          description: isEditing
            ? 'Supplier has been updated successfully'
            : 'New supplier has been created',
        });

        form.reset();
        onSuccess?.();
        setIsOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating/updating supplier:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    // If dialog is closing, reset form
    if (!value) {
      form.reset();
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Supplier' : 'Create Supplier'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Edit the supplier information below'
            : 'Add a new supplier to your inventory system'}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact information (phone, email, etc.)"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>{isEditing ? 'Updating...' : 'Creating...'}</>
              ) : (
                <>{isEditing ? 'Update Supplier' : 'Create Supplier'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  // If trigger prop is true, render a button that triggers the dialog
  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="default" className="space-x-1">
            <span>Create</span> <IconPlus size={18} />
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // Otherwise, just render the dialog with external control
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
