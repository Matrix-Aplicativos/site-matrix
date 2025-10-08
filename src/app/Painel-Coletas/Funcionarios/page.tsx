// Em seu arquivo FuncionariosPage.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetUsuarios from "../hooks/useGetUsuarios";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { UsuarioGet } from "../utils/types/UsuarioGet";

// --- Ícones e Interfaces (sem alterações) ---
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
    {" "}
    <polyline points="23 4 23 10 17 10"></polyline>{" "}
    <polyline points="1 20 1 14 7 14"></polyline>{" "}
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L20.49 10M3.51 14l-2.02 4.64A9 9 0 0 0 18.49 15"></path>{" "}
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
    {" "}
    <path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"></path>{" "}
  </svg>
);

interface ColumnConfig {
  key: keyof FuncionarioExibido;
  label: string;
  sortable: boolean;
}
interface FuncionarioExibido {
  codigo: number;
  nome: string;
  cpf: string;
  email: string;
  status: boolean;
}

// O tipo do valor foi ajustado para 'string' para maior flexibilidade.
const SORT_COLUMN_MAP: { [key in keyof FuncionarioExibido]?: string } = {
  codigo: "codFuncionario",
  nome: "nome",
  cpf: "cpf",
  email: "email",
  status: "ativo",
};

// --- Componente Principal ---
const FuncionariosPage: React.FC = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "ativo" | "inativo"
  >("todos");
  const [selectedFilter, setSelectedFilter] =
    useState<keyof FuncionarioExibido>("nome");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FuncionarioExibido;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  // --- CORREÇÃO 1: Passando todos os parâmetros de filtro e ordenação para o hook ---
  const {
    usuarios,
    loading: usuariosLoading,
    error: usuariosError,
    refetch,
    totalPaginas,
  } = useGetUsuarios(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined, // orderBy
    sortConfig?.direction, // sortDirection
    SORT_COLUMN_MAP[selectedFilter], // filtro (para busca textual)
    query, // valor (da busca textual)
    statusFilter === "todos" ? undefined : statusFilter === "ativo", // ativo (boolean)
    !!codEmpresa
  );

  const isLoading = companyLoading || usuariosLoading;
  const hasMoreData = paginaAtual < totalPaginas;

  const getStatusText = (status: boolean) => (status ? "Ativo" : "Inativo");
  const getStatusClass = (status: boolean) =>
    status ? styles.statusCompleted : styles.statusNotStarted;

  // --- CORREÇÃO 2: Simplificando o useMemo para apenas mapear os dados ---
  const displayedData = useMemo(() => {
    if (!usuarios) return [];

    // A API já filtrou e ordenou. Apenas mapeamos para o formato de exibição.
    return usuarios.map((u) => ({
      codigo: u.codUsuario,
      nome: u.nome,
      cpf: u.cpf,
      email: u.email,
      status: u.ativo,
    }));
  }, [usuarios]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as "todos" | "ativo" | "inativo");
    setPaginaAtual(1);
  };
  const sortData = (key: keyof FuncionarioExibido) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  // O resto do componente não precisa de alterações
  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);
  const handlePrevPage = () => setPaginaAtual((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => {
    if (hasMoreData) setPaginaAtual((prev) => prev + 1);
  };

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (usuariosError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Funcionários</h2>
        <p>{usuariosError}</p>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  }

  const columns: ColumnConfig[] = [
    { key: "codigo", label: "Código", sortable: true },
    { key: "nome", label: "Nome", sortable: true },
    { key: "cpf", label: "CPF", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>FUNCIONÁRIOS</h1>
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual funcionário deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.refreshButton}
            onClick={() => refetch()}
            title="Atualizar funcionários"
            disabled={isLoading}
          >
            <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
            <IconRefresh className={isLoading ? styles.spinning : ""} />
          </button>
        </div>
      </div>
      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          <div className={styles.filterSection}>
            <label>Buscar por:</label>
            <select
              value={selectedFilter}
              onChange={(e) =>
                setSelectedFilter(e.target.value as keyof FuncionarioExibido)
              }
            >
              <option value="nome">Nome</option>
              <option value="cpf">CPF</option>
              <option value="email">Email</option>
              <option value="codigo">Código</option>
            </select>
          </div>
          <div className={styles.filterSection}>
            <label>Filtrar por Status:</label>
            <select value={statusFilter} onChange={handleStatusChange}>
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && sortData(col.key)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.sortable && <IconSort />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row) => (
              <tr key={row.codigo}>
                <td>{row.codigo}</td>
                <td>{row.nome}</td>
                <td>{row.cpf}</td>
                <td>{row.email}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${getStatusClass(
                      row.status
                    )}`}
                  >
                    {getStatusText(row.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={columns.length}>
                <div className={styles.paginationContainer}>
                  <div className={styles.paginationControls}>
                    <button
                      onClick={() => setPaginaAtual(1)}
                      disabled={paginaAtual === 1 || isLoading}
                    >
                      &lt;&lt;
                    </button>
                    <button
                      onClick={handlePrevPage}
                      disabled={paginaAtual === 1 || isLoading}
                    >
                      &lt;
                    </button>
                    <span>
                      Página {paginaAtual} de {totalPaginas || 1}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasMoreData || isLoading}
                    >
                      &gt;
                    </button>
                    <button
                      onClick={() => setPaginaAtual(totalPaginas)}
                      disabled={!hasMoreData || isLoading}
                    >
                      &gt;&gt;
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
      </div>
    </div>
  );
};

export default FuncionariosPage;
