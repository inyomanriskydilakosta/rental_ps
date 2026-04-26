'use client';

import { useState, useEffect, useMemo } from 'react';

interface UsePaginationOptions {
  /** Number of rows shown on desktop (≥768px). Default: 10 */
  desktopPageSize?: number;
  /** Number of rows shown on mobile (<768px). Default: 5 */
  mobilePageSize?: number;
  /** Breakpoint px for mobile detection. Default: 768 */
  breakpoint?: number;
}

export interface PaginationResult<T> {
  paginated: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  startIndex: number;
  isMobile: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): PaginationResult<T> {
  const {
    desktopPageSize = 10,
    mobilePageSize = 5,
    breakpoint = 768,
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [page, setPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(desktopPageSize);

  // Detect mobile on mount and listen for resize
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const applyMatch = (matches: boolean) => {
      setIsMobile(matches);
      setPageSizeRaw(matches ? mobilePageSize : desktopPageSize);
      setPageRaw(1);
    };

    applyMatch(mq.matches);

    const handler = (e: MediaQueryListEvent) => applyMatch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [desktopPageSize, mobilePageSize, breakpoint]);

  // Reset to page 1 whenever the dataset length changes (search / filter)
  useEffect(() => {
    setPageRaw(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // Clamp current page if data shrinks
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const setPage = (p: number) => {
    setPageRaw(Math.max(1, Math.min(p, totalPages)));
  };

  const setPageSize = (size: number) => {
    setPageSizeRaw(size);
    setPageRaw(1);
  };

  return {
    paginated,
    page: safePage,
    pageSize,
    totalPages,
    total: data.length,
    startIndex: (safePage - 1) * pageSize,
    isMobile,
    setPage,
    setPageSize,
  };
}
