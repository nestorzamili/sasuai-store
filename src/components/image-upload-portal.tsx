'use client';

import { Button } from '@/components/ui/button';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import { CldUploadWidget } from 'next-cloudinary';
import { useEffect } from 'react';

interface ImageUploadPortalProps {
  onSuccess: (result: any) => void;
  isUploading?: boolean;
  disabled?: boolean;
  folder?: string;
}

export function ImageUploadPortal({
  onSuccess,
  isUploading = false,
  disabled = false,
  folder = 'sasuai-store',
}: ImageUploadPortalProps) {
  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Restore scroll behavior when component unmounts
      document.body.style.overflow = '';

      // Clean up any widget-related DOM elements that might remain
      const widgetContainer = document.querySelector(
        '.cloudinary-widget-container',
      );
      if (widgetContainer) {
        widgetContainer.remove();
      }
    };
  }, []);

  // Custom success handler to ensure proper cleanup
  const handleSuccess = (result: any) => {
    // Restore scroll behavior after upload completes
    document.body.style.overflow = '';

    // Call the original onSuccess callback
    onSuccess(result);
  };

  // Custom open handler for the widget
  const handleOpenWidget = (open: () => void) => {
    // Create a container for the widget outside the modal context
    const widgetPortal = document.createElement('div');
    widgetPortal.className = 'cloudinary-widget-container';
    widgetPortal.style.position = 'fixed';
    widgetPortal.style.zIndex = '9999999';
    widgetPortal.style.inset = '0';
    document.body.appendChild(widgetPortal);

    // Lock scrolling for modal
    document.body.style.overflow = 'hidden';

    // Open the widget
    open();
  };

  return (
    <div className="relative">
      <CldUploadWidget
        onSuccess={handleSuccess}
        onClose={() => {
          // Restore scroll behavior when widget closes
          document.body.style.overflow = '';

          // Clean up the portal container
          const widgetContainer = document.querySelector(
            '.cloudinary-widget-container',
          );
          if (widgetContainer) {
            widgetContainer.remove();
          }
        }}
        signatureEndpoint="/api/cloudinary-signature"
        options={{
          maxFiles: 1,
          resourceType: 'image',
          clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
          maxFileSize: 10000000, // 10MB
          multiple: false,
          folder: folder,
          // Enhanced widget styling and behavior
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1',
            },
            fonts: {
              default: null,
              "'Poppins', sans-serif": {
                url: 'https://fonts.googleapis.com/css?family=Poppins',
                active: true,
              },
            },
          },
          prepareUploadParams: (params: any) => {
            return { ...params, folder };
          },
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOpenWidget(open)}
            disabled={isUploading || disabled}
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
