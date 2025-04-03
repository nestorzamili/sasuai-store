'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllProducts, getProductImages } from '../action';
import { Product } from '@prisma/client';
import { ProductImageWithUrl } from '@/lib/types/product';
import { ImageGallery } from './image-gallery';
import { ImageUploadButton } from './image-upload-button';
import { ComboBox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';

export default function ProductImagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get('product');

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImageWithUrl[]>([]);

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getAllProducts();
      if (response.success && response.data) {
        setProducts(response.data);

        // If product ID was provided in URL, find and select that product
        if (productIdFromUrl) {
          const productFromUrl = response.data.find(
            (p) => p.id === productIdFromUrl,
          );
          if (productFromUrl) {
            setSelectedProduct(productFromUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch images for selected product
  const fetchProductImages = async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await getProductImages(productId);
      if (response.success && response.data) {
        setImages(response.data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of products - only run once
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch images when a product is selected - prevent unnecessary refetches
  useEffect(() => {
    if (selectedProduct && selectedProduct.id) {
      fetchProductImages(selectedProduct.id);

      // Update URL with the selected product ID
      const newParams = new URLSearchParams(searchParams);
      newParams.set('product', selectedProduct.id);
      router.replace(`/products/images?${newParams.toString()}`);
    } else {
      setImages([]);

      // Remove product param from URL if no product is selected
      if (productIdFromUrl) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('product');
        router.replace('/products/images');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.id]);

  // Handle product selection
  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
  };

  // Handle image upload success
  const handleImageUploadSuccess = () => {
    if (selectedProduct) {
      fetchProductImages(selectedProduct.id);
    }
  };

  // Format products for combobox
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Product Images</h2>
        <p className="text-muted-foreground">
          Manage images for your products. Select a product to view and manage
          its images.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Select Product</h3>
            <ComboBox
              options={productOptions}
              value={selectedProduct?.id || ''}
              onChange={handleProductChange}
              placeholder="Select a product..."
              disabled={isLoading || products.length === 0}
            />
          </div>

          {selectedProduct && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload Image</h3>
              <ImageUploadButton
                productId={selectedProduct.id}
                onSuccess={handleImageUploadSuccess}
              />
              <p className="text-sm text-muted-foreground">
                Upload images for this product. The first image will be set as
                the primary image.
              </p>
            </div>
          )}
        </div>

        <div>
          <Separator className="md:hidden mb-6" />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {selectedProduct
                ? `Images for ${selectedProduct.name}`
                : 'Select a product to view images'}
            </h3>

            <ImageGallery
              images={images}
              isLoading={isLoading}
              onImageChange={handleImageUploadSuccess}
              productId={selectedProduct?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
