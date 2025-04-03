'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/currency';
import { getProduct } from '../../action';
import { LoadingSpinner } from '@/components/loading-spinner';
import {
  IconArrowLeft,
  IconEdit,
  IconPhoto,
  IconPackage,
  IconCalendar,
  IconBarcode,
} from '@tabler/icons-react';
import Image from 'next/image';
import { ErrorBoundary } from '@/components/error-boundary';

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const result = await getProduct(productId);
        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          setError(result.error || 'Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  return (
    <>
      <Header fixed>
        <Search placeholder="Search..." />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <ErrorBoundary
          fallback={<p>Something went wrong. Please try again.</p>}
        >
          <div className="space-y-6">
            {/* Navigation and actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center"
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/products/images?product=${productId}`)
                  }
                >
                  <IconPhoto className="h-4 w-4 mr-2" />
                  Manage Images
                </Button>
                <Button
                  onClick={() => router.push(`/products/${productId}/edit`)}
                >
                  <IconEdit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-[50vh]">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-destructive">
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : product ? (
              <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                {/* Left column - Image and basic details */}
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <div className="relative h-[300px]">
                        <Image
                          src={product.images[0].fullUrl}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-[300px] bg-muted flex items-center justify-center">
                        <IconPhoto
                          size={64}
                          className="text-muted-foreground opacity-20"
                        />
                      </div>
                    )}
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Category</dt>
                          <dd className="font-medium">
                            {product.category?.name || 'None'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Brand</dt>
                          <dd className="font-medium">
                            {product.brand?.name || 'None'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Status</dt>
                          <dd>
                            {product.isActive ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200"
                              >
                                Inactive
                              </Badge>
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Variants</dt>
                          <dd className="font-medium">
                            {product.variants?.length || 0}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                {/* Right column - Product info and variants */}
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div>
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <p className="text-muted-foreground mt-2">
                          {product.description || 'No description available.'}
                        </p>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Variants</h3>
                        <div className="space-y-4">
                          {product.variants.map((variant: any) => (
                            <Card key={variant.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium flex items-center">
                                      <IconPackage className="h-4 w-4 mr-2 text-muted-foreground" />
                                      {variant.name}
                                      {variant.skuCode && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                          <IconBarcode className="h-3 w-3 inline mr-1" />
                                          {variant.skuCode}
                                        </span>
                                      )}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Unit: {variant.unit?.name || 'Unknown'}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">
                                      {formatRupiah(variant.price)}
                                    </div>
                                    <div className="text-sm">
                                      <span
                                        className={
                                          variant.currentStock > 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }
                                      >
                                        Stock: {variant.currentStock}{' '}
                                        {variant.unit?.symbol || ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {variant.batches &&
                                  variant.batches.length > 0 && (
                                    <>
                                      <Separator className="my-3" />
                                      <div className="text-sm mt-2">
                                        <h5 className="font-medium text-muted-foreground">
                                          Batches:
                                        </h5>
                                        <ul className="mt-1 space-y-1">
                                          {variant.batches.map((batch: any) => (
                                            <li
                                              key={batch.id}
                                              className="flex justify-between"
                                            >
                                              <span className="flex items-center">
                                                <IconCalendar className="h-3 w-3 mr-1" />
                                                Exp:{' '}
                                                {new Date(
                                                  batch.expiryDate,
                                                ).toLocaleDateString()}
                                              </span>
                                              <span>
                                                {batch.remainingQuantity} left
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </>
                                  )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Image gallery preview */}
                  {product.images && product.images.length > 1 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Images</CardTitle>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() =>
                              router.push(
                                `/products/images?product=${productId}`,
                              )
                            }
                          >
                            View all
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-2">
                          {product.images
                            .slice(0, 4)
                            .map((image: any, index: number) => (
                              <div
                                key={image.id}
                                className="relative aspect-square rounded-md overflow-hidden border"
                              >
                                <Image
                                  src={image.fullUrl}
                                  alt={`Product image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                {image.isPrimary && (
                                  <Badge className="absolute top-1 left-1 bg-primary">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                            ))}
                          {product.images.length > 4 && (
                            <div className="relative aspect-square flex items-center justify-center border rounded-md bg-muted">
                              <span className="text-muted-foreground">
                                +{product.images.length - 4} more
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </ErrorBoundary>
      </Main>
    </>
  );
}
