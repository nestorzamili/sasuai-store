import { Button } from '@/components/ui/button';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { ConfirmDialog } from './confirm-dialog';

export function SortingButtonTable({
  column,
  label,
}: {
  column: any;
  label: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      column.toggleSorting(column.getIsSorted() === 'asc');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex text-left align-middle"
    >
      {label}
      {isLoading ? (
        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </button>
  );
}
interface ActionButtonTableProps {
  section: string;
  list: {
    title: string;
    icon: React.ReactNode;
    variant: 'ghost' | 'destructive';
    isDelete?: boolean;
    item: string[];
    action: () => void;
  }[];
}
export function ActionButtonTable({
  data,
}: {
  data: ActionButtonTableProps[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<(() => void) | null>(null);
  const [dialogTitle, setDialogTitle] = useState('Delete Item');
  const [dialogDesc, setDialogDesc] = useState(
    'Are you sure you want to delete this item? This action cannot be undone.'
  );

  const handleConfirm = () => {
    setIsLoading(true);
    if (currentAction) {
      // Execute the stored action function
      currentAction();
    }
    setTimeout(() => {
      setIsLoading(false);
      setIsDialogOpen(false);
    }, 1000);
  };

  return (
    // Actions column
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {data.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <DropdownMenuLabel>{section.section}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {section.list.map((item: any, index: number) => (
                <DropdownMenuItem
                  key={index}
                  className={`flex justify-between cursor-pointer ${
                    item.variant == 'destructive' ? 'text-destructive' : ''
                  }`}
                  onClick={() => {
                    if (item.isDelete) {
                      // Store the action function and open dialog
                      setCurrentAction(() => item.action);
                      setDialogTitle(item.item.name || 'Delete Item');
                      setDialogDesc(
                        `Are you sure you want to ${item.title.toLowerCase()}? This action cannot be undone.`
                      );
                      setIsDialogOpen(true);
                    } else {
                      // Normal action execution
                      item.action();
                    }
                  }}
                >
                  {item.title} {item.icon}
                </DropdownMenuItem>
              ))}
              {sectionIndex < data.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={dialogTitle}
        desc={dialogDesc}
        handleConfirm={handleConfirm}
        cancelBtnText="Cancel"
        confirmText="Delete"
        isLoading={isLoading}
        disabled={false}
        className=""
      >
        asd
      </ConfirmDialog>
    </div>
  );
}
export function DeleteDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const disabled = false; // Replace with your actual condition

  const handleDelete = () => {
    setIsLoading(true);
    // Perform delete action here
    setTimeout(() => {
      setIsLoading(false);
      setIsDialogOpen(false);
    }, 1000);
  };
  const handleCancel = () => {};
  const handleOpen = () => {
    setIsDialogOpen(true);
  };
  const handleClose = () => {};

  return (
    <ConfirmDialog
      open={isDialogOpen}
      onOpenChange={() => {}}
      title="Delete Brand"
      desc="Are you sure you want to delete this brand? This action cannot be undone."
      handleConfirm={() => {}}
      cancelBtnText="Cancel"
      confirmText="Delete"
      isLoading={isLoading}
      disabled={disabled}
      className=""
    >
      TEST
    </ConfirmDialog>
  );
}
