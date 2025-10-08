// Em seu arquivo DispositivosPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  FiTrash2,
  FiPower,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiRefreshCw,
} from "react-icons/fi";
import styles from "./Dispositivos.module.css";
import useGetDispositivos from "../hooks/useGetDispositivos";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import useConfiguracao from "../hooks/useConfiguracao";
import { useLoading } from "@/app/shared/Context/LoadingContext";
import useCurrentCompany from "../hooks/useCurrentCompany";

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

interface DispositivoExibido {
  nome: string;
  codigo: string;
  status: boolean;
}

// --- CORREÇÃO APLICADA AQUI ---
// A mensagem de erro do backend ("Dispositivo.nome") confirma que o
// parâmetro correto para ordenar por nome é simplesmente "nome".
const SORT_COLUMN_MAP: { [key in keyof DispositivoExibido]?: string } = {
  nome: "nome", // Ajustado de "nomeDispositivo" para "nome"
  codigo: "id.codDispositivo",
  status: "ativo",
};

const DispositivosPage: React.FC = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DispositivoExibido;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });

  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const { showLoading, hideLoading } = useLoading();

  const {
    dispositivos,
    loading: dispositivosLoading,
    error: dispositivosError,
    refetch,
    totalPaginas,
  } = useGetDispositivos(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    !!codEmpresa
  );

  const { deleteDispositivo } = useDeleteDispositivo(codEmpresa || 0);
  const { ativarDispositivo } = useAtivarDispositivo();
  const { maximoDispositivos, loading: loadingConfig } = useConfiguracao(
    codEmpresa || 0
  );

  const isLoading = companyLoading || dispositivosLoading || loadingConfig;
  const hasMoreData = paginaAtual < totalPaginas;
  const dispositivosAtivos = dispositivos?.filter((d) => d.ativo).length ?? 0;

  const columns: { key: keyof DispositivoExibido; label: string }[] = [
    { key: "nome", label: "Nome" },
    { key: "codigo", label: "Código" },
    { key: "status", label: "Status" },
  ];

  const handleSort = (key: keyof DispositivoExibido) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  const handleDeleteDevice = async (codDispositivo: string) => {
    if (window.confirm("Deseja mesmo excluir esse dispositivo?")) {
      await deleteDispositivo(codDispositivo);
      await refetch();
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
    await refetch();
  };

  const handlePrevPage = () => setPaginaAtual((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPaginaAtual((prev) => prev + 1);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>DISPOSITIVOS</h1>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className={styles.refreshButton}
          onClick={() => refetch()}
          title="Atualizar dispositivos"
        >
          <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
          <FiRefreshCw className={isLoading ? styles.spinning : ""} />
        </button>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.tableContainer}>
          {isLoading && !dispositivos && <p>Carregando dispositivos...</p>}
          {dispositivosError && (
            <p>Erro ao carregar dispositivos: {dispositivosError}</p>
          )}

          {!isLoading && dispositivos && (
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{ cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>{col.label}</span>
                        <IconSort />
                      </div>
                    </th>
                  ))}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.map((dispositivo) => (
                  <tr key={dispositivo.codDispositivo}>
                    <td>{dispositivo.nomeDispositivo}</td>
                    <td>{dispositivo.codDispositivo}</td>
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
                              dispositivo.codDispositivo,
                              dispositivo.nomeDispositivo,
                              dispositivo.ativo
                            )
                          }
                          className={`${styles.actionButton} ${styles.activateButton}`}
                          title="Ativar dispositivo"
                        >
                          <FiPower />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteDevice(dispositivo.codDispositivo)
                        }
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Excluir dispositivo"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={columns.length + 1}>
                    <div className={styles.paginationContainer}>
                      <div className={styles.paginationControls}>
                        <button
                          onClick={() => setPaginaAtual(1)}
                          disabled={paginaAtual === 1}
                        >
                          <FiChevronsLeft />
                        </button>
                        <button
                          onClick={handlePrevPage}
                          disabled={paginaAtual === 1}
                        >
                          <FiChevronLeft />
                        </button>
                        <span>{`Página ${paginaAtual} de ${
                          totalPaginas || 1
                        }`}</span>
                        <button
                          onClick={handleNextPage}
                          disabled={!hasMoreData}
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                      <div className={styles.itemsPerPageContainer}>
                        <span>Itens por página: </span>
                        <select
                          value={porPagina}
                          onChange={(e) => {
                            setPorPagina(Number(e.target.value));
                            setPaginaAtual(1);
                          }}
                          className={styles.itemsPerPageSelect}
                        >
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
        <div className={styles.situacaoContainer}>
          <h2>Situação</h2>
          <div className={styles.situacaoItem}>
            <p>Total de Dispositivos:</p>
            <span className={styles.situacaoValue}>
              {dispositivos?.length ?? 0}
            </span>
          </div>
          {!loadingConfig && (
            <div className={styles.situacaoItem}>
              <p>Dispositivos Disponíveis:</p>
              <span className={styles.situacaoValue}>
                {maximoDispositivos - dispositivosAtivos}
              </span>
            </div>
          )}
          <div className={styles.situacaoItem}>
            <p>Máximo de Dispositivos:</p>
            <span className={styles.situacaoValue}>{maximoDispositivos}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispositivosPage;
