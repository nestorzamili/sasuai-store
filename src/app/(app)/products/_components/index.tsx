'use client';

import { Button } from '@/components/ui/button';
import { ProductWithRelations } from '@/lib/types/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconPlus } from '@tabler/icons-react';
import { ProductFormProvider } from './product-form-provider';
import { ProductFormContent } from './product-form-content';
import { useTranslations } from 'next-intl';

interface ProductFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductWithRelations;
  onSuccess?: () => void;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: ProductFormDialogProps) {
  const t = useTranslations('product.formDialog');
  const isEditing = Boolean(initialData?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>{t('addProduct')}</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <ProductFormProvider
          initialData={initialData}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        >
          <ProductFormContent />
        </ProductFormProvider>
      </DialogContent>
    </Dialog>
  );
}
