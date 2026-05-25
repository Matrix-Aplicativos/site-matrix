"use client";

import React from "react";
import SearchBar from "../SearchBar";

interface ColetaPageShellProps {
  title: string;
  titleClassName?: string;
  searchPlaceholder: string;
  onSearch: (value: string) => void;
  onFilterToggle: () => void;
  actions: React.ReactNode;
  filterPanel?: React.ReactNode;
  table: React.ReactNode;
  pagination: React.ReactNode;
  showSearch?: boolean;
}

export default function ColetaPageShell({
  title,
  titleClassName,
  searchPlaceholder,
  onSearch,
  onFilterToggle,
  actions,
  filterPanel,
  table,
  pagination,
  showSearch = true,
}: ColetaPageShellProps) {
  return (
    <>
      <h1 className={titleClassName}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "1.5rem", gap: "0.75rem" }}>
        {showSearch ? (
          <SearchBar
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            onFilterClick={onFilterToggle}
          />
        ) : (
          <div />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {actions}
        </div>
      </div>
      {filterPanel}
      {table}
      {pagination}
    </>
  );
}
