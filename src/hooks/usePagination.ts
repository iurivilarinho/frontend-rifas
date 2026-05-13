import { useEffect, useState } from "react";

interface UsePaginationParams {
  initialPage?: number;
  initialSize?: number;
  resetDeps?: unknown[];
}

export const usePagination = ({
  initialPage = 0,
  initialSize = 10,
  resetDeps = [],
}: UsePaginationParams = {}) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    setPage(initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const onPageChange = (next: number) => setPage(Math.max(0, next));
  const onSizeChange = (next: number) => {
    setSize(next);
    setPage(initialPage);
  };

  return { page, size, onPageChange, onSizeChange };
};
