"use client";

import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiPower, FiRefreshCw } from "react-icons/fi";
import styles from "./Dispositivos.module.css";
import { useLoading } from "@/app/shared/Context/LoadingContext";
import useGetDispositivos from "../hooks/useGetDispositivos";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import useConfiguracao from "../hooks/useConfiguracao";
import useCurrentCompany from "../hooks/useCurrentCompany";
import PaginationControls from "../components/PaginationControls";

// Componente do ícone de ordenação
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

// Interface para controle de ordenação e colunas
interface DispositivoExibido {
  nome: string;
  codigo: string;
  tipoLicenca: string;
  status: boolean;
}

// Mapeamento de chaves para os nomes dos campos da API para ordenação
const SORT_COLUMN_MAP: { [key in keyof DispositivoExibido]?: string } = {
  nome: "nome",
  codigo: "id.codDispositivo",
  tipoLicenca: "tipoLicenca",
  status: "ativo",
};

// Definição das colunas da tabela
const columns: { key: keyof DispositivoExibido; label: string }[] = [
  { key: "nome", label: "Nome" },
  { key: "codigo", label: "Código" },
  { key: "tipoLicenca", label: "Tipo de Licença" },
  { key: "status", label: "Status" },
];

const DispositivosPage: React.FC = () => {
  // Estados para paginação e ordenação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DispositivoExibido;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });

  // Hooks para obter dados da empresa, configurações e controle de loading
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const { showLoading, hideLoading } = useLoading();

  // Hook principal para buscar os dispositivos
  const {
    dispositivos,
    loading: dispositivosLoading,
    error: dispositivosError,
    refetch,
    totalPaginas,
    totalElementos,
  } = useGetDispositivos(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    !!codEmpresa
  );

  // Hooks para ações de deletar e ativar/desativar
  const { deleteDispositivo } = useDeleteDispositivo(codEmpresa || 0);
  const { ativarDispositivo } = useAtivarDispositivo();
  const {
    maximoDispositivos,
    maximoDispositivosMulti,
    loading: loadingConfig,
  } = useConfiguracao(codEmpresa || 0);

  const isLoading = companyLoading || dispositivosLoading || loadingConfig;

  // Cálculos para a seção "Situação"
  const { dispositivosAtivos, dispositivosMultiAtivos } = useMemo(() => {
    const ativos = dispositivos?.filter((d) => d.ativo).length ?? 0;
    // MODIFICADO: Compara com a string "2"
    const multiAtivos =
      dispositivos?.filter((d) => d.ativo && d.tipoLicenca === "2").length ?? 0;
    return { dispositivosAtivos: ativos, dispositivosMultiAtivos: multiAtivos };
  }, [dispositivos]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const handleSort = (key: keyof DispositivoExibido) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    setPaginaAtual(1);
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

  const handleItemsPerPageChange = (newSize: number) => {
    setPorPagina(newSize);
    setPaginaAtual(1);
  };

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
                      {/* MODIFICADO: Compara com a string "2" */}
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
            </table>
          )}
        </div>

        <div className={styles.situacaoContainer}>
          <h2>Situação</h2>
          <div className={styles.situacaoItem}>
            <p>Total de Dispositivos:</p>
            <span className={styles.situacaoValue}>{totalElementos ?? 0}</span>
          </div>

          {!loadingConfig && (
            <div className={styles.situacaoItem}>
              <p>Disponíveis (Padrão):</p>
              <span className={styles.situacaoValue}>
                {maximoDispositivos - dispositivosAtivos}
              </span>
            </div>
          )}
          <div className={styles.situacaoItem}>
            <p>Máximo de Dispositivos:</p>
            <span className={styles.situacaoValue}>{maximoDispositivos}</span>
          </div>

          <div className={styles.situacaoItem}>
            <p>Ativos (Multiempresa):</p>
            <span className={styles.situacaoValue}>
              {dispositivosMultiAtivos}
            </span>
          </div>
          {!loadingConfig && (
            <div className={styles.situacaoItem}>
              <p>Disponíveis (Multiempresa):</p>
              <span className={styles.situacaoValue}>
                {maximoDispositivosMulti - dispositivosMultiAtivos}
              </span>
            </div>
          )}
          <div className={styles.situacaoItem}>
            <p>Máximo de Dispositivos Multiempresa:</p>
            <span className={styles.situacaoValue}>
              {maximoDispositivosMulti}
            </span>
          </div>
        </div>
      </div>

      {totalElementos > 0 && (
        <div className={styles.footerControls}>
          <PaginationControls
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            porPagina={porPagina}
            onPageChange={setPaginaAtual}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DispositivosPage;
