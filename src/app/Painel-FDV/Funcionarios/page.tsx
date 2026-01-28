"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "./Usuarios.module.css";
import useGetUsuarios from "../hooks/useGetUsuarios"; // Seu hook com axiosInstanceFDV
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { useLoading } from "../../shared/Context/LoadingContext";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import { toast } from "react-toastify";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";
import SearchBar from "@/app/Painel-Coletas/components/SearchBar";
import ModalPermissoes from "@/app/Painel-Coletas/components/ModalPermissoes";

// --- Ícones ---
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
// --- Fim Ícones ---

// Mapeamento dos filtros
const FILTER_TO_API_PARAM: Record<string, string> = {
  Nome: "nomeUsuario",
  CPF: "cpfusuario",
  Email: "emailUsuario",
  Código: "codUsuarioErp",
};

interface ColumnDefinition {
  key: string;
  label: string;
  render?: (value: any, row: UsuarioGet, rowIndex: number) => React.ReactNode;
}

export default function UsuariosPage() {
  // --- Estados ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("Nome");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioGet | null>(null); // --- Hooks de Contexto e Autenticação ---

  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0); // --- Filtros ---

  const filtrosParaApi = useMemo(() => {
    const filtros: Record<string, string | boolean> = {};
    if (searchQuery) {
      const apiParamKey = FILTER_TO_API_PARAM[selectedFilter];
      if (apiParamKey) {
        filtros[apiParamKey] = searchQuery;
      }
    }
    return filtros;
  }, [searchQuery, selectedFilter]); // --- [LÓGICA CORRIGIDA DE CARREGAMENTO] --- // 1. Determine o 'codEmpresa' a ser usado.

  const codEmpresaParaBusca =
    usuario && usuario.empresas[0]?.codEmpresa
      ? usuario.empresas[0].codEmpresa
      : 1; // Padrão Empresa 1 se o usuário não tiver uma // 2. O hook SÓ deve ser habilitado se o 'usuario' já foi carregado.

  const isHookEnabled = !!usuario; // 3. Chame o hook com a lógica correta

  const { usuarios, loading, error, totalPaginas, totalElementos, refetch } =
    useGetUsuarios(
      codEmpresaParaBusca,
      paginaAtual,
      itemsPerPage,
      sortConfig?.key,
      sortConfig?.direction,
      filtrosParaApi,
      isHookEnabled,
    ); // --- [FIM DA LÓGICA CORRIGIDA] --- // --- Handlers do Modal ---
  const handleOpenModal = (usuario: UsuarioGet) => {
    setSelectedUser(usuario);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  const handleSavePermissions = () => {
    handleCloseModal();
    refetch();
    toast.success("Permissões salvas com sucesso!");
  }; // --- Definição das Colunas ---

  const columns: ColumnDefinition[] = [
    { key: "codFuncionario", label: "Código" },
    { key: "nome", label: "Nome" },
    { key: "cpf", label: "CPF" },
    { key: "email", label: "Email" },
    {
      key: "ativo",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={`${styles.statusBadge} ${
            value ? styles.statusCompleted : styles.statusNotStarted
          }`}
        >
          {value ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (_value: any, row: UsuarioGet) =>
        row.codUsuario && row.codUsuario > 0 ? (
          <button
            className={styles.actionButton}
            onClick={() => handleOpenModal(row)}
          >
            Permissões
          </button>
        ) : (
          "—"
        ),
    },
  ]; // --- Effects ---

  useEffect(() => {}, [usuarios]);

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]); // --- Handlers da Tabela ---

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (query: string) => {
    setPaginaAtual(1);
    setSearchQuery(query);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPaginaAtual(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setPaginaAtual(1);
  };

  const getCellValue = (row: any, colKey: string) => {
    if (colKey.includes(".")) {
      return colKey.split(".").reduce((o: any, i) => o?.[i], row) || "N/A";
    }
    return row[colKey as keyof UsuarioGet] ?? "N/A";
  }; // --- Renderização ---

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>FUNCIONÁRIOS</h1>
        <div className={styles.errorMessage}>
          <p>Erro ao carregar usuários: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Renderização do Modal */}
      {selectedUser && usuario && (
        <ModalPermissoes
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          usuarioInfo={selectedUser}
          onSave={handleSavePermissions}
          codUsuarioLogado={usuario.codUsuario}
          codEmpresa={0}
        />
      )}
      <h1 className={styles.title}>FUNCIONÁRIOS</h1>
      {/* Barra de Busca e Ações */}
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual usuário deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />

        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => refetch()}
            title="Atualizar usuários"
          >
            <span>Atualizar</span>

            <IconRefresh className={loading ? styles.spinning : ""} />
          </button>
        </div>
      </div>
      {/* Filtros Expansíveis */}
      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          <div className={styles.filterSection}>
            <label>Buscar por:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="Nome">Nome</option>
              <option value="Email">Email</option>
              <option value="CPF">CPF</option>
              <option value="Código">Código</option>
            </select>
          </div>
        </div>
      )}
      {/* Tabela de Dados */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.key !== "actions" && <IconSort />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* --- CORPO DA TABELA LIMPO --- */}
            {usuarios &&
              usuarios.map((row, rowIndex) => (
                <tr key={row.codFuncionario}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(getCellValue(row, col.key), row, rowIndex)
                        : getCellValue(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>

          <tfoot>
            {/* --- RODAPÉ DA TABELA LIMPO --- */}
            <tr>
              <td colSpan={columns.length}>
                <PaginationControls
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas || 1}
                  totalElementos={totalElementos || 0}
                  porPagina={itemsPerPage}
                  onPageChange={setPaginaAtual}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  isLoading={loading}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
