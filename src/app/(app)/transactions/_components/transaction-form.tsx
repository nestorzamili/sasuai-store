'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createTransaction } from '../action';
import { useToast } from '@/hooks/use-toast';
import { TransactionWithRelations } from '@/lib/types/transaction';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRupiah } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';
import { Separator } from '@/components/ui/separator';
import {
  TransactionItemData,
  TransactionItemList,
} from './transaction-item-list';
import { ProductSelectionDialog } from './product-selection-dialog';
import { IconPlus } from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AvailableProductBatch } from '@/lib/types/product-batch';
import { useAuth } from '@/context/auth-context';

// This is a simplified schema - in a real application, this would be more complex
const formSchema = z.object({
  memberId: z.string().nullable().optional(),
  cashierId: z.string().min(1, 'Cashier is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  initialData?: TransactionWithRelations;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const isEditing = Boolean(initialData?.id);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<TransactionItemData[]>([]);
  const [activeTab, setActiveTab] = useState('items');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get current user from auth context
  const { user } = useAuth();

  // Use the proper ID field from user object
  // The email is not the primary key, we need to use the id field
  const cashierId = user?.id || '';

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashierId: initialData?.cashierId || cashierId,
      memberId: initialData?.memberId || null,
      paymentMethod: initialData?.paymentMethod || 'cash',
    },
  });

  // Update cashier ID when user data is loaded
  useEffect(() => {
    if (cashierId && !form.getValues('cashierId')) {
      form.setValue('cashierId', cashierId);
    }
  }, [cashierId, form]);

  // Initialize items from initialData if in edit mode
  useEffect(() => {
    if (isEditing && initialData?.items) {
      const formattedItems: TransactionItemData[] = initialData.items.map(
        (item) => ({
          batchId: item.batchId,
          productName: item.batch.product.name,
          batchCode: item.batch.batchCode,
          quantity: item.quantity,
          unitId: item.unitId,
          unitSymbol: item.unit.symbol,
          pricePerUnit: item.pricePerUnit,
          subtotal: item.subtotal,
        }),
      );
      setItems(formattedItems);
    }
  }, [isEditing, initialData]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = 0; // For simplicity, no discount logic here
    const finalTotal = subtotal - discount;

    return {
      subtotal,
      discount,
      finalTotal,
    };
  }, [items]);

  // Handle product selection
  const handleProductSelect = (
    product: AvailableProductBatch & { quantity: number },
  ) => {
    // Check if product already exists in items
    const existingItemIndex = items.findIndex(
      (item) => item.batchId === product.id,
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const newItems = [...items];
      const existingItem = newItems[existingItemIndex];
      const newQuantity = existingItem.quantity + product.quantity;

      // Check if new quantity exceeds available quantity
      if (newQuantity > product.availableQuantity) {
        toast({
          title: 'Quantity limit',
          description: 'Cannot exceed available quantity',
          variant: 'default',
        });
        return;
      }

      newItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        subtotal: newQuantity * existingItem.pricePerUnit,
      };

      setItems(newItems);
      toast({
        title: 'Item updated',
        description: `${product.product.name} quantity increased to ${newQuantity}`,
      });
    } else {
      // Add new item
      const newItem: TransactionItemData = {
        batchId: product.id,
        productName: product.product.name,
        batchCode: product.batchCode,
        quantity: product.quantity,
        unitId: product.unit.id,
        unitSymbol: product.unit.symbol,
        pricePerUnit: product.product.price,
        subtotal: product.quantity * product.product.price,
        availableQuantity: product.availableQuantity,
      };

      setItems((prev) => [...prev, newItem]);
      toast({
        title: 'Item added',
        description: `${product.product.name} added to transaction`,
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      toast({
        title: 'No items added',
        description: 'Please add at least one item to the transaction',
        variant: 'destructive',
      });
      return;
    }

    // Verify cashier ID is available
    if (!values.cashierId) {
      toast({
        title: 'Missing cashier',
        description: 'No cashier ID available for this transaction',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      console.log('Creating transaction with data:', {
        ...values,
        items: items.map((item) => ({
          batchId: item.batchId,
          quantity: item.quantity,
          unitId: item.unitId,
          pricePerUnit: item.pricePerUnit,
          subtotal: item.subtotal,
        })),
        totalAmount: totals.subtotal,
        discountAmount: totals.discount,
        finalAmount: totals.finalTotal,
      });

      const result = await createTransaction({
        ...values,
        items: items.map((item) => ({
          batchId: item.batchId,
          quantity: item.quantity,
          unitId: item.unitId,
          pricePerUnit: item.pricePerUnit,
          subtotal: item.subtotal,
        })),
        totalAmount: totals.subtotal,
        discountAmount: totals.discount,
        finalAmount: totals.finalTotal,
      });

      if (result.success) {
        toast({
          title: 'Transaction created',
          description: 'Transaction has been created successfully',
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create transaction',
          variant: 'destructive',
        });
        console.error('Transaction creation error details:', result);
      }
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // If viewing an existing transaction, render a different UI
  if (isEditing && initialData) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="items" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4 pt-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-2 px-4 text-left">Product</th>
                    <th className="py-2 px-4 text-center">Quantity</th>
                    <th className="py-2 px-4 text-right">Price</th>
                    <th className="py-2 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add null check here to prevent the error */}
                  {initialData.items && initialData.items.length > 0 ? (
                    initialData.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {item.batch?.product?.name || 'Unknown Product'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Batch: {item.batch?.batchCode || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.quantity} {item.unit?.symbol || ''}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatRupiah(item.pricePerUnit)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatRupiah(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No items found for this transaction
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(initialData.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>{formatRupiah(initialData.discountAmount || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatRupiah(initialData.finalAmount || 0)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Transaction ID
                    </label>
                    <p>{initialData.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Date & Time
                    </label>
                    <p>{formatDateTime(initialData.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Cashier
                    </label>
                    <p>{initialData.cashier?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Payment Method
                    </label>
                    <p className="capitalize">{initialData.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Information</h3>
                {initialData.member ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Member Name
                      </label>
                      <p>{initialData.member.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Email
                      </label>
                      <p>{initialData.member.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Phone
                      </label>
                      <p>{initialData.member.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Points Earned
                      </label>
                      <p>
                        {initialData.memberPoints &&
                        initialData.memberPoints.length > 0
                          ? initialData.memberPoints[0].pointsEarned
                          : 0}{' '}
                        points
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Guest customer (no member)
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print Receipt
          </Button>
        </div>
      </div>
    );
  }

  // Return the create transaction form UI
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Transaction items */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Transaction Items</h3>
            <Card>
              <CardHeader className="pb-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-auto space-x-1"
                  onClick={() => setIsProductDialogOpen(true)}
                >
                  <IconPlus size={16} />
                  <span>Add Product</span>
                </Button>
              </CardHeader>
              <CardContent>
                <TransactionItemList items={items} onItemsChange={setItems} />
              </CardContent>
            </Card>

            {/* Totals card */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>{formatRupiah(totals.discount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatRupiah(totals.finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Member search will be implemented"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden cashier ID field that will use the current user */}
            <input
              type="hidden"
              {...form.register('cashierId')}
              value={cashierId}
            />

            {/* Display current cashier info */}
            {user && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">
                  Cashier: {user.name || user.email || 'Current User'} (ID:{' '}
                  {cashierId})
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || items.length === 0 || !cashierId}
            >
              {loading ? 'Processing...' : 'Complete Transaction'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Product selection dialog */}
      <ProductSelectionDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
}
