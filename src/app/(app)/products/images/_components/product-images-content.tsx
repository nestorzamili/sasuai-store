'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllProducts, getProductImages } from '../action';
import { ProductImageWithUrl, MinimalProduct } from '@/lib/types/product';
import { ImageGallery } from './image-gallery';
import { ImageUploadButton } from './image-upload-button';
import { ComboBox } from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductImagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProductId = useRef(searchParams.get('product'));
  const { toast } = useToast();

  // Menandai apakah komponen sudah di-mount untuk mencegah efek pada mount pertama
  const isMounted = useRef(false);

  // Referensi untuk mencegah update saat URL berubah secara programatik
  const isUrlBeingUpdated = useRef(false);

  // Separating loading states for different operations
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const [products, setProducts] = useState<MinimalProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MinimalProduct | null>(
    null,
  );
  const [images, setImages] = useState<ProductImageWithUrl[]>([]);

  // Memoize product options to prevent unnecessary re-renders
  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    [products],
  );

  // Fetch products dengan handling untuk initial URL parameter
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const response = await getAllProducts();
      if (response.success && response.data) {
        // Sort products alphabetically for easier finding
        const sortedProducts = [...response.data].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setProducts(sortedProducts);

        // Pilih produk dari URL hanya pada load awal
        const productIdToSelect = initialProductId.current;
        if (productIdToSelect) {
          const productFromUrl = sortedProducts.find(
            (p) => p.id === productIdToSelect,
          );
          if (productFromUrl) {
            setSelectedProduct(productFromUrl);
            // Langsung fetch images untuk produk yang dipilih
            fetchProductImages(productIdToSelect, true);
          } else {
            toast({
              title: 'Product not found',
              description: 'The requested product could not be found.',
              variant: 'destructive',
            });
          }
        }
      } else {
        toast({
          title: 'Failed to load products',
          description: response.error || 'Could not load product list',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading products.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProducts(false);
      // Tandai bahwa komponen sudah di-mount
      isMounted.current = true;
    }
  }, [toast]);

  // Fetch images dengan caching
  const imageCache = useRef<Record<string, ProductImageWithUrl[]>>({});

  const fetchProductImages = useCallback(
    async (productId: string, skipUrlUpdate = false) => {
      if (!productId) return;

      setIsLoadingImages(true);

      // Cek cache terlebih dahulu
      if (imageCache.current[productId]) {
        setImages(imageCache.current[productId]);
        setIsLoadingImages(false);

        // Update URL jika tidak di-skip
        if (!skipUrlUpdate && !isUrlBeingUpdated.current) {
          updateUrlWithProductId(productId);
        }
        return;
      }

      try {
        const response = await getProductImages(productId);
        if (response.success && response.data) {
          // Simpan ke cache
          imageCache.current[productId] = response.data;
          setImages(response.data);

          // Update URL jika tidak di-skip
          if (!skipUrlUpdate && !isUrlBeingUpdated.current) {
            updateUrlWithProductId(productId);
          }
        } else {
          setImages([]);
          if (response.error) {
            toast({
              title: 'Failed to load images',
              description: 'Failed to load product images.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        setImages([]);
        toast({
          title: 'Error',
          description: 'Failed to load product images.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingImages(false);
      }
    },
    [toast],
  );

  // Fungsi terpisah untuk memperbarui URL
  const updateUrlWithProductId = useCallback(
    (productId: string) => {
      isUrlBeingUpdated.current = true;

      const params = new URLSearchParams(searchParams.toString());
      params.set('product', productId);

      router.replace(`/products/images?${params.toString()}`, {
        scroll: false,
      });

      // Reset flag dengan sedikit penundaan
      setTimeout(() => {
        isUrlBeingUpdated.current = false;
      }, 50);
    },
    [router, searchParams],
  );

  // Initial fetch of products - hanya dilakukan sekali
  useEffect(() => {
    fetchProducts();
    // Tidak perlu dependency pada fetchProducts di sini karena kita hanya ingin jalankan sekali
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle product selection - tanpa efek samping URL
  const handleProductChange = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        // Fetch images dan update URL
        fetchProductImages(productId);
      } else {
        setSelectedProduct(null);
        setImages([]);
      }
    },
    [products, fetchProductImages],
  );

  // Handle image upload success dengan invalidasi cache
  const handleImageUploadSuccess = useCallback(() => {
    if (selectedProduct) {
      // Invalidasi cache untuk produk ini
      if (imageCache.current[selectedProduct.id]) {
        delete imageCache.current[selectedProduct.id];
      }
      // Skip URL update karena kita tidak mengubah produk
      fetchProductImages(selectedProduct.id, true);
    }
  }, [selectedProduct, fetchProductImages]);

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
            {isLoadingProducts ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <ComboBox
                options={productOptions}
                value={selectedProduct?.id || ''}
                onChange={handleProductChange}
                placeholder="Search products..."
                disabled={isLoadingProducts || products.length === 0}
                initialDisplayCount={15}
              />
            )}
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
              isLoading={isLoadingImages}
              onImageChange={handleImageUploadSuccess}
              productId={selectedProduct?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
