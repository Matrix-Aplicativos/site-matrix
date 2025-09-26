"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar"; // Assumindo o caminho do componente SearchBar
import styles from "../Conferencias/Conferencias.module.css"; // Reutilizando o mesmo CSS module para consistência
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetUsuarios from "../hooks/useGetUsuarios"; // Usando o hook para usuários/funcionários
import useCurrentCompany from "../hooks/useCurrentCompany";

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

// --- Interfaces e Constantes ---

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
  login: string;
  status: boolean;
}

const SORT_COLUMN_MAP: { [key in keyof FuncionarioExibido]?: string } = {
  codigo: "codUsuario",
  nome: "nome",
  cpf: "cpf",
  email: "email",
  login: "login",
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
  const [selectedFilter, setSelectedFilter] = useState("nome");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FuncionarioExibido;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const {
    usuarios,
    loading: usuariosLoading,
    error: usuariosError,
    refetch,
  } = useGetUsuarios(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? String(SORT_COLUMN_MAP[sortConfig.key]) : undefined,
    sortConfig?.direction,
    !!codEmpresa
  );

  const isLoading = companyLoading || usuariosLoading;
  const hasMoreData = usuarios ? usuarios.length >= porPagina : false;

  const getStatusText = (status: boolean) => (status ? "Ativo" : "Inativo");
  const getStatusClass = (status: boolean) =>
    status ? styles.statusCompleted : styles.statusNotStarted;

  const filteredData = useMemo(() => {
    if (!usuarios) return [];

    const funcionarios = usuarios
      // --- IMPORTANTE: Filtra apenas por funcionários (tipoUsuario === 4) ---
      .filter((u) => u.tipoUsuario?.codTipoUsuario === 4)
      .map((u) => ({
        codigo: u.codUsuario,
        nome: u.nome,
        cpf: u.cpf,
        email: u.email,
        login: u.login,
        status: u.ativo,
      }));

    let result = [...funcionarios];

    if (statusFilter !== "todos") {
      result = result.filter((f) => f.status === (statusFilter === "ativo"));
    }

    if (query) {
      result = result.filter((func) => {
        const fieldValue =
          func[selectedFilter as keyof FuncionarioExibido]?.toString() || "";
        return fieldValue.toLowerCase().includes(query.toLowerCase());
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [usuarios, query, statusFilter, selectedFilter, sortConfig]);

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

  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);
  const handlePrevPage = () => setPaginaAtual((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPaginaAtual((prev) => prev + 1);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (usuariosError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Funcionários</h2>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  }

  // --- Ordem das colunas atualizada ---
  const columns: ColumnConfig[] = [
    { key: "codigo", label: "Código", sortable: true },
    { key: "nome", label: "Nome", sortable: true },
    { key: "cpf", label: "CPF", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "login", label: "Login", sortable: true },
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
          >
            <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
            <IconRefresh className={usuariosLoading ? styles.spinning : ""} />
          </button>
        </div>
      </div>
      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          <div className={styles.filterSection}>
            <label>Buscar por:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="nome">Nome</option>
              <option value="cpf">CPF</option>
              <option value="email">Email</option>
              <option value="login">Login</option>
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
            {filteredData.map((row) => (
              <tr key={row.codigo}>
                <td>{row.codigo}</td>
                <td>{row.nome}</td>
                <td>{row.cpf}</td>
                <td>{row.email}</td>
                <td>{row.login}</td>
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
                      disabled={paginaAtual === 1}
                    >
                      {" "}
                      &lt;&lt;{" "}
                    </button>
                    <button
                      onClick={handlePrevPage}
                      disabled={paginaAtual === 1}
                    >
                      {" "}
                      &lt;{" "}
                    </button>
                    <span>{paginaAtual}</span>
                    <button onClick={handleNextPage} disabled={!hasMoreData}>
                      {" "}
                      &gt;{" "}
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
