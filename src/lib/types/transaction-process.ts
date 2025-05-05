export type Cart = {
  productId: string;
  selectedDiscountId?: string | null;
  quantity: number;
}[];
