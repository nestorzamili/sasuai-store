'use client';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useState, useEffect } from 'react';
import { deleteDiscount } from '../actions';
interface props {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
  onRefresh?: () => void;
}
export function DeleteDialog({ isOpen, data, onClose, onRefresh }: props) {
  const [open, setIsOpen] = useState(isOpen);
  const [loading, setLoading] = useState(false);

  const handleDeleteDiscount = async () => {
    const id = data.id;
    try {
      setLoading(true);
      const response = await deleteDiscount(id);
      if (response.success) {
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  // Sync internal state with prop
  useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen]);

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={(newOpen) => {
          setIsOpen(newOpen);
          if (!newOpen) onClose();
        }}
        title="Delete Discount"
        desc={`Are you sure you want to delete ${
          data?.label || 'this'
        }? This action cannot be undone`}
        confirmText="Delete"
        cancelBtnText="Cancel"
        destructive={true}
        handleConfirm={handleDeleteDiscount}
        isLoading={loading}
      />
    </>
  );
}
