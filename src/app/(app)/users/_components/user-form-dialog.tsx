'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { User } from './main-content';
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
import { createUser } from '../action';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  role: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: User;
  onSuccess?: () => void;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: UserFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Don't prefill password
        role: initialData.role || 'user',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      if (isEditing) {
        // In a real app, we would implement update functionality
        // For now, let's just show a toast message
        toast({
          title: 'Not implemented',
          description: 'User editing is not implemented yet',
          variant: 'destructive',
        });
      } else {
        const result = await createUser({
          name: values.name,
          email: values.email,
          password: values.password || '',
          role: values.role,
        });

        if (result.success) {
          toast({
            title: 'User created',
            description: 'New user has been created successfully',
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
      }
    } catch (error) {
      console.error('Error submitting form:', error);
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
          <span>Create User</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the user information below'
              : 'Add a new user to your system'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...field}
                      disabled={isEditing} // Email cannot be changed if editing
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? 'New Password' : 'Password'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditing
                          ? 'Leave blank to keep current password'
                          : 'Enter password'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
                  <>{isEditing ? 'Update User' : 'Create User'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
