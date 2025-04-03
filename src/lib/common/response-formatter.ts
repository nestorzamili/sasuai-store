interface ResponseFormatter<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export function responseFormatter<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ResponseFormatter<T> {
  const currentPage = Math.floor(page / limit) + 1;
  return {
    data,
    meta: {
      total,
      page: currentPage,
      limit,
      totalPages: Math.ceil(total / (limit || 1)),
    },
  };
}
