import { useEffect, useMemo, useState } from "react";

// Client-side pagination helper for lists that are fetched in full from the
// API (no server-side page/limit support). Slices `items` into pages of
// `pageSize` and automatically clamps the current page when the underlying
// list shrinks (e.g. after filtering, searching or sorting).
const usePagination = (items = [], pageSize = 10) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (items || []).slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return { page, setPage, totalPages, paginatedItems };
};

export default usePagination;
