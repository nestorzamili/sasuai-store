export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum DiscountApplyTo {
  ALL = 'ALL',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS',
  SPECIFIC_MEMBERS = 'SPECIFIC_MEMBERS',
  SPECIFIC_MEMBER_TIERS = 'SPECIFIC_MEMBER_TIERS',
}

export interface DiscountData {
  id?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  type: DiscountType;
  value: number;
  minPurchase?: number | null;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  isGlobal?: boolean;
  maxUses?: number | null;
  applyTo?: DiscountApplyTo;
  productIds?: string[];
  memberIds?: string[];
  memberTierIds?: string[];
}

export type DiscountPaginationParams = {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  type?: DiscountType;
  applyTo?: DiscountApplyTo;
  isGlobal?: boolean;
  validAsOf?: Date;
};

export interface DiscountCreateResult {
  success: boolean;
  message: string;
  discount?: any;
}

export interface DiscountUpdateResult {
  success: boolean;
  message: string;
  discount?: any;
}

export interface DiscountValidationResult {
  success: boolean;
  message: string;
  isValid?: boolean;
  discount?: any;
  error?: string;
}
