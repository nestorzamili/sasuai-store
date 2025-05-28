import type {
  DiscountType as PrismaDiscountType,
  DiscountApplyTo as PrismaDiscountApplyTo,
} from '@prisma/client';

// Enums for form usage (matching Prisma schema)
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

// Base discount data interface for forms
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

// Enhanced interfaces with relationships using Prisma types
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

// Extended interface for detail view with validation
export interface DiscountDetailWithValidation extends DiscountWithRelations {
  isValid: boolean;
}

// Interface for table display with counts and usage info
export interface DiscountWithCounts
  extends Omit<DiscountWithRelations, 'products' | 'members' | 'memberTiers'> {
  _count: {
    products: number;
    members: number;
    memberTiers: number;
    transactions: number;
    transactionItems: number;
  };
  isValid: boolean;
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

// Types for table columns and entity selection
export interface Entity {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Column<T extends Entity> {
  header: string;
  accessor: string | ((item: T) => React.ReactNode);
  className?: string;
}

export interface SelectedItemsTableProps<T extends Entity> {
  items: T[];
  columns: Column<T>[];
  onRemove: (id: string) => void;
  emptyMessage?: string;
}

// Status information interface
export interface StatusInfo {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

// Query and filter interfaces
export interface DiscountWhereClause {
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    code?: { contains: string; mode: 'insensitive' };
    description?: { contains: string; mode: 'insensitive' };
  }>;
  isActive?: boolean;
  type?: PrismaDiscountType;
  applyTo?: PrismaDiscountApplyTo;
  isGlobal?: boolean;
  startDate?: { lte: Date };
  endDate?: { gte: Date };
}

export interface DiscountOrderBy {
  [key: string]: 'asc' | 'desc';
}

// Pagination parameters
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

// API Response interfaces
export interface DiscountCreateResult {
  success: boolean;
  message: string;
  discount?: DiscountWithRelations;
}

export interface DiscountUpdateResult {
  success: boolean;
  message: string;
  discount?: DiscountWithRelations;
}

export interface DiscountValidationResult {
  success: boolean;
  message: string;
  isValid?: boolean;
  discount?: DiscountWithRelations;
  error?: string;
}

export interface DiscountPaginationResult {
  success: boolean;
  discounts?: DiscountWithCounts[];
  pagination?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message?: string;
}

// Selection interfaces for forms
export interface MemberTierForSelection extends Entity {
  minPoints: number;
  multiplier: number;
}

export interface MemberForSelection extends Entity {
  tier?: {
    name: string;
  } | null;
  cardId?: string;
}

// Member selector specific interfaces
export interface MemberSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// Tier selector specific interfaces
export interface TierSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// Product selection interface for discount forms
export interface ProductForSelection extends Entity {
  barcode?: string | null;
  category?: {
    name: string;
  } | null;
  brand?: {
    name: string;
  } | null;
}

// Entity selector interfaces
export interface EntitySelectorProps<T extends Entity> {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  fetchItems: (search: string) => Promise<{ success: boolean; data?: T[] }>;
  fetchItemById?: (id: string) => Promise<{ success: boolean; data?: T[] }>;
  renderItemDetails?: (item: T) => React.ReactNode;
  placeholder?: string;
  noSelectionText?: string;
  columns?: Column<T>[];
}

// Product selector specific interfaces
export interface ProductSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

// Dialog component interfaces
export interface DiscountDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discountId: string;
}

export interface DiscountDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: DiscountWithCounts;
  onSuccess?: () => void;
}

export interface DiscountTableProps {
  onRefresh?: () => void;
}

// Fetch options and results for table
export interface DiscountFetchOptions {
  page?: number;
  limit?: number;
  sortBy?: { id: string; desc: boolean };
  search?: string;
  filters?: {
    isActive?: boolean;
    type?: DiscountType;
    applyTo?: DiscountApplyTo;
    isGlobal?: boolean;
  };
}

export interface DiscountFetchResult {
  data: DiscountWithCounts[];
  totalRows: number;
}

// Type utilities for extracting related entity types
export type ProductForDiscount = NonNullable<
  DiscountWithRelations['products']
>[0];
export type MemberForDiscount = NonNullable<
  DiscountWithRelations['members']
>[0];
export type MemberTierForDiscount = NonNullable<
  DiscountWithRelations['memberTiers']
>[0];
