"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiPower, FiRefreshCw, FiEdit2 } from "react-icons/fi";
import styles from "./Dispositivos.module.css";
import { useLoading } from "@/app/shared/Context/LoadingContext";
import useGetDispositivos from "../hooks/useGetDispositivos";
import useDeleteDispositivo from "../hooks/useDeleteDispositivo";
import useAtivarDispositivo from "../hooks/useAtivarDispositivo";
import useEditarNomeDispositivo from "../hooks/useEditarNomeDispositivo";
import useGetDadosDispositivo from "../hooks/useGetDadosDispositivo";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { formatPainelTitle } from "../utils/formatPainelTitle";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";
import { formatUltimoUtilizador } from "@/app/Painel-Coletas/domain/dispositivoTableConfig";

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
  ultimoUtilizador: string;
  status: boolean;
}

const SORT_COLUMN_MAP: { [key in keyof DispositivoExibido]?: string } = {
  nome: "nome",
  codigo: "id.codDispositivo",
  tipoLicenca: "tipoLicenca",
  status: "ativo",
};

const columns: {
  key: keyof DispositivoExibido;
  label: string;
  sortable?: boolean;
}[] = [
  { key: "ultimoUtilizador", label: "Usuario", sortable: false },
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
  const { empresa } = useCurrentCompany();

  const codEmpresa = empresa?.codEmpresa ?? usuario?.empresas?.[0]?.codEmpresa;
  const pageTitle = formatPainelTitle("DISPOSITIVOS", empresa?.nomeFantasia);
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
  const { editarNomeDispositivo, loading: loadingEdicao } = useEditarNomeDispositivo();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deviceBeingEdited, setDeviceBeingEdited] = useState<{
    codDispositivo: string;
    nomeAtual: string;
  } | null>(null);
  const [novoNomeDispositivo, setNovoNomeDispositivo] = useState("");

  const {
    dados: dadosDispositivo,
    loading: loadingDados,
    error: errorDados,
    refetch: refetchDados,
  } = useGetDadosDispositivo(codEmpresa);

  const isLoading = dispositivosLoading || loadingDados;

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const handleRefresh = async () => {
    if (codEmpresa) {
      await Promise.all([refetch(), refetchDados()]);
    }
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
    if (!codEmpresa) return;

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
        <h1 className={styles.title}>{pageTitle}</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={handleRefresh}
          title="Atualizar dispositivos"
          disabled={isLoading || !codEmpresa}
        >
          Atualizar
          <FiRefreshCw className={isLoading ? styles.spinning : ""} />
        </button>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.tableContainer}>
          {isLoading && !dispositivos && <p>Carregando dispositivos...</p>}
          {dispositivosError && (
            <p>Erro ao carregar dispositivos: {dispositivosError}</p>
          )}

          {errorDados && (
            <p>Erro ao carregar dados dos dispositivos: {errorDados}</p>
          )}
          {!isLoading && dispositivos && (
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
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
                {dispositivos.map((dispositivo) => (
                  <tr key={dispositivo.codDispositivo}>
                    <td>{formatUltimoUtilizador(dispositivo.ultimoUtilizador)}</td>
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

                      <div className={styles.dangerActionsGroup}>
                        <button
                          onClick={() =>
                            openEditModal(
                              dispositivo.codDispositivo,
                              dispositivo.nomeDispositivo
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
                            handleDeleteDevice(dispositivo.codDispositivo)
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
}
