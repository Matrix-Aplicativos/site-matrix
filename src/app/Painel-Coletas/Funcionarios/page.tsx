"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useGetUsuarios from "../hooks/useGetUsuarios";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import SearchBar from "../components/SearchBar";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "../components/PaginationControls";
import ModalPermissoes from "../components/ModalPermissoes";
import { getCookie } from "cookies-next"; // --- ADIÇÃO 1: IMPORTS ---
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";

// --- Ícones (código omitido para brevidade) ---
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

// --- Interfaces e Constantes (código omitido para brevidade) ---
interface FuncionarioExibido {
  codigo: string;
  nome: string;
  cpf: string;
  email: string;
  status: boolean;
  originalUser: UsuarioGet;
}
type SortableColumn = keyof Omit<FuncionarioExibido, "originalUser">;
interface ColumnConfig {
  key: keyof FuncionarioExibido | "acoes";
  label: string;
  sortable: boolean;
}
const SORT_COLUMN_MAP: { [key in SortableColumn]?: string } = {
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
const columns: ColumnConfig[] = [
  { key: "codigo", label: "Código", sortable: true },
  { key: "nome", label: "Nome", sortable: true },
  { key: "cpf", label: "CPF", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "acoes", label: "Ações", sortable: false },
];
const getStatusText = (status: boolean) => (status ? "Ativo" : "Inativo");
const getStatusClass = (status: boolean) =>
  status ? styles.statusCompleted : styles.statusNotStarted;

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
    key: SortableColumn;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioGet | null>(null);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  // --- ADIÇÃO 2: BUSCA DO USUÁRIO LOGADO (LÓGICA "IMPROVISADA") ---
  const token = getCookie("token");
  const { usuario: usuarioLogado, loading: loggedUserLoading } =
    useGetLoggedUser(getUserFromToken(String(token)) || 0);
  // -------------------------------------------------------------------

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

  const isLoading = companyLoading || usuariosLoading || loggedUserLoading;

  const displayedData: FuncionarioExibido[] = useMemo(() => {
    if (!usuarios) return [];
    return usuarios.map((u) => ({
      codigo: u.codUsuarioErp,
      nome: u.nome,
      cpf: u.cpf,
      email: u.email,
      status: u.ativo,
      originalUser: u,
    }));
  }, [usuarios]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

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
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1);
  };
  const handleStatusChange = (newStatus: "todos" | "ativo" | "inativo") => {
    setStatusFilter(newStatus);
    setPaginaAtual(1);
  };
  const handleItemsPerPageChange = (newSize: number) => {
    setPorPagina(newSize);
    setPaginaAtual(1);
  };
  const sortData = (key: SortableColumn) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };
  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);

  if (usuariosError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Funcionários</h2> <p>{usuariosError}</p>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay />

      {/* --- ADIÇÃO 3: PASSANDO A PROP PARA O MODAL --- */}
      {selectedUser && usuarioLogado && (
        <ModalPermissoes
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          usuarioInfo={selectedUser}
          onSave={handleSavePermissions}
          codUsuarioLogado={usuarioLogado.codUsuario} // Prop adicionada
        />
      )}
      {/* ----------------------------------------------- */}

      <h1 className={styles.title}>FUNCIONÁRIOS</h1>
      <div className={styles.searchContainer}>
        {/* SearchBar e botões... */}
        <SearchBar
          placeholder="Qual funcionário deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => refetch()}
            title="Atualizar funcionários"
            disabled={isLoading}
          >
            <span>Atualizar</span>
            <IconRefresh className={isLoading ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          {/* Filtros... */}
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
                  onClick={() =>
                    col.sortable && sortData(col.key as SortableColumn)
                  }
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
              <tr key={row.originalUser.codFuncionario}>
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
                <td>
                  {row.originalUser.codUsuario &&
                  row.originalUser.codUsuario > 0 ? (
                    <button
                      className={styles.actionButton}
                      onClick={() => handleOpenModal(row.originalUser)}
                    >
                      Permissões
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalElementos > 0 && (
        <div className="footerControls">
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
