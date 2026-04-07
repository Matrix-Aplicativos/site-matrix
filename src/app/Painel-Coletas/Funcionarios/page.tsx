"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useTable from "../hooks/core/useTable";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "../components/PaginationControls";
import ModalPermissoes from "../components/ModalPermissoes";
import ColetaTable, { type ColetaTableColumn } from "../components/table/ColetaTable";
import ColetaPageShell from "../components/coleta/ColetaPageShell";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import usePatchUsuarioStatus from "../hooks/usePatchUsuarioStatus";
import { FiPower } from "react-icons/fi";
import {
  FuncionarioExibido,
  FuncionarioSortableColumn,
  FUNCIONARIO_COLUMNS,
  FUNCIONARIO_FILTER_TO_API_PARAM,
  FUNCIONARIO_SORT_COLUMN_MAP,
  getFuncionarioStatusText,
} from "../domain/funcionarioTableConfig";

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

const getStatusClass = (status: boolean) =>
  status ? styles.statusCompleted : styles.statusNotStarted;

const FuncionariosPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "ativo" | "inativo"
  >("todos");
  const [selectedFilter, setSelectedFilter] =
    useState<keyof FuncionarioExibido>("nome");
  const [sortConfig, setSortConfig] = useState<{
    key: FuncionarioSortableColumn;
    direction: "asc" | "desc";
  } | null>({ key: "nome", direction: "asc" });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioGet | null>(null);
  const [localUsuarios, setLocalUsuarios] = useState<UsuarioGet[]>([]);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const { toggleStatus, loading: patching } = usePatchUsuarioStatus();

  const codEmpresa = empresa?.codEmpresa;
  const token = getCookie("token");

  const { usuario: usuarioLogado } = useGetLoggedUser(
    getUserFromToken(String(token)) || 0,
  );

  const filtrosParaApi = useMemo(() => {
    const filtros: Record<string, string | boolean> = {};
    if (query) {
      const apiParamKey = FUNCIONARIO_FILTER_TO_API_PARAM[selectedFilter];
      if (apiParamKey) {
        filtros[apiParamKey] = query;
      }
    }
    if (statusFilter !== "todos") {
      filtros.ativo = statusFilter === "ativo";
    }
    return filtros;
  }, [query, selectedFilter, statusFilter]);

  const table = useTable<UsuarioGet>({
    codEmpresa,
    enabled: !!codEmpresa,
    endpoint: ({ codEmpresa: company }) => `/usuario/empresa/${company}`,
    queryParamsBuilder: ({ page, pageSize, sort }) => {
      const params = new URLSearchParams({
        pagina: String(page),
        porPagina: String(pageSize),
      });
      if (sort) {
        params.append("orderBy", sort.key);
        params.append("direction", sort.direction);
      }
      Object.entries(filtrosParaApi).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      return params;
    },
    responseAdapter: (data) => ({
      rows: data?.conteudo || [],
      totalPages: data?.qtdPaginas || 0,
      totalItems: data?.qtdElementos || 0,
    }),
  });

  useEffect(() => {
    if (table.rows) {
      setLocalUsuarios(table.rows);
    }
  }, [table.rows]);

  const isLoading = companyLoading || table.loading || patching;

  const displayedData: FuncionarioExibido[] = useMemo(() => {
    if (!localUsuarios) return [];
    return localUsuarios.map((u) => ({
      codigo: u.codUsuarioErp,
      nome: u.nome,
      cpf: u.cpf,
      email: u.email,
      status: u.ativo,
      originalUser: u,
    }));
  }, [localUsuarios]);

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
    table.reload();
  };

  const handleStatusToggle = async (
    codUsuario: number,
    currentStatus: boolean,
  ) => {
    const novoStatus = !currentStatus;
    setLocalUsuarios((prevList) =>
      prevList.map((user) =>
        user.codUsuario === codUsuario
          ? ({ ...user, ativo: novoStatus } as UsuarioGet)
          : user,
      ),
    );

    const sucesso = await toggleStatus(codUsuario, novoStatus);

    if (!sucesso) {
      // Reverte se der erro
      setLocalUsuarios((prevList) =>
        prevList.map((user) =>
          user.codUsuario === codUsuario
            ? ({ ...user, ativo: currentStatus } as UsuarioGet)
            : user,
        ),
      );
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    table.setFilters({});
  };

  const handleStatusChange = (newStatus: "todos" | "ativo" | "inativo") => {
    setStatusFilter(newStatus);
    table.setPage(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    table.setPageSize(newSize);
  };

  const sortData = (key: FuncionarioSortableColumn) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    table.setSort(FUNCIONARIO_SORT_COLUMN_MAP[key] || key);
  };

  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);

  if (table.error) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Funcionários</h2> <p>{table.error}</p>
        <button onClick={() => table.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay />

      {selectedUser && usuarioLogado && (
        <ModalPermissoes
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          usuarioInfo={selectedUser}
          onSave={handleSavePermissions}
          codUsuarioLogado={usuarioLogado.codUsuario}
          codEmpresa={codEmpresa || 0}
        />
      )}

      <ColetaPageShell
        title={`FUNCIONÁRIOS - ${empresa?.nomeFantasia?.toUpperCase() ?? ""}`}
        titleClassName={styles.title}
        searchPlaceholder="Qual funcionário deseja buscar?"
        onSearch={handleSearch}
        onFilterToggle={toggleFilterExpansion}
        actions={
          <div className={styles.searchActions}>
            <button className={styles.actionButton} onClick={() => table.reload()} title="Atualizar funcionários" disabled={isLoading}>
              <span>Atualizar</span>
              <IconRefresh className={isLoading ? styles.spinning : ""} />
            </button>
          </div>
        }
        filterPanel={isFilterExpanded && (
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
        table={<ColetaTable
        className={styles.tableContainer}
        tableClassName={styles.table}
        columns={
          FUNCIONARIO_COLUMNS.filter((col) => col.key !== "acoes").map((col) => {
            if (col.key === "status") {
              return {
                ...col,
                render: (row: FuncionarioExibido) => (
                  <span className={`${styles.statusBadge} ${getStatusClass(row.status)}`}>
                    {getFuncionarioStatusText(row.status)}
                  </span>
                ),
              };
            }
            return col;
          }) as ColetaTableColumn<FuncionarioExibido>[]
        }
        rows={displayedData}
        onSort={(key) => sortData(key as FuncionarioSortableColumn)}
        getRowId={(row) => row.originalUser.codFuncionario}
        renderSortIcon={() => <IconSort />}
        renderActions={(row) => (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {row.originalUser.codUsuario && row.originalUser.codUsuario > 0 ? (
              <>
                <button className={styles.actionButton} onClick={() => handleOpenModal(row.originalUser)} title="Gerenciar Permissões" style={{ padding: "4px 8px", fontSize: "0.85rem" }}>Permissões</button>
                {!row.status && (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleStatusToggle(row.originalUser.codUsuario as number, row.status)}
                    disabled={patching}
                    style={{ padding: "4px 8px", fontSize: "0.85rem", color: "#2ecc71", borderColor: "#2ecc71" }}
                    title="Ativar Usuário"
                  >
                    <FiPower style={{ marginRight: 4 }} />
                    Ativar
                  </button>
                )}
              </>
            ) : (
              "—"
            )}
          </div>
        )}
      />}
        pagination={table.totalItems > 0 ? (
          <div className="footerControls">
            <PaginationControls
            paginaAtual={table.page}
            totalPaginas={table.totalPages}
            totalElementos={table.totalItems}
            porPagina={table.pageSize}
            onPageChange={table.setPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        ) : null}
      />
    </div>
  );
};

export default FuncionariosPage;
