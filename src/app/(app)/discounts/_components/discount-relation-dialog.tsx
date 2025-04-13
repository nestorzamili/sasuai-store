import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconPlus, IconEdit } from '@tabler/icons-react';
import { ProductTable } from '../../products/_components/product-table';
import { useEffect } from 'react';
import { DiscountProductRelation } from './discount-product-relation';

interface DiscountRelationDialogProps {
  type?: 'member' | 'product';
  actionType?: 'add' | 'edit' | 'delete';
}

export const DiscountRelationDialog = ({
  type = 'product',
  actionType = 'add',
}: DiscountRelationDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        <Button variant="outline">
          {actionType === 'add' ? 'Add' : 'Edit'} Relation
          {actionType === 'add' ? <IconPlus /> : <IconEdit />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen">
        <DialogHeader>
          <DialogTitle>
            Discount Relation -{' '}
            <span className="uppercase font-bold">{type}</span>
          </DialogTitle>
          <DialogDescription>
            This is the relation table for the discount. You can add or remove
            relations here.
            <br />
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <DiscountProductRelation />
        </div>
      </DialogContent>
    </Dialog>
  );
};
