import { options } from '@/lib/types/table';

export function buildQueryOptions(options?: options) {
  const {
    limit = 10,
    page = 1,
    sortBy = {
      id: 'id',
      desc: false,
    },
    columnFilter = ['id'],
    search,
  } = options || {};
  const skip = (page - 1) * limit;
  const take = limit;

  const orderBy = {
    [sortBy.id]: sortBy.desc ? 'desc' : 'asc',
  };
  // Build where clause if search is provided
  let where = undefined;
  if (search && search !== '') {
    where = columnFilter.map((id) => {
      return {
        [id]: {
          contains: search,
          mode: 'insensitive',
        },
      };
    });
  }

  return {
    ...(where && { where: { OR: where } }),
    orderBy,
    skip,
    take,
  };
}
