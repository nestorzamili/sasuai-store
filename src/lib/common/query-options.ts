import { options } from '@/lib/types/table';

export function buildQueryOptions(options?: options) {
  const {
    limit = 10,
    page = 1,
    sortBy = { id: 'id', desc: false },
    columnFilter = ['id'],
    search = '',
  } = options ?? {};

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Sorting
  const orderBy = { [sortBy.id]: sortBy.desc ? 'desc' : 'asc' };

  // Search filtering
  const where = search
    ? {
        OR: columnFilter.map((id) => ({
          [id]: {
            contains: search,
            mode: 'insensitive',
          },
        })),
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
