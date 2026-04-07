"use client";

import React from "react";

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
  renderSortIcon,
}: ColetaTableProps<TRow>) {
  return (
    <div className={className}>
      <table className={tableClassName}>
        <thead>
          <tr>
            {onToggleExpandRow && <th style={{ width: "40px" }}></th>}
            {columns.map((col) => (
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
                  {onToggleExpandRow && (
                    <td>
                      <button
                        className={expandButtonClassName}
                        onClick={() => onToggleExpandRow(rowId)}
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                  {renderActions && (
                    <td className={actionsCellClassName}>{renderActions(row, index)}</td>
                  )}
                </tr>
                {isExpanded && renderExpandedContent && (
                  <tr className={expandedRowClassName}>
                    <td colSpan={columns.length + expandedColSpanOffset}>
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
  );
}
