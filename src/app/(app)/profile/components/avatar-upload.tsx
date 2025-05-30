'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import {
  IconCamera,
  IconEdit,
  IconUser,
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
import { ImageUploadDialog } from '@/components/image-upload-dialog';

interface AvatarUploadProps {
  currentImage?: string | null;
  name?: string;
  onImageChange: (imageUrl: string) => void;
}

export function AvatarUpload({
  currentImage,
  name = '',
  onImageChange,
}: AvatarUploadProps) {
  const t = useTranslations('profile.avatarUpload');
  const [isUploading] = useState(false);
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

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImage('');
    onImageChange('');
    toast({
      title: t('profilePhotoRemoved'),
      description: t('profilePhotoRemovedMessage'),
    });
  }, [onImageChange, t]);

  const handleImageUploaded = useCallback(
    (imageUrl: string) => {
      setImage(imageUrl);
      onImageChange(imageUrl);
    },
    [onImageChange],
  );

  const openLightbox = useCallback(() => {
    if (image) {
      setLightboxOpen(true);
    }
  }, [image]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar
          className="h-42 w-42 border-4 border-background shadow-lg hover:shadow-xl transition-shadow"
          onClick={openLightbox}
        >
          {image ? (
            <AvatarImage
              src={image}
              alt={name}
              className="object-cover transition-opacity duration-200 hover:opacity-90 cursor-pointer"
            />
          ) : (
            <AvatarFallback className="text-4xl bg-muted/50">
              {name ? getInitials(name) : <IconUser size={48} />}
            </AvatarFallback>
          )}

          {/* Zoom indicator on hover */}
          {image && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
              <IconMaximize className="h-6 w-6 text-white" />
            </div>
          )}
        </Avatar>

        <div className="absolute -bottom-3 -right-3 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setUploadDialogOpen(true)}
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
            <TooltipContent side="bottom">
              {image ? t('changePhoto') : t('uploadPhoto')}
            </TooltipContent>
          </Tooltip>

          {image && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="h-9 w-9 rounded-full shadow hover:scale-105 transition-transform"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t('removePhoto')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Avatar Lightbox */}
      {lightboxOpen && image && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full h-full p-4 flex items-center justify-center"
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
                alt={name || t('profilePicture')}
                width={600}
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
        title={t('uploadTitle')}
        description={t('uploadDescription')}
        folder="sasuai-store/profiles"
        aspectRatio={1}
      />
    </div>
  );
}
