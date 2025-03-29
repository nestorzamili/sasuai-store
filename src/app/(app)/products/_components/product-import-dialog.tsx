import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconFileImport } from "@tabler/icons-react";

export default function ProductImportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="space-x-1">
          <span>Import</span> <IconFileImport size={18} />
        </Button>
      </DialogTrigger>
      {/* Dialog content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Csv File</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import products into your inventory. The
            file should include product name, price, description and stock
            information.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
