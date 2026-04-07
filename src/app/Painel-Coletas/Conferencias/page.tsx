"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useTable from "../hooks/core/useTable";
import useCurrentCompany from "../hooks/useCurrentCompany";
import ModalEditarColeta from "../components/ModalEditarColeta";
import type { Coleta } from "../hooks/useGetColetas";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import ExpandedRowContent from "../components/ExpandedRow";
import PaginationControls from "../components/PaginationControls";
import ModalCadastrarColeta from "../components/ModalCadastrarColeta";
import ColetaTable from "../components/table/ColetaTable";
import { FiClipboard } from "react-icons/fi";
import ColetaRowActions from "../components/coleta/ColetaRowActions";
import ColetaPageShell from "../components/coleta/ColetaPageShell";
import ColetaCommonFilters from "../components/coleta/ColetaCommonFilters";
import buildColetaTableColumns from "../components/coleta/buildColetaTableColumns";
import { ColetaExibida, mapColetaToExibida } from "../domain/coletaMappers";
import { OPCOES_ORIGEM, OPCOES_STATUS, SORT_COLUMN_MAP } from "../domain/coletaEnums";
import { CONFERENCIA_TEMPLATE } from "../domain/coletaPageTemplate";

// --- ÍCONES ---


const IconRefresh = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L20.49 10M3.51 14l-2.02 4.64A9 9 0 0 0 18.49 15"></path>
  </svg>
);

const IconSort = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: "0.5em" }}
  >
    <path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"></path>
  </svg>
);


const columns = CONFERENCIA_TEMPLATE.columns;

