export interface Pagination {
  has_next: boolean;
  has_prev: boolean;
  page: number;
  per_page: number;
  total: number;
}
