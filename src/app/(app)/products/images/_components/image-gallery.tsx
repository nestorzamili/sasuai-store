'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ProductImageWithUrl } from '@/lib/types/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  IconStar,
  IconStarFilled,
  IconTrash,
  IconPhoto,
  IconMaximize,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { deleteProductImage, setPrimaryProductImage } from '../action';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageLightbox } from './image-lightbox';

interface ImageGalleryProps {
  images: ProductImageWithUrl[];
  isLoading: boolean;
  onImageChange?: () => void;
  productId?: string;
}

const ITEMS_PER_PAGE = 8; // Number of images per page

export function ImageGallery({
  images,
  isLoading,
  onImageChange,
  productId,
}: ImageGalleryProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPrimarySetting, setIsPrimarySetting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] =
    useState<ProductImageWithUrl | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Calculate pagination
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, images.length);
  const currentImages = images.slice(startIndex, endIndex);

  // Reset to first page when images change
  if (images.length > 0 && currentPage > totalPages) {
    setCurrentPage(1);
  }

  // Handle opening the lightbox - calculate real index based on pagination
  const openLightbox = useCallback(
    (pageIndex: number) => {
      const realIndex = startIndex + pageIndex;
      setCurrentImageIndex(realIndex);
      setLightboxOpen(true);
    },
    [startIndex],
  );

  // Handle setting an image as primary
  const handleSetPrimary = useCallback(
    async (imageId: string) => {
      if (!productId) return;

      try {
        setIsPrimarySetting(imageId);
        const result = await setPrimaryProductImage(imageId, productId);

        if (result.success) {
          toast({
            title: 'Primary image updated',
            description: 'The primary image has been updated successfully',
          });
          onImageChange?.();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to update primary image',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error setting primary image:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsPrimarySetting(null);
      }
    },
    [productId, onImageChange],
  );

  // Open delete confirmation dialog
  const openDeleteDialog = useCallback((image: ProductImageWithUrl) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  }, []);

  // Handle image deletion
  const handleDelete = useCallback(async () => {
    if (!imageToDelete) return;

    try {
      setIsDeleting(imageToDelete.id);
      const result = await deleteProductImage(imageToDelete.id);

      if (result.success) {
        toast({
          title: 'Image deleted',
          description: 'The image has been deleted successfully',
        });
        onImageChange?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete image',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
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
  }, [imageToDelete, onImageChange]);

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Show loading state
  if (isLoading) {
    return <ImageGallerySkeleton />;
  }

  // Show empty state
  if (!productId) {
    return (
      <div className="flex flex-col items-center justify-center h-60 border rounded-lg p-4 text-center">
        <IconPhoto size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Select a product to manage its images
        </p>
      </div>
    );
  }

  // Show empty state when no images
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 border rounded-lg p-4 text-center">
        <IconPhoto size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No images found for this product
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Upload images using the upload button
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentImages.map((image, index) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative aspect-square group">
              <Image
                src={image.fullUrl}
                alt="Product image"
                fill
                className="object-cover cursor-pointer transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onClick={() => openLightbox(index)}
                priority={index < 4} // Only prioritize first 4 images
              />
              {image.isPrimary && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 px-2 py-1"
                >
                  <IconStarFilled className="h-3 w-3 mr-1" /> Primary
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/80 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(index);
                  }}
                >
                  <IconMaximize className="h-4 w-4 mr-1" /> View
                </Button>
              </div>
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between items-center">
                <Button
                  variant={image.isPrimary ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={() => handleSetPrimary(image.id)}
                  disabled={image.isPrimary || !!isPrimarySetting}
                  className={
                    image.isPrimary ? 'cursor-not-allowed opacity-50' : ''
                  }
                >
                  {isPrimarySetting === image.id ? (
                    <span className="flex items-center gap-1">
                      Setting... <IconStar className="h-4 w-4" />
                    </span>
                  ) : image.isPrimary ? (
                    <span className="flex items-center gap-1">
                      Primary{' '}
                      <IconStarFilled className="h-4 w-4 text-yellow-400" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Set Primary <IconStar className="h-4 w-4" />
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => openDeleteDialog(image)}
                  disabled={!!isDeleting}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            <IconChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <IconChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
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
      <ImageLightbox
        images={images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

// Skeleton component for loading state
function ImageGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3">
            <Skeleton className="h-8 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
