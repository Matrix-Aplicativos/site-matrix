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
import { FaSort } from "react-icons/fa";
import styles from "./Dispositivos.module.css";
import useGetDispositivos from "../hooks/useGetDispositivos";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import useConfiguracao from "../hooks/useConfiguracao";
import { useLoading } from "@/app/shared/Context/LoadingContext";
import useCurrentCompany from "../hooks/useCurrentCompany";

const DispositivosPage: React.FC = () => {
  // Estados da página
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Carrega empresa dinamicamente
  const { codEmpresa, loading: companyLoading } = useCurrentCompany();

  // Contexto de loading
  const { showLoading, hideLoading } = useLoading();

  // Busca de dados
  const {
    dispositivos,
    loading: dispositivosLoading,
    error: dispositivosError,
    refetch,
  } = useGetDispositivos(
    codEmpresa || 0, // Fallback para 0 se não houver empresa
    paginaAtual,
    sortConfig?.key,
    sortConfig?.direction,
    !!codEmpresa
  );

  // Hooks de ações
  const { deleteDispositivo } = useDeleteDispositivo(codEmpresa || 0);
  const { ativarDispositivo } = useAtivarDispositivo();
  const { maximoDispositivos, loading: loadingConfig } = useConfiguracao(
    codEmpresa || 0
  );

  // Estados combinados
  const isLoading = companyLoading || dispositivosLoading || loadingConfig;
  const hasMoreData = dispositivos ? dispositivos.length >= porPagina : false;

  // Contadores de status
  const dispositivosAtivos = dispositivos?.filter((d) => d.ativo).length ?? 0;
  const dispositivosInativos =
    dispositivos?.filter((d) => !d.ativo).length ?? 0;

  // Colunas da tabela
  const columns = [
    { key: "nomeDispositivo", label: "Nome" },
    { key: "codDispositivo", label: "Código" },
    { key: "ativo", label: "Status" },
  ];

  // Handlers
  const handleSort = (key: string) => {
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

  // Efeitos
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  if (dispositivosError) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>DISPOSITIVOS</h1>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.error}>
            Erro ao carregar dispositivos: {dispositivosError}
          </p>
          <button onClick={refetch} className={styles.refreshButton}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Sem empresa vinculada
  if (!codEmpresa && !companyLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>DISPOSITIVOS</h1>
        </div>
        <div className={styles.errorContainer}>
          <p>Nenhuma empresa vinculada ao usuário.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>DISPOSITIVOS</h1>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className={styles.refreshButton}
          onClick={refetch}
          title="Atualizar dispositivos"
        >
          <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
          <FiRefreshCw className={isLoading ? styles.spinning : ""} />
        </button>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.tableContainer}>
          {isLoading && <p>Carregando dispositivos...</p>}

          {!isLoading && dispositivos && (
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.key)}>
                      {col.label} <FaSort style={{ marginLeft: "0.5em" }} />
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
                      <div className={styles.statusIndicatorContainer}>
                        <div
                          className={`${styles.statusIndicator} ${
                            dispositivo.ativo
                              ? styles.statusActive
                              : styles.statusInactive
                          }`}
                        >
                          
                        </div>
                      </div>
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
                        >
                          <FiPower />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteDevice(dispositivo.codDispositivo)
                        }
                        className={`${styles.actionButton} ${styles.deleteButton}`}
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
                        <span>{paginaAtual}</span>
                        <button
                          onClick={handleNextPage}
                          disabled={!hasMoreData}
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                      <div className={styles.itemsPerPageContainer}>
                        <span>Dispositivos por página: </span>
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
                {maximoDispositivos - dispositivosAtivos}{" "}
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
