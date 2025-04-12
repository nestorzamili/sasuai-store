'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { IconUpload, IconLoader } from '@tabler/icons-react';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageUploaded: (imageUrl: string) => void;
  title: string;
  description: string;
  folder: string;
  aspectRatio?: number;
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onImageUploaded,
  title,
  description,
  folder,
  aspectRatio = 1,
}: ImageUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Upload the selected file to the server
  const uploadSelectedFile = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', folder);

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

      if (result.success) {
        onImageUploaded(result.url);
        onOpenChange(false);
        setSelectedFile(null);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">{description}</p>

          {/* Hidden File Input */}
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
              <div
                className="relative w-full"
                style={{ aspectRatio: aspectRatio }}
              >
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}
