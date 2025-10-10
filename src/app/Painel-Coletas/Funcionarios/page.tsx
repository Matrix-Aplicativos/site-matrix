"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetUsuarios from "../hooks/useGetUsuarios";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import PaginationControls from "../components/PaginationControls";

// --- Ícones e Interfaces ---
const IconRefresh = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1565c0"
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
const SORT_COLUMN_MAP: { [key in keyof FuncionarioExibido]?: string } = {
  codigo: "codFuncionarioErp",
  nome: "nome",
  cpf: "cpf",
  email: "email",
  status: "ativo",
};

const FILTER_TO_API_PARAM: Record<string, string> = {
  nome: "nomeUsuario",
  cpf: "cpfusuario",
  email: "emailUsuario",
  codigo: "codUsuarioErp",
};

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

  const filtrosParaApi = useMemo(() => {
    const filtros: Record<string, string | boolean> = {};

    if (query) {
      const apiParamKey = FILTER_TO_API_PARAM[selectedFilter];
      if (apiParamKey) {
        filtros[apiParamKey] = query;
      }
    }

    if (statusFilter !== "todos") {
      filtros.ativo = statusFilter === "ativo";
    }

    return filtros;
  }, [query, selectedFilter, statusFilter]);

  const {
    usuarios,
    loading: usuariosLoading,
    error: usuariosError,
    refetch,
    totalPaginas,
    totalElementos,
  } = useGetUsuarios(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    filtrosParaApi,
    !!codEmpresa
  );

  const isLoading = companyLoading || usuariosLoading;

  const getStatusText = (status: boolean) => (status ? "Ativo" : "Inativo");
  const getStatusClass = (status: boolean) =>
    status ? styles.statusCompleted : styles.statusNotStarted;

  const displayedData = useMemo(() => {
    if (!usuarios) return [];
    return usuarios.map((u) => ({
      codigo: u.codUsuarioErp,
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

  const handleStatusChange = (newStatus: "todos" | "ativo" | "inativo") => {
    setStatusFilter(newStatus);
    setPaginaAtual(1);
  };

  // ADICIONADO: Função para lidar com a mudança do seletor de itens por página
  const handleItemsPerPageChange = (newSize: number) => {
    setPorPagina(newSize);
    setPaginaAtual(1); // Essencial: Volta para a primeira página
  };

  const sortData = (key: keyof FuncionarioExibido) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (usuariosError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Funcionários</h2> <p>{usuariosError}</p>
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
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status-funcionario"
                  checked={statusFilter === "todos"}
                  onChange={() => handleStatusChange("todos")}
                />
                Todos
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status-funcionario"
                  checked={statusFilter === "ativo"}
                  onChange={() => handleStatusChange("ativo")}
                />
                Ativo
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status-funcionario"
                  checked={statusFilter === "inativo"}
                  onChange={() => handleStatusChange("inativo")}
                />
                Inativo
              </label>
            </div>
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
        </table>
      </div>

      {totalElementos > 0 && (
        <div className="footerControls">
          {/* ATUALIZADO: A chamada do componente de paginação */}
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

export default FuncionariosPage;
