'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { IconLoader2 } from '@tabler/icons-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { StoreFormType } from '@/lib/types/store';
import { getStore, updateStore } from '../action';
const defaultValues: StoreFormType = {
  store_name: 'TEST STORE',
  address: '',
  city: '',
  province: '',
  postal_code: '',
  country: '',
  phone_number: '',
  email: '',
  currency: '',
  timezone: '',
  owner_name: '',
  type: '',
  status: '',
  logo_url: '',
};

const formSchema = z.object({
  store_name: z.string().min(2, 'Store name is required'),
  address: z.string().min(2, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postal_code: z.string(),
  country: z.string().min(2, 'Country is required'),
  phone_number: z.string(),
  email: z.string().email('Invalid email address').optional(),
  currency: z.string().min(2, 'Currency is required'),
  timezone: z.string().optional(),
  owner_name: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  logo_url: z.string().url('Logo must be a valid URL').optional(),
});

export default function StoreForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<StoreFormType>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const getStoreData = async () => {
    try {
      setIsLoading(true);
      const response = await getStore();
      if (response.success) {
        form.reset(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch store data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const onSubmit = async (data: StoreFormType) => {
    try {
      if (!isEditing) {
        toast({
          title: 'Edit is not available',
          description: 'Failed to update store information',
          variant: 'destructive',
        });
      }
      const response = await updateStore(data);
      if (!response.success) {
        throw new Error('Failed to update store information');
      }
      setIsEditing(false);
      getStoreData();
      toast({
        title: 'Success',
        description: 'Store information updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update store information',
        variant: 'destructive',
      });
    }
  };
  useEffect(() => {
    getStoreData();
  }, []);

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Store Information</h2>
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            {isLoading && <div>Loading...</div>}
            {isLoading && <IconLoader2 className="animate-spin" size={12} />}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isEditing ? 'Editing' : 'View Only'}
          </span>
          <Switch
            checked={isEditing}
            onCheckedChange={() => setIsEditing(!isEditing)}
          />
        </div>
      </div>
      <CardContent className="space-y-6 pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="store_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter store name"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter address"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter city"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter province"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter postal code"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter country"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        disabled={!isEditing}
                      />
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
                        placeholder="Enter email"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. USD, IDR"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Asia/Jakarta"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter owner name"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Retail, Restaurant"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Active, Inactive"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!isEditing}>
                Save
                {isLoading && (
                  <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
