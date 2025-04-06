'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProductForm } from './product-form-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  IconPhoto,
  IconTrash,
  IconStarFilled,
  IconStar,
  IconMaximize,
  IconX,
  IconUpload,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react';
import {
  deleteProductImage,
  setPrimaryProductImage,
} from '@/app/(app)/products/images/action';

export function ProductImagesSection() {
  const { isEditing, productId, primaryImageUrl, images, fetchProductImages } =
    useProductForm();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPrimarySetting, setIsPrimarySetting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const router = useRouter();

  // Handle setting an image as primary
  const handleSetPrimary = async (imageId: string) => {
    if (!productId) return;
    try {
      setIsPrimarySetting(imageId);
      const result = await setPrimaryProductImage(imageId, productId);
      if (result.success) {
        toast({
          title: 'Primary image updated',
          description: 'The primary image has been updated successfully',
        });
        // Refresh images
        if (fetchProductImages) {
          fetchProductImages(productId);
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update primary image',
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
      setIsPrimarySetting(null);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (image: any) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  // Handle image deletion
  const handleDelete = async () => {
    if (!imageToDelete) return;
    try {
      setIsDeleting(imageToDelete.id);
      const result = await deleteProductImage(imageToDelete.id);
      if (result.success) {
        toast({
          title: 'Image deleted',
          description: 'The image has been deleted successfully',
        });
        // Refresh images
        if (productId && fetchProductImages) {
          fetchProductImages(productId);
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete image',
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
      setIsDeleting(null);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // Open lightbox for image preview
  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    // Find the index of the image in the array
    const index = images.findIndex((img) => img.fullUrl === imageUrl);
    setCurrentImageIndex(index !== -1 ? index : 0);
    setLightboxOpen(true);
  };

  // Navigate to the next image in lightbox
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;

    const nextIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    setCurrentImage(images[nextIndex].fullUrl);
  };

  // Navigate to the previous image in lightbox
  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;

    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(prevIndex);
    setCurrentImage(images[prevIndex].fullUrl);
  };

  // Handle keyboard navigation in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      goToNextImage(e as unknown as React.MouseEvent);
    } else if (e.key === 'ArrowLeft') {
      goToPrevImage(e as unknown as React.MouseEvent);
    } else if (e.key === 'Escape') {
      setLightboxOpen(false);
    }
  };

  // Handle redirect to image upload page
  const handleNavigateToImageUpload = () => {
    if (productId) {
      router.push(`/products/images?product=${productId}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="images">Product Images</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Upload images for this product. The first image will be set as
          primary.
        </p>
      </div>

      {/* Main image preview */}
      <div className="bg-muted rounded-md overflow-hidden relative">
        {primaryImageUrl ? (
          <div className="aspect-square relative group">
            <Image
              src={primaryImageUrl}
              alt="Primary product image"
              fill
              className="object-cover cursor-pointer"
              onClick={() => openLightbox(primaryImageUrl)}
            />
            <Badge variant="secondary" className="absolute top-2 left-2">
              <IconStarFilled className="h-3 w-3 mr-1 text-yellow-500" />
              Primary
            </Badge>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                className="bg-background/80 hover:bg-background"
                onClick={() => openLightbox(primaryImageUrl)}
              >
                <IconMaximize className="h-4 w-4 mr-1" /> View
              </Button>
            </div>
          </div>
        ) : (
          <div className="aspect-square flex flex-col items-center justify-center bg-muted">
            <IconPhoto size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No primary image</p>
          </div>
        )}
      </div>

      {/* Image thumbnails */}
      {images.length > 0 && (
        <>
          <Separator />
          <div>
            <Label>All Images</Label>
            <ScrollArea className="h-[140px] py-2">
              <div className="flex gap-2 pb-2">
                {images.map((image) => (
                  <Card
                    key={image.id}
                    className={`w-[110px] flex-shrink-0 ${
                      image.isPrimary ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="relative aspect-square group">
                      <Image
                        src={image.fullUrl}
                        alt="Product image"
                        fill
                        className="object-cover rounded-t-md"
                        onClick={() => openLightbox(image.fullUrl)}
                      />
                      {image.isPrimary && (
                        <Badge
                          variant="secondary"
                          className="absolute top-1 left-1 px-1 py-0.5 text-[10px]"
                        >
                          <IconStarFilled className="h-2 w-2 mr-0.5" /> Primary
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="bg-background/80 hover:bg-background h-7 w-7"
                          onClick={() => openLightbox(image.fullUrl)}
                        >
                          <IconMaximize className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-1">
                      <div className="flex justify-between items-center gap-1">
                        <Button
                          variant={image.isPrimary ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => handleSetPrimary(image.id)}
                          disabled={image.isPrimary || !!isPrimarySetting}
                          className={
                            image.isPrimary
                              ? 'cursor-not-allowed opacity-50 h-7 px-1'
                              : 'h-7 px-1'
                          }
                        >
                          {isPrimarySetting === image.id ? (
                            <span className="flex items-center text-[10px]">
                              <IconStar className="h-2 w-2" />
                            </span>
                          ) : image.isPrimary ? (
                            <span className="flex items-center text-[10px]">
                              <IconStarFilled className="h-2 w-2 text-yellow-400" />
                            </span>
                          ) : (
                            <span className="flex items-center text-[10px]">
                              <IconStar className="h-2 w-2" />
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteDialog(image)}
                          disabled={!!isDeleting}
                        >
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Upload button */}
      {isEditing && productId ? (
        <Button
          onClick={handleNavigateToImageUpload}
          className="w-full"
          variant="outline"
        >
          <IconUpload className="h-4 w-4 mr-2" />
          Manage Images
        </Button>
      ) : (
        <div className="text-sm text-muted-foreground">
          Save the product first to enable image uploads
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Image"
        desc="Are you sure you want to delete this image? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        handleConfirm={handleDelete}
        disabled={!!isDeleting}
        destructive
      />

      {/* Image lightbox */}
      {lightboxOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div
            className="relative w-full max-w-screen-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-6 top-4 z-50 rounded-full bg-background/50 hover:bg-background/80"
              onClick={() => setLightboxOpen(false)}
            >
              <IconX className="h-5 w-5" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80"
                  onClick={goToPrevImage}
                  aria-label="Previous image"
                >
                  <IconArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80"
                  onClick={goToNextImage}
                  aria-label="Next image"
                >
                  <IconArrowRight className="h-5 w-5" />
                </Button>
              </>
            )}

            <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
              <Image
                src={currentImage}
                alt="Product image"
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {images.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/50 px-3 py-1 rounded-md backdrop-blur-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
