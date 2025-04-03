export interface QueryOptions {
  filter?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  page?: number;
  pageSize?: number;
}

export function buildQueryOptions(options: QueryOptions) {
  const { filter = {}, orderBy = {}, page = 1, pageSize = 10 } = options;
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return {
    where: filter,
    orderBy,
    skip,
    take,
  };
}
