"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiPower, FiRefreshCw, FiEdit2 } from "react-icons/fi";
import styles from "./Dispositivos.module.css";
import { useLoading } from "@/app/shared/Context/LoadingContext";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import useEditarNomeDispositivo from "../hooks/useEditarNomeDispositivo";
import useCurrentCompany from "../hooks/useCurrentCompany";
import PaginationControls from "../components/PaginationControls";
import useTable, { normalizePagedResponse } from "../hooks/core/useTable";
import useAxiosRequest from "../hooks/core/useAxiosRequest";
import ColetaPageShell from "../components/coleta/ColetaPageShell";
import {
  DISPOSITIVO_COLUMNS,
  DISPOSITIVO_SORT_COLUMN_MAP,
  formatUltimoUtilizador,
  UltimoUtilizador,
} from "../domain/dispositivoTableConfig";

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
    key: (typeof DISPOSITIVO_COLUMNS)[number]["key"];
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });

  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const { showLoading, hideLoading } = useLoading();

  const table = useTable<Record<string, unknown>>({
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
    responseAdapter: normalizePagedResponse,
  });

  const { deleteDispositivo } = useDeleteDispositivo(codEmpresa || 0);
  const { ativarDispositivo } = useAtivarDispositivo();
  const { editarNomeDispositivo, loading: loadingEdicao } = useEditarNomeDispositivo();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deviceBeingEdited, setDeviceBeingEdited] = useState<{
    codDispositivo: string;
    nomeAtual: string;
  } | null>(null);
  const [novoNomeDispositivo, setNovoNomeDispositivo] = useState("");

  const {
    data: dadosDispositivo,
    loading: loadingDados,
    error: errorDados,
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

  const handleSort = (key: (typeof DISPOSITIVO_COLUMNS)[number]["key"]) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    table.setPage(1);
    table.setSort(DISPOSITIVO_SORT_COLUMN_MAP[key] || key);
  };

  const handleDeleteDevice = async (codDispositivo: string) => {
    if (window.confirm("Deseja mesmo excluir esse dispositivo?")) {
      await deleteDispositivo(codDispositivo);
      await handleRefresh();
    }
  };

  const openEditModal = (codDispositivo: string, nomeAtual: string) => {
    setDeviceBeingEdited({ codDispositivo, nomeAtual });
    setNovoNomeDispositivo(nomeAtual);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (loadingEdicao) return;
    setIsEditModalOpen(false);
    setDeviceBeingEdited(null);
    setNovoNomeDispositivo("");
  };

  const handleConfirmEditDeviceName = async () => {
    if (!codEmpresa || !deviceBeingEdited) return;

    const nomeNormalizado = novoNomeDispositivo.trim();
    if (!nomeNormalizado || nomeNormalizado === deviceBeingEdited.nomeAtual) {
      closeEditModal();
      return;
    }

    await editarNomeDispositivo({
      codEmpresa,
      codDispositivo: deviceBeingEdited.codDispositivo,
      nomeDispositivo: nomeNormalizado,
    });
    closeEditModal();
    await handleRefresh();
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

            {errorDados && (
              <p>Erro ao carregar dados dos dispositivos: {errorDados}</p>
            )}
            {!isLoading && table.rows && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    {DISPOSITIVO_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable !== false && handleSort(col.key)}
                        style={{ cursor: col.sortable !== false ? "pointer" : "default" }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span>{col.label}</span>
                          {col.sortable !== false && <IconSort />}
                        </div>
                      </th>
                    ))}
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {table.rows.map((dispositivo: Record<string, unknown>) => (
                    <tr key={String(dispositivo.codDispositivo)}>
                      <td>
                        {formatUltimoUtilizador(
                          dispositivo.ultimoUtilizador as UltimoUtilizador | null | undefined
                        )}
                      </td>
                      <td>{String(dispositivo.nomeDispositivo ?? "")}</td>
                      <td>{String(dispositivo.codDispositivo ?? "")}</td>

                      <td>
                        {dispositivo.tipoLicenca === "2"
                          ? "Multiempresa"
                          : "Padrão"}
                      </td>

                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            dispositivo.ativo ? styles.active : styles.inactive
                          }`}
                        >
                          {dispositivo.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td className={styles.actionsCell}>
                        {!dispositivo.ativo && (
                          <button
                            onClick={() =>
                              toggleStatus(
                                String(dispositivo.codDispositivo),
                                String(dispositivo.nomeDispositivo ?? ""),
                                Boolean(dispositivo.ativo)
                              )
                            }
                            className={`${styles.actionButton} ${styles.activateButton}`}
                            title="Ativar dispositivo"
                          >
                            <FiPower />
                          </button>
                        )}

                        <div className={styles.dangerActionsGroup}>
                          <button
                            onClick={() =>
                              openEditModal(
                                String(dispositivo.codDispositivo),
                                String(dispositivo.nomeDispositivo ?? "")
                              )
                            }
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Editar nome do dispositivo"
                            disabled={loadingEdicao}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteDevice(String(dispositivo.codDispositivo))
                            }
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Excluir dispositivo"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.situacaoContainer}>
          <h2>Situação</h2>
          <div className={styles.situacaoItem}>
            <p>Total dispositivos:</p>
            <span className={styles.situacaoValue}>
              {!codEmpresa || loadingDados
                ? "..."
                : dadosDispositivo?.totalDispositivos ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças Padrão:</p>
            <span className={styles.situacaoValue}>
              {!codEmpresa || loadingDados
                ? "..."
                : dadosDispositivo?.licencasPadrao ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças Padrão utilizadas:</p>
            <span className={styles.situacaoValue}>
              {!codEmpresa || loadingDados
                ? "..."
                : dadosDispositivo?.licencasPadraoUtilizadas ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças MultiEmpresa:</p>
            <span className={styles.situacaoValue}>
              {!codEmpresa || loadingDados
                ? "..."
                : dadosDispositivo?.licencasMulti ?? 0}
            </span>
          </div>

          <div className={styles.situacaoItem}>
            <p>Licenças MultiEmpresa utilizadas:</p>
            <span className={styles.situacaoValue}>
              {!codEmpresa || loadingDados
                ? "..."
                : dadosDispositivo?.licencasMultiUtilizadas ?? 0}
            </span>
          </div>

          <div className={styles.situacaoItem}>
            <p>Licenças válidas até:</p>
            <span className={styles.situacaoValue}>
              {!codEmpresa || loadingDados
                ? "..."
                : dadosDispositivo?.vencimentoLicencas || "N/D"}
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

      {isEditModalOpen && deviceBeingEdited && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Editar dispositivo</h2>
            </div>
            <div className={styles.modalBody}>
              <label htmlFor="novo-nome-dispositivo" className={styles.modalLabel}>
                Novo nome do dispositivo
              </label>
              <input
                id="novo-nome-dispositivo"
                type="text"
                value={novoNomeDispositivo}
                onChange={(e) => setNovoNomeDispositivo(e.target.value)}
                className={styles.modalInput}
                placeholder="Digite o novo nome"
                autoFocus
              />
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeEditModal} className={styles.cancelButton} disabled={loadingEdicao}>
                Cancelar
              </button>
              <button onClick={handleConfirmEditDeviceName} className={styles.saveButton} disabled={loadingEdicao}>
                {loadingEdicao ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispositivosPage;
