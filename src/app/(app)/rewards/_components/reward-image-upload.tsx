'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  IconCamera,
  IconEdit,
  IconGift,
  IconTrash,
  IconLoader,
  IconMaximize,
  IconX,
} from '@tabler/icons-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploadDialog } from '@/components/image-upload-dialog';

interface RewardImageUploadProps {
  currentImage?: string | null;
  name?: string;
  onImageChange: (imageUrl: string) => void;
}

export function RewardImageUpload({
  currentImage,
  name = '',
  onImageChange,
}: RewardImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState(currentImage || '');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Update image when currentImage prop changes
  useEffect(() => {
    if (currentImage !== undefined) {
      setImage(currentImage || '');
    }
  }, [currentImage]);

  // Close lightbox with ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };

    if (lightboxOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const handleRemoveImage = () => {
    setImage('');
    onImageChange('');
    toast({
      title: 'Image removed',
      description: 'The reward image has been removed.',
    });
  };

  const handleImageUploaded = (imageUrl: string) => {
    setIsUploading(true);

    // Update state and trigger the callback
    setImage(imageUrl);
    onImageChange(imageUrl);

    setIsUploading(false);

    toast({
      title: 'Image uploaded',
      description: 'Your image has been uploaded successfully.',
    });
  };

  const openLightbox = (e: React.MouseEvent) => {
    if (image) {
      e.preventDefault();
      e.stopPropagation();
      setLightboxOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative group">
        <Card
          className={`relative overflow-hidden ${
            image ? 'cursor-pointer' : ''
          } border-dashed hover:border-muted-foreground/50 transition-colors`}
          onClick={image ? openLightbox : () => setUploadDialogOpen(true)}
        >
          <CardContent className="flex items-center justify-center p-0">
            {image ? (
              <div className="w-full aspect-video relative">
                <Image
                  src={image}
                  alt={name || 'Reward image'}
                  fill
                  className="object-cover transition-opacity duration-200 hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Zoom indicator on hover */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <IconMaximize className="h-6 w-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-muted-foreground">
                <IconGift className="h-12 w-12 mb-2" />
                <p className="text-sm text-center">
                  Upload an image for this reward
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="absolute bottom-3 right-3 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadDialogOpen(true);
                }}
                disabled={isUploading}
                className="h-9 w-9 rounded-full shadow hover:scale-105 transition-transform"
              >
                {isUploading ? (
                  <IconLoader className="h-4 w-4 animate-spin" />
                ) : image ? (
                  <IconEdit className="h-4 w-4" />
                ) : (
                  <IconCamera className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {image ? 'Change image' : 'Upload image'}
            </TooltipContent>
          </Tooltip>

          {image && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="h-9 w-9 rounded-full shadow hover:scale-105 transition-transform"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Remove image</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2">
          <IconLoader className="h-3 w-3 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Uploading...</p>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxOpen && image && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full h-full p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 rounded-full bg-background/50 hover:bg-background/80"
              onClick={() => setLightboxOpen(false)}
            >
              <IconX className="h-5 w-5" />
            </Button>

            <div className="relative max-h-[80vh] max-w-full rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={name || 'Reward image'}
                width={800}
                height={600}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onImageUploaded={handleImageUploaded}
        title="Upload Reward Image"
        description="Upload an image for your reward. Recommended aspect ratio is 16:9."
        folder="sasuai-store/rewards"
        aspectRatio={16 / 9}
      />
    </div>
  );
}
