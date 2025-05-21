import prisma from '@/lib/prisma';
import {
  User,
  UserPaginationParams,
  PaginationResult,
  UserRole,
} from '@/lib/types/user';

// Helper to ensure role is a valid UserRole
function ensureValidRole(role: string | undefined | null): UserRole {
  if (role === 'admin' || role === 'user') {
    return role;
  }
  return 'user'; // Default to 'user' if invalid or undefined
}

export class UserService {
  /**
   * Get paginated users with filters and sorting
   */
  static async getPaginated({
    page = 1,
    pageSize = 10,
    sortField = 'createdAt',
    sortDirection = 'desc',
    search = '',
    role,
    banned,
    startDate,
    endDate,
  }: UserPaginationParams): Promise<PaginationResult<User>> {
    // Build where clause based on filters
    const where: {
      OR?: Array<Record<string, unknown>>;
      role?: string;
      banned?: boolean;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add other filters
    if (role) where.role = role;
    if (banned !== undefined) where.banned = banned;

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get order by field
    const orderBy: Record<string, string> = {};
    orderBy[sortField] = sortDirection;

    // Execute query with count
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          createdAt: true,
          updatedAt: true,
          // Don't include sensitive fields like sessions or accounts
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    // Map database users to our User type
    const mappedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: ensureValidRole(user.role), // Ensure valid role
      banned: user.banned || false,
      banReason: user.banReason || undefined,
      banExpiresAt: user.banExpires?.toISOString() || null,
      data: {
        emailVerified: user.emailVerified,
        image: user.image || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }));

    return {
      data: mappedUsers,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  /**
   * Update a user by ID
   */
  static async updateUser(
    userId: string,
    data: { name: string; image?: string },
  ): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          image: data.image,
        },
        // Only select essential fields needed after update
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          role: true,
        },
      });

      return {
        id: user.id,
        name: user.name || '',
        image: user.image || undefined,
        email: user.email,
        role: ensureValidRole(user.role),
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }
}
