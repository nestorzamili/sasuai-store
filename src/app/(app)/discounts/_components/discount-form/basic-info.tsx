import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { DiscountType } from '@prisma/client';
import { generateDiscountCode } from '@/lib/common/discount-utils';
import { UseFormReturn } from 'react-hook-form';
import { DiscountFormValues } from '../../schema';

interface BasicInfoProps {
  form: UseFormReturn<DiscountFormValues>;
}

export default function BasicInfo({ form }: BasicInfoProps) {
  const discountType = form.watch('type');

  // Function to generate and set discount code
  const generateAndSetCode = () => {
    const name = form.getValues('name');
    if (name) {
      const generatedCode = generateDiscountCode(name);
      form.setValue('code', generatedCode);
    } else {
      toast({
        title: 'Cannot Generate Code',
        description: 'Please enter a discount name first',
        variant: 'default',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Basic Information</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter discount name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this discount
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Discount Code</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAndSetCode}
                  className="h-7 text-xs"
                >
                  Generate
                </Button>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter discount code or generate"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </div>
              </FormControl>
              <FormDescription>A unique code for this discount</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter discount description"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DiscountType.PERCENTAGE}>
                      Percentage
                    </SelectItem>
                    <SelectItem value={DiscountType.FIXED_AMOUNT}>
                      Fixed Amount
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How the discount value should be applied
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder={
                        discountType === DiscountType.PERCENTAGE ? '0-100' : '0'
                      }
                      {...field}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {discountType === DiscountType.PERCENTAGE ? '%' : '$'}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  {discountType === DiscountType.PERCENTAGE
                    ? 'Percentage amount (0-100)'
                    : 'Fixed amount in currency'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
