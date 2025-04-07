import { useState } from "react";

export type PaginationState = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export const usePagination = (initialItemsPerPage: number = 50) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialItemsPerPage);

  return {
    page,
    limit,
    setPage,
    setLimit,
    paginationParams: `page=${page}&limit=${limit}`,
  };
};
