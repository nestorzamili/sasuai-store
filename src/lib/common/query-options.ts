import { options } from '@/lib/types/table';

export function buildQueryOptions(options?: options) {
  const {
    limit = 10,
    page = 1,
    sortBy = { id: 'id', desc: true },
    columnFilter = ['id'],
    search = '',
  } = options ?? {};

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Sorting
  const orderBy = { [sortBy.id]: sortBy.desc ? 'desc' : 'asc' };

  // Search filtering with support for relations
  const where = search
    ? {
        OR: columnFilter.map((column) => {
          // Check if it's a relation field (contains dots)
          if (column.includes('.')) {
            const parts = column.split('.');
            const relation = parts[0];
            const field = parts[1];

            return {
              [relation]: {
                [field]: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            };
          }

          // Regular field (no relation)
          return {
            [column]: {
              contains: search,
              mode: 'insensitive',
            },
          };
        }),
      }
    : undefined;
  // Return query options
  return {
    ...(where && { where }),
    orderBy,
    skip,
    take,
  };
}
