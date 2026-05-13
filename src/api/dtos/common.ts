export interface ApiSortParam<T> {
  by: keyof T;
  direction: "asc" | "desc";
}

export interface ApiRequestParams<
  T extends object = Record<string, unknown>,
  TFilter = unknown,
> {
  page?: number;
  size?: number;
  filter?: TFilter;
  sort?: ApiSortParam<T>[];
}

export interface ApiPaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
