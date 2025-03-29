"use client";
import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconTrash, IconEdit } from "@tabler/icons-react";
import { formatRupiah } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductData, ProductType } from "../_data/product-data";
import { TableLayout } from "@/components/layout/table-layout";

const ProductStatus = ({ status }: { status: string }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  let statusText = "In Stock";
  switch (status) {
    case "in-stock":
      variant = "default";
      statusText = "In Stock";
      break;
    case "out-of-stock":
      variant = "destructive";
      statusText = "Out of Stock";
      break;
    default:
      variant = "secondary";
      statusText = "low-stock";
      break;
  }
  return <Badge variant={variant}>{statusText}</Badge>;
};

export const columns: ColumnDef<ProductType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => <div>{row.getValue("barcode")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => <div>{row.getValue("brand")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return (
        <div className="text-right font-medium">
          {formatRupiah(price, { withSymbol: false })}
        </div>
      );
    },
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-right">Cost</div>,
    cell: ({ row }) => {
      const cost = parseFloat(row.getValue("cost"));
      return (
        <div className="text-right">
          {formatRupiah(cost, { withSymbol: false })}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-right">Stock</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("stock")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <ProductStatus status={status} />;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;

      return (
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
            <DropdownMenuItem className="flex justify-between cursor-pointer">
              Edit <IconEdit />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between cursor-pointer">
              Delete <IconTrash />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ProductTable() {
  return <TableLayout data={ProductData} columns={columns} />;
}
