// Basic user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned?: boolean;
  banReason?: string;
  banExpiresAt?: string | null;
  image?: string;
  data?: UserData;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// User data properties
export interface UserData {
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  image?: string;
  [key: string]: unknown;
}

// API user interface (returned from impersonation)
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

export type UserRole = 'admin' | 'user';

// Define only the fields actually used in the dialog component
export interface UserSession {
  id: string;
  userId: string;
  expiresAt: string;
  sessionToken: string;
  lastActiveAt: string;
  createdAt: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  current?: boolean;
}

// Pagination parameters for user queries
export interface UserPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  role?: string;
  banned?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role?: string;
  data?: UserData;
}

export interface UserUpdateData {
  name?: string;
  username?: string | null;
}

export interface UserRoleData {
  userId: string;
  role: string;
}

export interface UserBanData {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
}

export interface UserIdData {
  userId: string;
}

export interface SessionData {
  sessionToken: string;
}

export interface PermissionData {
  [resource: string]: string[];
}

export interface ImpersonateResult {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: ApiUser;
}

// Define filter states type with specific values
export interface UserFilters {
  role?: string;
  status?: string;
}

// Define sorting state type for individual sort option
export interface UserSortingState {
  id: string;
  desc: boolean;
}

// Define sorting state type for the array of sort options
export type UserSortingOptions = UserSortingState[];

// Define more specific filter value types
export type UserRoleFilter = 'ALL_ROLES' | 'admin' | 'user' | string;
export type UserStatusFilter = 'ALL' | 'active' | 'banned';
