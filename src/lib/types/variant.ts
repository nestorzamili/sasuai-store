export interface VariantWhereInput {
  some?: {
    unitId?: string;
  };
}

export interface ProductVariantCreateInput {
  name: string;
  unitId: string;
  price: number | string;
  currentStock: number;
  skuCode?: string | null;
  product?: { connect: { id: string } };
}

export interface ProductVariantUpdateInput {
  name?: string;
  unitId?: string;
  price?: number | string;
  currentStock?: number | { increment: number } | { decrement: number };
  skuCode?: string | null;
}
