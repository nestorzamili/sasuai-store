import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  [key: string]: any;
}

interface Column {
  header: string;
  accessor: string | ((item: any) => React.ReactNode);
  className?: string;
}

interface SelectedItemsTableProps<T extends Entity> {
  items: T[];
  columns: Column[];
  onRemove: (id: string) => void;
  emptyMessage?: string;
}

export default function SelectedItemsTable<T extends Entity>({
  items,
  columns,
  onRemove,
  emptyMessage = 'No items selected',
}: SelectedItemsTableProps<T>) {
  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm border rounded-md">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="max-h-[457px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column, index) => (
                  <TableCell key={index} className={column.className}>
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : item[column.accessor]}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
