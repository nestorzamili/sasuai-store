'use client';

import { useState } from 'react';
import Image from 'next/image';
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
} from '@tabler/icons-react';
import {
  addProductImage,
  deleteProductImage,
  setPrimaryProductImage,
} from '@/app/(app)/products/images/action';
import { ImageUploadPortal } from '@/components/image-upload-portal';

export function ProductImagesSection() {
  const { isEditing, productId, primaryImageUrl, images, fetchProductImages } =
    useProductForm();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPrimarySetting, setIsPrimarySetting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Handle image upload success from Cloudinary widget
  const handleUploadSuccess = async (result: any) => {
    // Check if result contains expected data structure
    if (!result.info || result.event !== 'success' || !productId) return;
    try {
      setIsUploading(true);
      // Determine if this should be primary (if no images exist yet)
      const isPrimary = images.length === 0;
      const response = await addProductImage(
        productId,
        {
          event: result.event,
          info: {
            public_id: result.info.public_id,
            secure_url: result.info.secure_url,
            resource_type: result.info.resource_type || '',
            type: result.info.type || '',
            format: result.info.format || '',
            bytes: result.info.bytes || 0,
            width: result.info.width || 0,
            height: result.info.height || 0,
          },
        },
        isPrimary,
      );
      if (response.success) {
        toast({
          title: 'Image uploaded',
          description: 'Product image has been uploaded successfully',
        });
        // Refresh images
        if (fetchProductImages && productId) {
          fetchProductImages(productId);
        }
      } else {
        toast({
          title: 'Upload failed',
          description: response.error || 'Failed to save image information',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: 'Upload failed',
        description: 'An unexpected error occurred while saving the image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

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
      console.error('Error setting primary image:', error);
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
  };

  // Open lightbox for image preview
  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setLightboxOpen(true);
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
            <ScrollArea className="h-[180px] py-2">
              <div className="flex gap-2 pb-4">
                {images.map((image) => (
                  <Card
                    key={image.id}
                    className={`w-[140px] flex-shrink-0 ${
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
                          onClick={() => openLightbox(image.fullUrl)}
                        >
                          <IconMaximize className="h-4 w-4 mr-1" /> View
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-2">
                      <div className="flex justify-between items-center">
                        <Button
                          variant={image.isPrimary ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => handleSetPrimary(image.id)}
                          disabled={image.isPrimary || !!isPrimarySetting}
                          className={
                            image.isPrimary
                              ? 'cursor-not-allowed opacity-50 h-8'
                              : 'h-8'
                          }
                        >
                          {isPrimarySetting === image.id ? (
                            <span className="flex items-center gap-1 text-xs">
                              Setting... <IconStar className="h-3 w-3" />
                            </span>
                          ) : image.isPrimary ? (
                            <span className="flex items-center gap-1 text-xs">
                              Primary{' '}
                              <IconStarFilled className="h-3 w-3 text-yellow-400" />
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs">
                              Set Primary <IconStar className="h-3 w-3" />
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
            </ScrollArea>
          </div>
        </>
      )}

      {/* Upload button */}
      {isEditing && productId ? (
        <div className="relative z-[100]">
          <ImageUploadPortal
            onSuccess={handleUploadSuccess}
            isUploading={isUploading}
            disabled={false}
            folder="sasuai-store"
          />
        </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
