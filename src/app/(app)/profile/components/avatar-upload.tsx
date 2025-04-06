'use client';

import { useState, useCallback, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import {
  IconUpload,
  IconCamera,
  IconEdit,
  IconUser,
  IconTrash,
} from '@tabler/icons-react';
import { getImageUrl } from '@/utils/image';

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
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState(currentImage || '');

  useEffect(() => {
    if (currentImage !== undefined) {
      setImage(currentImage || '');
    }
  }, [currentImage]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const handleUploadSuccess = useCallback(
    async (result: any) => {
      if (!result.info || result.event !== 'success') return;

      try {
        setIsUploading(true);

        const publicId = result.info.public_id;
        const imageUrl = getImageUrl(publicId);

        setImage(imageUrl);
        onImageChange(imageUrl);

        toast({
          title: 'Profile photo uploaded',
          description:
            'Your profile photo has been uploaded successfully. Please click Update Profile to save changes.',
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description:
            'An unexpected error occurred while updating your profile photo',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onImageChange],
  );

  // Handle removing the profile photo
  const handleRemoveImage = useCallback(() => {
    setImage('');
    onImageChange('');
    toast({
      title: 'Profile photo removed',
      description:
        'Your profile photo has been removed. Click Update Profile to save changes.',
    });
  }, [onImageChange]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-md">
          {image ? (
            <AvatarImage src={image} alt={name} />
          ) : (
            <AvatarFallback className="text-3xl">
              {name ? getInitials(name) : <IconUser size={32} />}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="absolute -bottom-2 -right-2">
          <CldUploadWidget
            onSuccess={handleUploadSuccess}
            signatureEndpoint="/api/cloudinary-signature"
            options={{
              maxFiles: 1,
              resourceType: 'image',
              clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
              maxFileSize: 5000000, // 5MB
              multiple: false,
              folder: 'sasuai-store/profiles',
              cropping: true,
              croppingAspectRatio: 1,
              croppingShowDimensions: true,
              croppingCoordinatesMode: 'custom',
            }}
          >
            {({ open }) => (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => open()}
                  disabled={isUploading}
                  className="h-9 w-9 rounded-full shadow-md"
                >
                  {isUploading ? (
                    <IconUpload className="h-4 w-4 animate-bounce" />
                  ) : image ? (
                    <IconEdit className="h-4 w-4" />
                  ) : (
                    <IconCamera className="h-4 w-4" />
                  )}
                </Button>

                {image && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="h-9 w-9 rounded-full shadow-md"
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>
      </div>

      {isUploading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Uploading...
        </p>
      )}
    </div>
  );
}
