import { Button } from '@/components/ui/button';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { IconEdit, IconTrash } from '@tabler/icons-react';

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
export function ActionButtonTable() {
  return (
    // Actions column
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex justify-between cursor-pointer"
            // onClick={() => onEdit?.(brand)}
          >
            Edit <IconEdit className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
            // onClick={() => handleDeleteClick(brand)}
          >
            Delete <IconTrash className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