const ConferenciasPage: React.FC = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [tipoMovimentoFiltro, setTipoMovimentoFiltro] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false);
  const [coletaParaEditar, setColetaParaEditar] = useState<Coleta | null>(null);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const codUsuario = 1;
  const tipoInicial = useMemo(() => ["3", "4"], []);
  const table = useTable<Coleta>({
    codEmpresa,
    tipo: tipoInicial,
    enabled: !!codEmpresa,
    actionUrls: {
      delete: (row) => `/coleta/${row.codColeta ?? row.codConferencia}`,
      reopen: (row) => `/coleta/${row.codColeta ?? row.codConferencia}/reabrir`,
    },
  });

  const filteredData = useMemo(() => {
    return table.rows.map(mapColetaToExibida);
  }, [table.rows]);
  const tableColumns = useMemo(() => buildColetaTableColumns(columns, styles), []);

  const isLoading = companyLoading || table.loading || table.actionLoading;

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const handleSuccess = useCallback(() => {
    setIsModalOpen(false);
    table.reload();
  }, [table]);

  const handleDeleteColeta = async (codColeta: number) => {
    if (window.confirm("Tem certeza que deseja excluir essa conferência?")) {
      try {
        const coleta = (table.rows ?? []).find((c) => c.codConferencia === codColeta);
        if (!coleta) return;
        await table.remove(coleta);
        alert("Conferência excluída com sucesso!");
      } catch (error) {
        alert("Erro ao excluir conferência");
      }
    }
  };

  const handleReabrirColeta = async (rowId: number) => {
    const coleta = (table.rows ?? []).find((c) => c.codConferencia === rowId);
    if (!coleta) return;
    if (!window.confirm("Deseja reabrir esta coleta?")) return;
    try {
      await table.reopen(coleta);
      alert("Coleta reaberta com sucesso!");
    } catch {
      alert("Erro ao reabrir coleta.");
    }
  };

  const openModalEditar = (rowId: number) => {
    const c = (table.rows ?? []).find((x) => x.codConferencia === rowId) ?? null;
    setColetaParaEditar(c);
    setIsModalEditarOpen(true);
  };

  const handleStatusChange = (statusValue: string) => {
    table.setFilters({ situacao: statusValue });
  };

  const handleOrigemChange = (origemValue: string) => {
    table.setFilters({ origem: origemValue });
  };

  const handleTipoMovimentoChange = (tipoValue: string) => {
    setTipoMovimentoFiltro(tipoValue);
    table.setTipo(tipoValue ? [tipoValue] : null);
  };

  const handleSearch = (searchQuery: string) => {
    table.setFilters({ descricao: searchQuery });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      table.setFilters({ dataCadastroIni: value });
      return;
    }
    table.setFilters({ dataCadastroFim: value });
  };

  const handleItemsPerPageChange = (newSize: number) => {
    table.setPageSize(newSize);
  };

  const sortData = (key: keyof ColetaExibida) => {
    const mapped = SORT_COLUMN_MAP[key];
    if (mapped) table.setSort(mapped);
  };

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prev) => (prev === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  if (table.error)
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Conferências</h2>
        <button onClick={() => table.reload()}>Tentar novamente</button>
      </div>
    );

  if (companyLoading || (isLoading && !table.rows.length))
    return <div className={styles.container}>Carregando dados...</div>;

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <ColetaPageShell
        title={`${CONFERENCIA_TEMPLATE.titulo} - ${empresa?.nomeFantasia?.toUpperCase() ?? ""}`}
        titleClassName={styles.title}
        searchPlaceholder={CONFERENCIA_TEMPLATE.searchPlaceholder}
        onSearch={handleSearch}
        onFilterToggle={toggleFilterExpansion}
        actions={
          <div className={styles.searchActions}>
            <button className={styles.actionButton} onClick={() => setIsModalOpen(true)} title="Cadastrar nova conferência">
              <span>{CONFERENCIA_TEMPLATE.createButtonLabel}</span>
              <FiClipboard size={18} />
            </button>
            <button className={styles.actionButton} onClick={() => table.reload()} title="Atualizar conferências">
              <span>Atualizar</span>
              <IconRefresh className={isLoading ? styles.spinning : ""} />
            </button>
          </div>
        }
        filterPanel={isFilterExpanded && (
          <ColetaCommonFilters
            styles={styles}
            filters={table.filters}
            statusOptions={OPCOES_STATUS}
            origemOptions={OPCOES_ORIGEM}
            onStatusChange={handleStatusChange}
            onOrigemChange={handleOrigemChange}
            onDateChange={handleDateChange}
            tipoMovimentoOptions={CONFERENCIA_TEMPLATE.tipoMovimentoOptions}
            tipoMovimentoValue={tipoMovimentoFiltro}
            onTipoMovimentoChange={handleTipoMovimentoChange}
          />
        )}
        table={<ColetaTable
        className={styles.tableContainer}
        tableClassName={styles.table}
        columns={tableColumns}
        rows={filteredData}
        onSort={sortData}
        getRowId={(_, index) => index}
        expandedRowId={expandedRow}
        onToggleExpandRow={(id) => toggleExpandRow(Number(id))}
        expandButtonClassName={styles.expandButton}
        renderSortIcon={() => <IconSort />}
        actionsCellClassName={styles.actionsCell}
        expandedRowClassName={styles.expandedRow}
        expandedColSpanOffset={2}
        renderExpandedContent={(row) => <ExpandedRowContent coletaId={row.id} />}
        renderActions={(row) => (
          <ColetaRowActions
            row={row}
            styles={styles}
            labels={{ delete: "Excluir conferência", edit: "Editar conferência" }}
            onDelete={handleDeleteColeta}
            onEdit={openModalEditar}
            onReopen={handleReabrirColeta}
          />
        )}
      />}
        pagination={<PaginationControls
        paginaAtual={table.page}
        totalPaginas={table.totalPages}
        onPageChange={table.setPage}
        totalElementos={table.totalItems}
        porPagina={table.pageSize}
        onItemsPerPageChange={handleItemsPerPageChange}
      />}
      />

      {codEmpresa && (
        <ModalCadastrarColeta
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          codEmpresa={codEmpresa}
          codUsuario={codUsuario}
          tipoColeta={3}
          titulo={CONFERENCIA_TEMPLATE.createModalTitle}
        />
      )}
      {codEmpresa && (
        <ModalEditarColeta
          isOpen={isModalEditarOpen}
          onClose={() => {
            setIsModalEditarOpen(false);
            setColetaParaEditar(null);
          }}
          onSuccess={() => {
            table.reload();
            setIsModalEditarOpen(false);
            setColetaParaEditar(null);
          }}
          codEmpresa={codEmpresa}
          coleta={coletaParaEditar}
        />
      )}
    </div>
  );
};

export default ConferenciasPage;
