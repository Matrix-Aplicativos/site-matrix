"use client";

import React from "react";

interface RowLike {
  id: number;
  status: string;
  statusSincronizacao: number;
  obsIntegracao?: string | null;
}

interface ColetaRowActionsProps<TRow extends RowLike> {
  row: TRow;
  styles: Record<string, string>;
  labels: {
    delete: string;
    edit: string;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onReopen: (id: number) => void;
}

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconReabrir = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const IconSync = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#1565c0" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
  </svg>
);

const IconPending = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#f57c00" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconError = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#d32f2f" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

export default function ColetaRowActions<TRow extends RowLike>({
  row,
  styles,
  labels,
  onDelete,
  onEdit,
  onReopen,
}: ColetaRowActionsProps<TRow>) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-start" }}>
      <button className={styles.deleteButton} onClick={(e) => { e.stopPropagation(); onDelete(row.id); }} title={labels.delete}>
        <IconTrash />
      </button>
      {(row.status === "1" || row.status === "4") && (
        <button type="button" className={styles.editButton} onClick={(e) => { e.stopPropagation(); onEdit(row.id); }} title={labels.edit}>
          <IconEdit />
        </button>
      )}
      {(row.status === "2" || row.status === "3") && row.statusSincronizacao !== 2 && (
        <button type="button" className={styles.editButton} onClick={(e) => { e.stopPropagation(); onReopen(row.id); }} title="Reabrir coleta">
          <IconReabrir />
        </button>
      )}
      {(row.status === "2" || row.status === "3") && (
        <>
          {row.statusSincronizacao === 1 && <span className={styles.syncIcon} title={row.obsIntegracao ?? "Pendente de Envio"}><IconPending /></span>}
          {row.statusSincronizacao === 2 && <span className={styles.syncIcon} title={row.obsIntegracao ?? "Sincronizado com ERP"}><IconSync /></span>}
          {row.statusSincronizacao === 3 && (
            <button type="button" className={styles.syncIcon} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={(e) => { e.stopPropagation(); alert(row.obsIntegracao ?? "Erro na Integração"); }} title="Ver mensagem de erro">
              <IconError />
            </button>
          )}
        </>
      )}
    </div>
  );
}
