"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiPower, FiRefreshCw } from "react-icons/fi";
import styles from "./Dispositivos.module.css";
import { useLoading } from "@/app/shared/Context/LoadingContext";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import useCurrentCompany from "../hooks/useCurrentCompany";
import PaginationControls from "../components/PaginationControls";
import ColetaTable from "../components/table/ColetaTable";
import useTable from "../hooks/core/useTable";
import useAxiosRequest from "../hooks/core/useAxiosRequest";
import ColetaPageShell from "../components/coleta/ColetaPageShell";
import {
  DispositivoExibido,
  DISPOSITIVO_COLUMNS,
  DISPOSITIVO_SORT_COLUMN_MAP,
} from "../domain/dispositivoTableConfig";

/** Linha da tabela: colunas exibidas + `raw` para ações (não ordenável). */
type DispositivoLinha = DispositivoExibido & { raw: Record<string, unknown> };

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


const DispositivosPage: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DispositivoExibido;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });

  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const { showLoading, hideLoading } = useLoading();

  const table = useTable<any>({
    codEmpresa,
    enabled: !!codEmpresa,
    endpoint: ({ codEmpresa: company }) => `/dispositivo/${company}`,
    queryParamsBuilder: ({ page, pageSize, sort }) => {
      const params = new URLSearchParams({
        pagina: String(page),
        porPagina: String(pageSize),
      });
      if (sort) {
        params.append("orderBy", sort.key);
        params.append("direction", sort.direction);
      }
      return params;
    },
    responseAdapter: (data) => ({
      rows: data?.conteudo || [],
      totalPages: data?.qtdPaginas || 0,
      totalItems: data?.qtdElementos || 0,
    }),
  });

  const { deleteDispositivo } = useDeleteDispositivo(codEmpresa || 0);
  const { ativarDispositivo } = useAtivarDispositivo();

  const {
    data: dadosDispositivo,
    loading: loadingDados,
    execute: executeDados,
  } = useAxiosRequest<any>(null);

  useEffect(() => {
    if (!codEmpresa) return;
    executeDados({ method: "GET", url: `/dispositivo/${codEmpresa}/dados` });
  }, [codEmpresa, executeDados]);

  const isLoading = companyLoading || table.loading || loadingDados;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const handleRefresh = async () => {
    await Promise.all([
      table.reload(),
      codEmpresa ? executeDados({ method: "GET", url: `/dispositivo/${codEmpresa}/dados` }) : Promise.resolve(),
    ]);
  };

  const handleSort = (key: keyof DispositivoLinha) => {
    if (key === "raw") return;
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    table.setSort(DISPOSITIVO_SORT_COLUMN_MAP[key] || key);
  };

  const handleDeleteDevice = async (codDispositivo: string) => {
    if (window.confirm("Deseja mesmo excluir esse dispositivo?")) {
      await deleteDispositivo(codDispositivo);
      await handleRefresh();
    }
  };

  const toggleStatus = async (
    codDispositivo: string,
    nomeDispositivo: string,
    statusAtual: boolean
  ) => {
    await ativarDispositivo({
      codDispositivo,
      nomeDispositivo,
      codEmpresaApi: codEmpresa || 0,
      ativo: !statusAtual,
    });
    await handleRefresh();
  };

  const handleItemsPerPageChange = (newSize: number) => {
    table.setPage(1);
    table.setPageSize(newSize);
  };

  return (
    <div className={styles.container}>
      <ColetaPageShell
        title={`DISPOSITIVOS - ${empresa?.nomeFantasia?.toUpperCase() ?? ""}`}
        titleClassName={styles.title}
        searchPlaceholder=""
        onSearch={() => {}}
        onFilterToggle={() => {}}
        showSearch={false}
        actions={
          <button className={styles.refreshButton} onClick={handleRefresh} title="Atualizar dispositivos">
            <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
            <FiRefreshCw className={isLoading ? styles.spinning : ""} />
          </button>
        }
        table={<div className={styles.mainContent}>
          <div className={styles.tableContainer}>
            {isLoading && !table.rows && <p>Carregando dispositivos...</p>}
            {table.error && <p>Erro ao carregar dispositivos: {table.error}</p>}

            {!isLoading && table.rows && (
              <ColetaTable<DispositivoLinha>
                tableClassName={styles.table}
                columns={DISPOSITIVO_COLUMNS.map((col) => {
                  if (col.key === "tipoLicenca") return { ...col, render: (row: any) => (row.tipoLicenca === "2" ? "Multiempresa" : "Padrão") };
                  if (col.key === "status") {
                    return {
                      ...col,
                      render: (row: any) => (
                        <span className={`${styles.statusBadge} ${row.status ? styles.active : styles.inactive}`}>
                          {row.status ? "Ativo" : "Inativo"}
                        </span>
                      ),
                    };
                  }
                  return col;
                })}
                rows={table.rows.map(
                  (dispositivo: Record<string, unknown>): DispositivoLinha => ({
                    nome: String(dispositivo.nomeDispositivo ?? ""),
                    codigo: String(dispositivo.codDispositivo ?? ""),
                    tipoLicenca: String(dispositivo.tipoLicenca ?? ""),
                    status: Boolean(dispositivo.ativo),
                    raw: dispositivo,
                  }),
                )}
                onSort={handleSort}
                getRowId={(row: any) => row.codigo}
                renderSortIcon={() => <IconSort />}
                actionsCellClassName={styles.actionsCell}
                renderActions={(row: any) => (
                  <>
                    {!row.raw.ativo && (
                      <button onClick={() => toggleStatus(row.raw.codDispositivo, row.raw.nomeDispositivo, row.raw.ativo)} className={`${styles.actionButton} ${styles.activateButton}`} title="Ativar dispositivo">
                        <FiPower />
                      </button>
                    )}
                    <button onClick={() => handleDeleteDevice(row.raw.codDispositivo)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Excluir dispositivo">
                      <FiTrash2 />
                    </button>
                  </>
                )}
              />
            )}
          </div>

          <div className={styles.situacaoContainer}>
          <h2>Situação</h2>
          <div className={styles.situacaoItem}>
            <p>Total dispositivos:</p>
            <span className={styles.situacaoValue}>
              {dadosDispositivo?.totalDispositivos ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças Padrão:</p>
            <span className={styles.situacaoValue}>
              {dadosDispositivo?.licencasPadrao ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças Padrão utilizadas:</p>
            <span className={styles.situacaoValue}>
              {dadosDispositivo?.licencasPadraoUtilizadas ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças MultiEmpresa:</p>
            <span className={styles.situacaoValue}>
              {dadosDispositivo?.licencasMulti ?? 0}
            </span>
          </div>

          <div className={styles.situacaoItem}>
            <p>Licenças MultiEmpresa utilizadas:</p>
            <span className={styles.situacaoValue}>
              {dadosDispositivo?.licencasMultiUtilizadas ?? 0}
            </span>
          </div>

          <div className={styles.situacaoItem}>
            <p>Licenças válidas até:</p>
            <span className={styles.situacaoValue}>
              {loadingDados
                ? "..."
                : dadosDispositivo?.vencimentoLicencas
                ? dadosDispositivo.vencimentoLicencas
                : "N/D"}
            </span>
          </div>
          </div>
        </div>}
        pagination={table.totalItems > 0 ? (
          <div className={styles.footerControls}>
            <PaginationControls
            paginaAtual={table.page}
            totalPaginas={table.totalPages}
            totalElementos={table.totalItems}
            porPagina={table.pageSize}
            onPageChange={table.setPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        ) : null}
      />
    </div>
  );
};

export default DispositivosPage;
