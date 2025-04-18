import { Button } from '@/components/ui/button';
import { IconX } from '@tabler/icons-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  altText?: string;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  altText = 'Image preview',
}: ImagePreviewDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full bg-background/50 hover:bg-background/80"
            onClick={() => onOpenChange(false)}
          >
            <IconX className="h-4 w-4" />
          </Button>
          <div className="relative w-full aspect-video">
            <Image
              src={imageUrl}
              alt={altText}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
