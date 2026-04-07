"use client";

import { useCallback, useState } from "react";

export default function useTableUiState<TId extends string | number>() {
  const [expandedRowId, setExpandedRowId] = useState<TId | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const toggleExpandRow = useCallback((id: TId) => {
    setExpandedRowId((current) => (current === id ? null : id));
  }, []);

  const toggleFilterExpansion = useCallback(() => {
    setIsFilterExpanded((current) => !current);
  }, []);

  const closeExpanded = useCallback(() => setExpandedRowId(null), []);

  return {
    expandedRowId,
    isFilterExpanded,
    toggleExpandRow,
    toggleFilterExpansion,
    closeExpanded,
  };
}
