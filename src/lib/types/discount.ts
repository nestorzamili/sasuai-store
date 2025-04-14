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
  discountProducts?: {
    discountId: string;
    productId: string;
  }[];
  // Ubah definisi ini juga
  discountMembers?: {
    discountId: string;
    memberId: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface DiscountRelationInterface {
  relationId: string;
  discountId: string;
}
export interface DiscountRelationGetDataInterface {
  id: string;
  name: string;
  category: string;
}
