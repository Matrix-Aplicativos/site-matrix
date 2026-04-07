"use client";

import React from "react";
import ColetaStatusBadge from "./ColetaStatusBadge";
import { ColetaTableColumn } from "../table/ColetaTable";
import { ColetaExibida } from "../../domain/coletaMappers";
import {
  getOrigemText,
  getStatusClassName,
  getStatusText,
  getTipoMovimentoText,
} from "../../domain/coletaEnums";

export default function buildColetaTableColumns(
  columns: ColetaTableColumn<ColetaExibida>[],
  styles: Record<string, string>,
): ColetaTableColumn<ColetaExibida>[] {
  return columns.map((col) => {
    if (col.key === "status") {
      return {
        ...col,
        render: (row: ColetaExibida) => (
          <ColetaStatusBadge
            status={row.status}
            className={styles.statusBadge}
            getStatusText={getStatusText}
            getStatusClass={(status) => getStatusClassName(status, styles)}
          />
        ),
      };
    }
    if (col.key === "data") {
      return {
        ...col,
        render: (row: ColetaExibida) =>
          new Date(row.data).toLocaleDateString("pt-BR"),
      };
    }
    if (col.key === "origem") {
      return { ...col, render: (row: ColetaExibida) => getOrigemText(row.origem) };
    }
    if (col.key === "tipoMovimento") {
      return {
        ...col,
        render: (row: ColetaExibida) => getTipoMovimentoText(row.tipoMovimento),
      };
    }
    return col;
  });
}
