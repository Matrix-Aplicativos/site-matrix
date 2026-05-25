"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./ColetaTable.module.css";

export interface ColetaTableColumn<TRow> {
  key: keyof TRow;
  label: string;
  sortable?: boolean;
  render?: (row: TRow) => React.ReactNode;
}

interface ColetaTableProps<TRow> {
  columns: Array<ColetaTableColumn<TRow>>;
  rows: TRow[];
  onSort?: (key: keyof TRow) => void;
  tableClassName?: string;
  expandButtonClassName?: string;
  actionsHeaderLabel?: string;
  renderActions?: (row: TRow, index: number) => React.ReactNode;
  actionsCellClassName?: string;
  getRowId: (row: TRow, index: number) => string | number;
  expandedRowId?: string | number | null;
  onToggleExpandRow?: (id: string | number) => void;
  renderExpandedContent?: (row: TRow, index: number) => React.ReactNode;
  expandedRowClassName?: string;
  expandedColSpanOffset?: number;
  expandColumnIndex?: number;
  renderExpandButton?: (
    row: TRow,
    isExpanded: boolean
  ) => React.ReactNode;
  renderSortIcon?: () => React.ReactNode;
  className?: string;
}

export default function ColetaTable<TRow>({
  columns,
  rows,
  onSort,
  className,
  tableClassName,
  expandButtonClassName,
  actionsHeaderLabel = "Ações",
  renderActions,
  actionsCellClassName,
  getRowId,
  expandedRowId,
  onToggleExpandRow,
  renderExpandedContent,
  expandedRowClassName,
  expandedColSpanOffset = 0,
  expandColumnIndex = 0,
  renderExpandButton,
  renderSortIcon,
}: ColetaTableProps<TRow>) {
  const expandIndex = Math.max(
    0,
    Math.min(expandColumnIndex, columns.length)
  );
  const columnsBefore = columns.slice(0, expandIndex);
  const columnsAfter = columns.slice(expandIndex);
  const hasExpandColumn = !!onToggleExpandRow;
  const totalColSpan =
    columns.length + (hasExpandColumn ? 1 : 0) + (renderActions ? 1 : 0);
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomScrollRef = useRef<HTMLDivElement | null>(null);
  const syncWidthRef = useRef<HTMLDivElement | null>(null);
  const syncingFromRef = useRef<"top" | "bottom" | null>(null);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  useEffect(() => {
    const bottom = bottomScrollRef.current;
    const syncWidth = syncWidthRef.current;
    if (!bottom || !syncWidth) {
      return;
    }

    const updateScrollMetrics = () => {
      const scrollWidth = bottom.scrollWidth;
      const clientWidth = bottom.clientWidth;

      syncWidth.style.width = `${scrollWidth}px`;
      setHasHorizontalOverflow(scrollWidth > clientWidth + 1);
    };

    updateScrollMetrics();

    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    resizeObserver.observe(bottom);
    const tableEl = bottom.querySelector("table");
    if (tableEl) {
      resizeObserver.observe(tableEl);
    }
    window.addEventListener("resize", updateScrollMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollMetrics);
    };
  }, [columns, rows]);

  const handleTopScroll = () => {
    if (syncingFromRef.current === "bottom") {
      syncingFromRef.current = null;
      return;
    }

    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;
    if (!top || !bottom) {
      return;
    }

    syncingFromRef.current = "top";
    bottom.scrollLeft = top.scrollLeft;
  };

  const handleBottomScroll = () => {
    if (syncingFromRef.current === "top") {
      syncingFromRef.current = null;
      return;
    }

    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;
    if (!top || !bottom) {
      return;
    }

    syncingFromRef.current = "bottom";
    top.scrollLeft = bottom.scrollLeft;
  };

  return (
    <div className={className}>
      <div
        ref={topScrollRef}
        className={`${styles.topScrollbar} ${!hasHorizontalOverflow ? styles.hidden : ""}`}
        onScroll={handleTopScroll}
        aria-hidden={!hasHorizontalOverflow}
      >
        <div ref={syncWidthRef} className={styles.topScrollbarContent} />
      </div>

      <div ref={bottomScrollRef} className={styles.bottomScrollArea} onScroll={handleBottomScroll}>
        <table className={tableClassName}>
          <thead>
            <tr>
              {columnsBefore.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.sortable && renderSortIcon?.()}
                  </div>
                </th>
              ))}
              {hasExpandColumn && (
                <th style={{ width: "40px" }} aria-label="Expandir linha">
                  {actionsHeaderLabel}
                </th>
              )}
              {columnsAfter.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.sortable && renderSortIcon?.()}
                  </div>
                </th>
              ))}
              {renderActions && <th>{actionsHeaderLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowId = getRowId(row, index);
              const isExpanded = expandedRowId === rowId;

              return (
                <React.Fragment key={rowId}>
                  <tr>
                    {columnsBefore.map((col) => (
                      <td key={String(col.key)}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? "")}
                      </td>
                    ))}
                    {hasExpandColumn && (
                      <td className={actionsCellClassName}>
                        {renderExpandButton ? (
                          <button
                            type="button"
                            className={expandButtonClassName}
                            onClick={() => onToggleExpandRow!(rowId)}
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded ? "Ocultar detalhes" : "Ver detalhes"
                            }
                          >
                            {renderExpandButton(row, isExpanded)}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={expandButtonClassName}
                            onClick={() => onToggleExpandRow!(rowId)}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        )}
                      </td>
                    )}
                    {columnsAfter.map((col) => (
                      <td key={String(col.key)}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.key] ?? "")}
                      </td>
                    ))}
                    {renderActions && (
                      <td className={actionsCellClassName}>
                        {renderActions(row, index)}
                      </td>
                    )}
                  </tr>
                  {isExpanded && renderExpandedContent && (
                    <tr className={expandedRowClassName}>
                      <td
                        colSpan={
                          expandedColSpanOffset > 0
                            ? columns.length + expandedColSpanOffset
                            : totalColSpan
                        }
                      >
                        {renderExpandedContent(row, index)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
