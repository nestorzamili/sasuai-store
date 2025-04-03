'use client';

import { useState, useEffect, MouseEvent } from 'react';
import Image from 'next/image';
import { IconX, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { ProductImageWithUrl } from '@/lib/types/product';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  images: ProductImageWithUrl[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  // Reset active index when current index changes
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  // Close on escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    window.addEventListener('keydown', handleArrowKeys);

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [isOpen, onClose, activeIndex, images.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToPrevious = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  // Handle background click to close the lightbox
  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    // Only close if the click is directly on the backdrop element
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackgroundClick}
    >
      <div className="relative w-full max-w-screen-xl p-4">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-6 top-4 z-50 rounded-full bg-background/50 hover:bg-background/80"
          onClick={onClose}
        >
          <IconX className="h-5 w-5" />
        </Button>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80"
              onClick={goToPrevious}
            >
              <IconArrowLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-background/50 hover:bg-background/80"
              onClick={goToNext}
            >
              <IconArrowRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Image container - preventing event bubbling */}
        <div
          className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {images[activeIndex] && (
            <div className="relative w-full h-full">
              <Image
                src={images[activeIndex].fullUrl}
                alt={`Product image ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          )}
        </div>

        {/* Image counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/50 px-3 py-1 rounded-full text-sm">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
