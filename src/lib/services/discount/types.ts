import type {
  DiscountType as PrismaDiscountType,
  DiscountApplyTo as PrismaDiscountApplyTo,
} from '@prisma/client';
import type { DateRange } from 'react-day-picker';

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

export interface DiscountWithRelations {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  type: PrismaDiscountType;
  value: number;
  minPurchase: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isGlobal: boolean;
  maxUses: number | null;
  usedCount: number;
  applyTo: PrismaDiscountApplyTo | null;
  createdAt: Date;
  updatedAt: Date;
  products?: Array<{
    id: string;
    name: string;
    barcode: string | null;
    category: { name: string } | null;
    brand: { name: string } | null;
  }>;
  members?: Array<{
    id: string;
    name: string;
    tier: { name: string } | null;
  }>;
  memberTiers?: Array<{
    id: string;
    name: string;
    minPoints: number;
    multiplier: number;
  }>;
}

export interface DiscountWithCounts
  extends Omit<DiscountWithRelations, 'products' | 'members' | 'memberTiers'> {
  _count: {
    products: number;
    members: number;
    memberTiers: number;
    transactions: number;
    transactionItems: number;
  };
  usage: {
    usedCount: number;
    maxUses: number | null;
    usagePercentage: number | null;
  };
  relationCounts: {
    products: number;
    members: number;
    memberTiers: number;
    transactions: number;
    transactionItems: number;
  };
}

export interface DiscountValidationParams {
  code: string;
  totalAmount: number;
}

export interface DiscountCodeValidationResult {
  success: boolean;
  message?: string;
  data?: DiscountWithRelations & {
    calculatedDiscount?: number;
    finalAmount?: number;
  };
}

export interface DiscountPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  type?: DiscountType;
  applyTo?: DiscountApplyTo;
  isGlobal?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface DiscountWhereClause {
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    code?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
  }>;
  AND?: Array<{
    startDate?: { lte: Date };
    endDate?: { gte: Date };
  }>;
  isActive?: boolean;
  type?: DiscountType;
  applyTo?: DiscountApplyTo;
  isGlobal?: boolean;
  startDate?: { lte: Date };
  endDate?: { gte: Date };
}

export interface DiscountOrderBy {
  [key: string]: 'asc' | 'desc';
}

export interface MemberTierForSelection {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
}

export interface MemberForSelection {
  id: string;
  name: string;
  tier: { name: string } | null;
  cardId: string | null;
  phone: string | null;
}

export interface ValidationResult<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface DiscountListData {
  discounts: DiscountWithCounts[];
  pagination: PaginationMeta;
}

export interface DiscountTableProps {
  data: DiscountWithCounts[];
  isLoading: boolean;
  pagination: { pageIndex: number; pageSize: number };
  totalRows: number;
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  onSortingChange: (sorting: Array<{ id: string; desc: boolean }>) => void;
  onSearchChange: (search: string) => void;
  onView: (discount: DiscountWithCounts) => void;
  onEdit: (discount: DiscountWithCounts) => void;
  onDelete: (discount: DiscountWithCounts) => void;
  onToggleStatus: (discount: DiscountWithCounts) => void;
  filterToolbar?: React.ReactNode;
}

export interface DiscountFilterToolbarProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  type: DiscountType | 'ALL_TYPES';
  setType: (type: DiscountType | 'ALL_TYPES') => void;
  applyTo: DiscountApplyTo | 'ALL_APPLICATIONS';
  setApplyTo: (applyTo: DiscountApplyTo | 'ALL_APPLICATIONS') => void;
  status: 'ALL_STATUSES' | 'ACTIVE' | 'INACTIVE';
  setStatus: (status: 'ALL_STATUSES' | 'ACTIVE' | 'INACTIVE') => void;
}
