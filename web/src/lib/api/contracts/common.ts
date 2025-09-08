export type PaginationDTO = {
  has_next: boolean;
  has_previous: boolean;
  page: number;
  per_page: number;
  total: number;
};

export type ListResponseDTO<T> = {
  data: T[];
  pagination: PaginationDTO;
};

export type ItemResponseDTO<T> = {
  data: T;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
};
