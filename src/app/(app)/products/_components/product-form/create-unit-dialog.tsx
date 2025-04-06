'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProductForm } from './product-form-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast';

// Mock action to create unit
const createUnit = async (data: { name: string; symbol: string }) => {
  // Return a mock successful response
  return {
    success: true,
    data: {
      id: `temp-${new Date().getTime()}`,
      name: data.name,
      symbol: data.symbol,
    },
  };
};

const formSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  symbol: z
    .string()
    .min(1, 'Unit symbol is required')
    .max(5, 'Symbol should be short'),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateUnitDialog() {
  const { openUnitCreate, setOpenUnitCreate } = useProductForm();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      symbol: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const result = await createUnit(values);

      if (result.success) {
        toast({
          title: 'Unit created',
          description: 'New unit has been created successfully',
        });
        form.reset();
        setOpenUnitCreate(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create unit',
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
    <Dialog open={openUnitCreate} onOpenChange={setOpenUnitCreate}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Unit</DialogTitle>
          <DialogDescription>
            Add a new unit for measuring products
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Kilogram, Liter, Piece"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., kg, L, pc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenUnitCreate(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Unit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
