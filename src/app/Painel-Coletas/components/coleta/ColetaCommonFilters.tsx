"use client";

import React from "react";
import type { ColetaFilters } from "../../hooks/core/useTable";

interface OptionMap {
  [label: string]: string;
}

interface ColetaCommonFiltersProps {
  styles: Record<string, string>;
  filters: ColetaFilters;
  statusOptions: OptionMap;
  origemOptions: OptionMap;
  onStatusChange: (value: string) => void;
  onOrigemChange: (value: string) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tipoMovimentoOptions?: OptionMap;
  tipoMovimentoValue?: string;
  onTipoMovimentoChange?: (value: string) => void;
}

export default function ColetaCommonFilters({
  styles,
  filters,
  statusOptions,
  origemOptions,
  onStatusChange,
  onOrigemChange,
  onDateChange,
  tipoMovimentoOptions,
  tipoMovimentoValue = "",
  onTipoMovimentoChange,
}: ColetaCommonFiltersProps) {
  return (
    <div className={styles.filterExpansion}>
      {tipoMovimentoOptions && onTipoMovimentoChange && (
        <div className={styles.filterSection}>
          <label>Tipo Movimento:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="tipo-movimento-filter"
                checked={tipoMovimentoValue === ""}
                onChange={() => onTipoMovimentoChange("")}
              />
              Todos
            </label>
            {Object.entries(tipoMovimentoOptions).map(([label, value]) => (
              <label key={value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipo-movimento-filter"
                  checked={tipoMovimentoValue === value}
                  onChange={() => onTipoMovimentoChange(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className={styles.filterSection}>
        <label>Status:</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="status-filter"
              checked={!filters.situacao}
              onChange={() => onStatusChange("")}
            />
            Todos
          </label>
          {Object.entries(statusOptions).map(([label, value]) => (
            <label key={value} className={styles.radioLabel}>
              <input
                type="radio"
                name="status-filter"
                checked={filters.situacao === value}
                onChange={() => onStatusChange(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <label>Origem:</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="origem-filter"
              checked={!filters.origem}
              onChange={() => onOrigemChange("")}
            />
            Todas
          </label>
          {Object.entries(origemOptions).map(([label, value]) => (
            <label key={value} className={styles.radioLabel}>
              <input
                type="radio"
                name="origem-filter"
                checked={filters.origem === value}
                onChange={() => onOrigemChange(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <label>Período:</label>
        <div className={styles.dateRange}>
          <input
            type="date"
            name="startDate"
            value={filters.dataCadastroIni ?? ""}
            onChange={onDateChange}
          />
          <input
            type="date"
            name="endDate"
            value={filters.dataCadastroFim ?? ""}
            onChange={onDateChange}
          />
        </div>
      </div>
    </div>
  );
}
