export interface DiscountInterface {
  id?: string;
  name: string;
  discountType: 'member' | 'product';
  valueType: 'percentage' | 'flat';
  value: number;
  type?: string;
  minPurchase?: number;
  startDate: Date;
  endDate?: Date;
  isActive?: boolean;
  discountRelations: {
    discountId: string;
    relationId: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
