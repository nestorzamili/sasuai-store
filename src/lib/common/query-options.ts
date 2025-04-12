import { options } from '@/lib/types/table';

export function buildQueryOptions(options?: options) {
  const {
    limit = 10,
    page = 1,
    sortBy = {
      id: 'id',
      desc: false,
    },
    search,
  } = options || {};
  const skip = (page - 1) * limit;
  const take = limit;
  // Build orderBy object if sortBy is provided
  // const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;
  const orderBy = {
    [sortBy.id]: sortBy.desc ? 'desc' : 'asc',
  };
  // Build where clause if search is provided
  const where = [];

  return {
    // where,
    orderBy,
    skip,
    take,
  };
}
