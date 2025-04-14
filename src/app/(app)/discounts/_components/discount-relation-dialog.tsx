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
import { DiscountRelationProduct } from './discount-product-relation';
import { DiscountRelationMember } from './discount-member-relation';
import { useEffect, useState } from 'react';
interface DiscountRelationDialogProps {
  type: 'member' | 'product';
  actionType?: 'add' | 'edit' | 'delete';
  initialValues: any;
  onStateSave?: (data: any[]) => void;
}

export const DiscountRelationDialog = ({
  type = 'product',
  actionType = 'add',
  initialValues,
  onStateSave,
}: DiscountRelationDialogProps) => {
  const [relationData, setRelationData] = useState(initialValues || []);
  const onSaveClick = () => {
    if (onStateSave) {
      onStateSave(relationData);
    }
  };
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
            <DiscountRelationProduct
              relationOnChange={(data) => setRelationData(data)}
              initialSelectedRows={type === 'product' ? initialValues : []}
            />
          ) : (
            <DiscountRelationMember
              relationOnChange={(data) => setRelationData(data)}
              initialSelectedRows={type === 'member' ? initialValues : []}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose>
            <Button variant={'default'} type="button" onClick={onSaveClick}>
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
