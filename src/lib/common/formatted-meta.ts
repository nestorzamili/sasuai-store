import { options } from '@/lib/types/table';

export function formattedMeta(option: options) {
  const { limit, page, sortBy, sortOrder, search } = option;

  // Format options into a standardized metadata object
  return {
    pagination: {
      pageSize: limit, // Convert limit to pageSize
      pageIndex: page - 1, // Convert 1-based page to 0-based pageIndex
      total: 0, // Default total, should be filled by the caller
    },
    sort: sortBy
      ? {
          field: sortBy,
          direction: sortOrder || 'asc',
        }
      : undefined,
    filter: search
      ? {
          search: search,
        }
      : undefined,
  };
}

// Function to convert from formatted meta back to options
export function metaToOptions(meta: any): options {
  const { pagination, sort, filter } = meta || {};

  return {
    limit: pagination?.pageSize || 10,
    page: (pagination?.pageIndex || 0) + 1, // Convert 0-based pageIndex to 1-based page
    sortBy: sort?.field,
    sortOrder: sort?.direction,
    search: filter?.search,
  };
}
