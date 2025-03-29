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
import { IconPlus } from "@tabler/icons-react";
import { ProductForm } from "./product-form";
export default function ProductCreateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>Create</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      {/* Dialog content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>Product description</DialogDescription>
        </DialogHeader>
        <ProductForm onSubmit={() => {}} />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
