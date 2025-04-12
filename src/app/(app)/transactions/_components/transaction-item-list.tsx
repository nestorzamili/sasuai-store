'use client';

import { Button } from '@/components/ui/button';
import { IconTrash, IconMinus, IconPlus } from '@tabler/icons-react';
import { formatRupiah } from '@/lib/currency';

// Define a proper type for transaction items
export interface TransactionItemData {
  batchId: string;
  productName: string;
  batchCode: string;
  quantity: number;
  unitId: string;
  unitSymbol: string;
  pricePerUnit: number;
  subtotal: number;
  availableQuantity?: number; // Maximum quantity that can be added
}

interface TransactionItemListProps {
  items: TransactionItemData[];
  onItemsChange: (items: TransactionItemData[]) => void;
}

export function TransactionItemList({
  items,
  onItemsChange,
}: TransactionItemListProps) {
  // Handle removing an item
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onItemsChange(newItems);
  };

  // Handle updating quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;

    const newItems = [...items];
    const item = newItems[index];

    // Check if the new quantity exceeds available quantity
    if (
      item.availableQuantity !== undefined &&
      quantity > item.availableQuantity
    ) {
      return; // Don't allow exceeding available quantity
    }

    newItems[index] = {
      ...item,
      quantity,
      subtotal: quantity * item.pricePerUnit,
    };
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="py-2 px-4 text-left">Product</th>
                <th className="py-2 px-4 text-center">Quantity</th>
                <th className="py-2 px-4 text-right">Price</th>
                <th className="py-2 px-4 text-right">Subtotal</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="py-3 px-4">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.batchCode}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <IconMinus size={14} />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        disabled={
                          item.availableQuantity !== undefined &&
                          item.quantity >= item.availableQuantity
                        }
                      >
                        <IconPlus size={14} />
                      </Button>
                    </div>
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      {item.unitSymbol}
                      {item.availableQuantity !== undefined && (
                        <span className="ml-1">
                          (Max: {item.availableQuantity})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatRupiah(item.pricePerUnit)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatRupiah(item.subtotal)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <IconTrash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
          <p className="text-muted-foreground">No items added yet</p>
          <p className="text-sm text-muted-foreground">
            Add products to this transaction
          </p>
        </div>
      )}
    </div>
  );
}
