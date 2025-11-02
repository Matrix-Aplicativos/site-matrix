"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiPower, FiRefreshCw } from "react-icons/fi";
import styles from "./Dispositivos.module.css";
import { useLoading } from "@/app/shared/Context/LoadingContext";
import useGetDispositivos from "../hooks/useGetDispositivos";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import useGetDadosDispositivo from "../hooks/useGetDadosDispositivo";
import useConfiguracao from "../hooks/useConfiguracao";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";

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
  tipoLicenca: string;
  status: boolean;
}

const SORT_COLUMN_MAP: { [key in keyof DispositivoExibido]?: string } = {
  nome: "nome",
  codigo: "id.codDispositivo",
  tipoLicenca: "tipoLicenca",
  status: "ativo",
};

const columns: { key: keyof DispositivoExibido; label: string }[] = [
  { key: "nome", label: "Nome" },
  { key: "codigo", label: "Código" },
  { key: "tipoLicenca", label: "Tipo de Licença" },
  { key: "status", label: "Status" },
];

export default function DispositivosPage() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DispositivoExibido;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });

  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const codEmpresa = usuario?.empresas?.[0]?.codEmpresa || 1;
  const { showLoading, hideLoading } = useLoading();

  const {
    dispositivos,
    loading: dispositivosLoading,
    error: dispositivosError,
    refetch,
    totalPaginas,
    totalElementos,
  } = useGetDispositivos(
    codEmpresa,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    !!codEmpresa
  );

  const { deleteDispositivo } = useDeleteDispositivo(codEmpresa);
  const { ativarDispositivo } = useAtivarDispositivo();
  const {
    dados: dadosDispositivo,
    loading: loadingDados,
    refetch: refetchDados,
  } = useGetDadosDispositivo(codEmpresa);

  const {
    validadeLicenca,
    loading: loadingLicencaGeral,
    error: errorLicencaGeral,
    loadingLicenca,
    errorLicenca,
  } = useConfiguracao(codEmpresa);

  const isLoading =
    dispositivosLoading ||
    loadingDados ||
    loadingLicenca ||
    loadingLicencaGeral;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchDados()]);
  };

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
      codEmpresaApi: codEmpresa,
      ativo: !statusAtual,
    });
    await handleRefresh();
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
          onClick={handleRefresh}
          title="Atualizar dispositivos"
          disabled={isLoading}
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
          {errorLicenca && (
            <p>Erro ao carregar validade da licença: {errorLicenca.message}</p>
          )}
          {errorLicencaGeral && (
            <p>Erro ao carregar configurações: {errorLicencaGeral.message}</p>
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
            <p>Total dispositivos:</p>
            <span className={styles.situacaoValue}>
              {loadingDados ? "..." : dadosDispositivo?.totalDispositivos ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças Padrão:</p>
            <span className={styles.situacaoValue}>
              {loadingDados ? "..." : dadosDispositivo?.licencasPadrao ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças Padrão utilizadas:</p>
            <span className={styles.situacaoValue}>
              {loadingDados
                ? "..."
                : dadosDispositivo?.licencasPadraoUtilizadas ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças MultiEmpresa:</p>
            <span className={styles.situacaoValue}>
              {loadingDados ? "..." : dadosDispositivo?.licencasMulti ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças MultiEmpresa utilizadas:</p>
            <span className={styles.situacaoValue}>
              {loadingDados
                ? "..."
                : dadosDispositivo?.licencasMultiUtilizadas ?? 0}
            </span>
          </div>
          <div className={styles.situacaoItem}>
            <p>Licenças válidas até:</p>
            <span className={styles.situacaoValue}>
              {loadingLicenca
                ? "..."
                : errorLicenca
                ? "Erro"
                : validadeLicenca
                ? validadeLicenca.toLocaleDateString("pt-BR")
                : "N/D"}
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
}
