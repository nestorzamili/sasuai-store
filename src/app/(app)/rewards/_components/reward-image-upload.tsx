'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  IconUpload,
} from '@tabler/icons-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update image when currentImage prop changes
  useEffect(() => {
    if (currentImage !== undefined) {
      setImage(currentImage || '');
    }
  }, [currentImage]);

  // Create object URL for the selected file preview
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup function to revoke the object URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

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

  // Upload the selected file to the server
  const uploadSelectedFile = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'sasuai-store/rewards');

      // Send to our API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      // Update image state and call onChange callback
      setImage(result.url);
      onImageChange(result.url);

      setUploadDialogOpen(false);
      setSelectedFile(null);

      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description:
          error.message || 'An error occurred while uploading the image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB in size.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB in size.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a JPEG, PNG, or WebP image.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveImage = useCallback(() => {
    setImage('');
    onImageChange('');
    toast({
      title: 'Image removed',
      description: 'The reward image has been removed.',
    });
  }, [onImageChange]);

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

      {/* File Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Upload an image for your reward. Recommended aspect ratio is 16:9.
            </p>

            {/* File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
            />

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-md ${
                previewUrl ? 'border-primary' : 'border-muted'
              } p-4 transition-colors`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative w-full h-48">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <IconUpload className="h-10 w-10 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drag and drop an image, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Supports: JPG, PNG, WebP (max 5MB)
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <p className="text-sm">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadSelectedFile}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <IconLoader className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload Image'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
