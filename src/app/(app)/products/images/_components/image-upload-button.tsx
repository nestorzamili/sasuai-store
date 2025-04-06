'use client';

import { useState, useCallback } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import { addProductImage } from '../action';

interface ImageUploadButtonProps {
  productId: string;
  onSuccess?: () => void;
}

export function ImageUploadButton({
  productId,
  onSuccess,
}: ImageUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSuccess = useCallback(
    async (result: any) => {
      // Check if result contains expected data structure
      if (!result.info || result.event !== 'success') return;

      try {
        setIsUploading(true);

        // Always make uploaded images primary for simplicity
        const isPrimary = true;

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
          onSuccess?.();
        } else {
          toast({
            title: 'Upload failed',
            description: response.error || 'Failed to save image information',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'An unexpected error occurred while saving the image',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [productId, onSuccess],
  );

  return (
    <div>
      <CldUploadWidget
        onSuccess={handleUploadSuccess}
        signatureEndpoint="/api/cloudinary-signature"
        options={{
          maxFiles: 1,
          resourceType: 'image',
          clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
          maxFileSize: 10000000, // 10MB
          multiple: false,
          folder: 'sasuai-store',
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => open()}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                Uploading... <IconUpload className="h-4 w-4 animate-bounce" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Upload Image <IconPhoto className="h-4 w-4" />
              </span>
            )}
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
}
