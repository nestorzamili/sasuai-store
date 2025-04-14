import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconPlus, IconEdit } from '@tabler/icons-react';
import { DiscountRelationProduct } from './discount-product-relation';
import { DiscountRelationMember } from './discount-member-relation';

interface DiscountRelationDialogProps {
  type: 'member' | 'product';
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
      <DialogContent className="sm:max-w-[800px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className="capitalize">{type}</span>
          </DialogTitle>
          <DialogDescription>
            This is the relation table for the discount. You can add or remove
            relations here.
            <br />
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          {type === 'product' ? (
            <DiscountRelationProduct />
          ) : (
            <DiscountRelationMember />
          )}
        </div>
        <DialogFooter>
          <Button variant={'default'}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
