export class PaginationUtil {
  normalize = (page, limit) => ({
    page: Math.max(Number(page) || 1, 1),
    limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
  });
}
export const paginationUtil = new PaginationUtil();
