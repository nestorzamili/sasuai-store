'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '../action';
import { ProductWithRelations } from '@/lib/types/product';
import ProductPrimaryButton from './product-primary-button';
import { ProductTable } from './product-table';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllProducts();
      if (success) {
        // Cast the data to the correct type
        const productData = (data as ProductWithRelations[]) || [];
        setProducts(productData);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle dialog open state change
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    // Reset selectedProduct when dialog is closed
    if (!open) {
      setSelectedProduct(null);
    }
  };

  // Handle edit product
  const handleEdit = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  // Handle product operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  // Filter products by status
  const activeProducts = products.filter((product) => product.isActive);
  const inactiveProducts = products.filter((product) => !product.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Products</h2>
          <p className="text-muted-foreground">
            View and manage your product inventory
          </p>
        </div>
        <ProductPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedProduct || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeProducts.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({inactiveProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ProductTable
            data={products}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={fetchProducts}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <ProductTable
            data={activeProducts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={fetchProducts}
          />
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <ProductTable
            data={inactiveProducts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={fetchProducts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
