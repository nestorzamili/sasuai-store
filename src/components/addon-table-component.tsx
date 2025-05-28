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

// Define proper types for table column
interface TableColumn {
  toggleSorting: (ascending?: boolean) => void;
  getIsSorted: () => 'asc' | 'desc' | false;
}

export function SortingButtonTable({
  column,
  label,
}: {
  column: TableColumn;
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

interface ActionItem {
  title: string;
  icon: React.ReactNode;
  variant: 'ghost' | 'destructive';
  isDelete?: boolean;
  item: { name?: string };
  action: () => void;
}

interface ActionButtonTableProps {
  section: string;
  list: ActionItem[];
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
    'Are you sure you want to delete this item? This action cannot be undone.',
  );

  const handleConfirm = () => {
    setIsLoading(true);
    if (currentAction) {
      currentAction();
    }
    setTimeout(() => {
      setIsLoading(false);
      setIsDialogOpen(false);
    }, 1000);
  };

  return (
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
              {section.list.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  className={`flex justify-between cursor-pointer ${
                    item.variant === 'destructive' ? 'text-destructive' : ''
                  }`}
                  onClick={() => {
                    if (item.isDelete) {
                      setCurrentAction(() => item.action);
                      setDialogTitle(item.item.name || 'Delete Item');
                      setDialogDesc(
                        `Are you sure you want to ${item.title.toLowerCase()}? This action cannot be undone.`,
                      );
                      setIsDialogOpen(true);
                    } else {
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
      />
    </div>
  );
}
