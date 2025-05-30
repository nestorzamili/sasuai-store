'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useProductForm } from './product-form-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ImageUploadDialog } from '@/components/image-upload-dialog';
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
  addProductImage,
  deleteProductImage,
  setPrimaryImage,
} from '../action';
import { ProductImageWithUrl, TempProductImage } from '@/lib/types/product';

// Union type for both temp and real images
type DisplayImage = ProductImageWithUrl | TempProductImage;

export function ProductImagesSection() {
  const t = useTranslations('product.imagesSection');

  const {
    isEditing,
    productId,
    images,
    fetchProductImages,
    tempImages,
    addTempImage: addTempImageToContext,
    removeTempImage,
    setTempPrimaryImage,
  } = useProductForm();

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPrimarySetting, setIsPrimarySetting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<DisplayImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();

  // Helper function to check if URL is valid
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (error) {
      console.error('Invalid URL:', url, error);
      return false;
    }
  };

  // We'll treat both types of images consistently with a unified interface - simplified
  const displayImages = isEditing ? images : tempImages;

  // Find primary image - simplified
  const primaryImage =
    displayImages.find((img) => img.isPrimary) || displayImages[0];
  const primaryImageUrl = primaryImage?.fullUrl || null;

  // Handle setting image as primary
  const handleSetPrimary = async (imageId: string) => {
    if (isEditing && productId) {
      try {
        setIsPrimarySetting(imageId);
        const result = await setPrimaryImage(imageId, productId);
        if (result.success) {
          toast({ title: t('toast.primaryImageUpdated') });
          if (fetchProductImages) fetchProductImages(productId);
        } else {
          toast({
            title: 'Error',
            description: result.error || t('toast.failedToUpdatePrimary'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error setting primary image:', error);
        toast({
          title: 'Error',
          description: t('toast.unexpectedError'),
          variant: 'destructive',
        });
      } finally {
        setIsPrimarySetting(null);
      }
    } else {
      setTempPrimaryImage(imageId);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (image: DisplayImage) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  // Handle image deletion
  const handleDelete = async () => {
    if (!imageToDelete) return;

    if (isEditing && productId) {
      try {
        setIsDeleting(imageToDelete.id);
        const result = await deleteProductImage(imageToDelete.id, productId);
        if (result.success) {
          toast({ title: t('toast.imageDeleted') });
          fetchProductImages?.(productId);
        } else {
          toast({
            title: 'Error',
            description: result.error || t('toast.failedToDelete'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast({
          title: 'Error',
          description: t('toast.unexpectedError'),
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(null);
        setDeleteDialogOpen(false);
        setImageToDelete(null);
      }
    } else {
      // For temp images, just remove from state
      removeTempImage(imageToDelete.id);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // Handle image upload completion
  const handleImageUploaded = async (imageUrl: string) => {
    setIsUploading(true);

    try {
      if (isEditing && productId) {
        // For existing product, save to server
        const isPrimary = images.length === 0;
        const result = await addProductImage({
          productId,
          imageUrl,
          isPrimary,
        });

        if (result.success) {
          toast({ title: t('toast.imageUploaded') });
          fetchProductImages?.(productId);
        } else {
          toast({
            title: t('toast.uploadFailed'),
            description: result.error || t('toast.failedToAddImage'),
            variant: 'destructive',
          });
        }
      } else {
        // For new product, add to temp storage
        addTempImageToContext(imageUrl);
        toast({ title: t('toast.imageUploaded') });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: t('toast.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadDialogOpen(false);
    }
  };

  // Lightbox functions
  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    const index = displayImages.findIndex((img) => img.fullUrl === imageUrl);
    setCurrentImageIndex(index !== -1 ? index : 0);
    setLightboxOpen(true);
  };

  // Lightbox navigation - simplified
  const navigateLightbox = (direction: 1 | -1, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (displayImages.length <= 1) return;

    const newIndex =
      (currentImageIndex + direction + displayImages.length) %
      displayImages.length;
    setCurrentImageIndex(newIndex);
    setCurrentImage(displayImages[newIndex].fullUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') navigateLightbox(1);
    else if (e.key === 'ArrowLeft') navigateLightbox(-1);
    else if (e.key === 'Escape') setLightboxOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Label htmlFor="images">{t('title')}</Label>
        <p className="text-sm text-muted-foreground mb-2">{t('description')}</p>
      </div>

      {/* Primary Image Display */}
      <div className="bg-muted rounded-md overflow-hidden relative">
        {primaryImageUrl && isValidImageUrl(primaryImageUrl) ? (
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
              {t('primary')}
            </Badge>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                className="bg-background/80 hover:bg-background"
                onClick={() => openLightbox(primaryImageUrl)}
              >
                <IconMaximize className="h-4 w-4 mr-1" /> {t('view')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="aspect-square flex flex-col items-center justify-center bg-muted">
            <IconPhoto size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('noPrimaryImage')}
            </p>
          </div>
        )}
      </div>

      {/* Image Thumbnails */}
      {displayImages.length > 0 && (
        <>
          <Separator />
          <div>
            <Label>{t('allImages')}</Label>
            <ScrollArea className="h-[140px] py-2">
              <div className="flex gap-2 pb-2">
                {displayImages.map(
                  (image) =>
                    isValidImageUrl(image.fullUrl) && (
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
                              <IconStarFilled className="h-2 w-2 mr-0.5" />{' '}
                              {t('primary')}
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
                    ),
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Upload Button */}
      <Button
        onClick={() => setUploadDialogOpen(true)}
        className="w-full"
        variant="outline"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <IconUpload className="h-4 w-4 mr-2 animate-spin" />
            {t('uploading')}
          </>
        ) : (
          <>
            <IconUpload className="h-4 w-4 mr-2" />
            {t('uploadImage')}
          </>
        )}
      </Button>

      {/* Upload Dialog */}
      <ImageUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onImageUploaded={handleImageUploaded}
        title={t('uploadDialogTitle')}
        description={t('uploadDialogDesc')}
        folder={`sasuai-store/products/${productId || 'temp'}`}
        aspectRatio={1}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('deleteImageTitle')}
        desc={t('deleteImageDesc')}
        confirmText={isDeleting ? t('deleting') : t('delete')}
        handleConfirm={handleDelete}
        disabled={!!isDeleting}
        destructive
      />

      {/* Lightbox */}
      {lightboxOpen && currentImage && isValidImageUrl(currentImage) && (
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

            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80"
                  onClick={(e) => navigateLightbox(-1, e)}
                  aria-label={t('previousImage')}
                >
                  <IconArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80"
                  onClick={(e) => navigateLightbox(1, e)}
                  aria-label={t('nextImage')}
                >
                  <IconArrowRight className="h-5 w-5" />
                </Button>
              </>
            )}

            <div className="relative w-full h-[80vh]">
              <Image
                src={currentImage}
                alt="Product image"
                fill
                className="object-contain"
              />
            </div>

            {displayImages.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/50 px-3 py-1 rounded-md backdrop-blur-sm">
                {currentImageIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
