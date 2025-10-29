"use client";

import React, { useEffect, useState } from "react";

import styles from "./Usuarios.module.css";
import useGetUsuarios from "../hooks/useGetUsuarios";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
// [REMOVIDO] import { FaSort } from "react-icons/fa";
import { useLoading } from "../../shared/Context/LoadingContext";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import useAtivarUsuario from "../hooks/useAtivarUsuario";
import { toast } from "react-toastify";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";
import SearchBar from "@/app/Painel-Coletas/components/SearchBar";

// [NOVO] Ícone de Refresh do padrão
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

// [NOVO] Ícone de Sort do padrão
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

interface ColumnDefinition {
  key: string;
  label: string;
  render?: (value: any, row: UsuarioGet, rowIndex: number) => React.ReactNode;
}

const UsuariosPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // [MODIFICADO] Adicionado "refetch"
  const { usuarios, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetUsuarios(
      usuario?.empresas[0]?.codEmpresa || 1,
      paginaAtual,
      itemsPerPage,
      sortConfig?.key,
      sortConfig?.direction
    );

  const { ativarUsuario, error: activationError } = useAtivarUsuario();

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<UsuarioGet[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Nome");

  useEffect(() => {
    if (usuarios) {
      setFilteredData(usuarios);
    }
  }, [usuarios]);

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  useEffect(() => {
    if (activationError) {
      toast.error(activationError);
    }
  }, [activationError]);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleAtivarUsuario = async (codUsuario: string | number) => {
    await ativarUsuario(String(codUsuario), true, () => {
      toast.success("Usuário ativado com sucesso!");
      const currentPage = paginaAtual;
      setPaginaAtual(0);
      setTimeout(() => setPaginaAtual(currentPage), 0);
    });
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1);

    if (usuarios) {
      const filtered = usuarios.filter((usuario) => {
        const searchValue = searchQuery.toLowerCase();
        switch (selectedFilter) {
          case "Nome":
            return usuario.nome.toLowerCase().includes(searchValue);
          case "Email":
            return usuario.email.toLowerCase().includes(searchValue);
          case "CPF":
            return usuario.cpf?.toLowerCase().includes(searchValue) || false;
          default:
            return true;
        }
      });
      setFilteredData(filtered);
    }
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
    setPaginaAtual(1); // Reseta para a página 1 ao mudar a quantidade
  };

  const columns: ColumnDefinition[] = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "cpf", label: "CPF" },
    { key: "codFuncionarioErp", label: "Cód. ERP" },
    {
      key: "utilizaApp",
      label: "Usa App",
      render: (value: boolean) => (value ? "Sim" : "Não"),
    },
    {
      key: "ativo",
      label: "Status",
      render: (value: boolean, row: UsuarioGet) =>
        value ? (
          <span className={styles.statusActive}>Ativo</span>
        ) : (
          <button
            className={`${styles.actionButton} ${styles.activateButton}`}
            onClick={() =>
              handleAtivarUsuario(row.codUsuario || row.codFuncionario)
            }
          >
            Ativar
          </button>
        ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (_value: any, _row: UsuarioGet, rowIndex: number) => (
        <button
          className={styles.expandButton}
          onClick={() => toggleExpandRow(rowIndex)}
        >
          {expandedRow === rowIndex ? "▲" : "▼"}
        </button>
      ),
    },
  ];

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>USUÁRIOS</h1>
        <div className={styles.errorMessage}>
          <p>Erro ao carregar usuários: {error}</p>
        </div>
      </div>
    );
  }

  const getCellValue = (row: any, colKey: string) => {
    if (colKey.includes(".")) {
      return colKey.split(".").reduce((o: any, i) => o?.[i], row) || "N/A";
    }
    return row[colKey as keyof UsuarioGet] ?? "N/A";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>USUÁRIOS</h1>

      {/* [NOVO] Estrutura de search container + actions do padrão */}
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual usuário deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.actionButton} // Usa o actionButton padrão
            onClick={() => refetch()} // Assumindo que o hook provê refetch
            title="Atualizar usuários"
          >
            <span>Atualizar</span>
            <IconRefresh className={loading ? styles.spinning : ""} />
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
              <option value="Nome">Nome</option>
              <option value="Email">Email</option>
              <option value="CPF">CPF</option>
            </select>
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  {/* [MODIFICADO] Padrão de ícone de sort */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.key !== "actions" && col.key !== "ativo" && (
                      <IconSort />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={row.codFuncionario}>
                <tr
                  className={row.ativo ? styles.activeRow : styles.inactiveRow}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(getCellValue(row, col.key), row, rowIndex)
                        : getCellValue(row, col.key)}
                    </td>
                  ))}
                </tr>
                {expandedRow === rowIndex && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={columns.length}>
                      <div className={styles.additionalInfo}>
                        <p>
                          <strong>Código Usuário:</strong>{" "}
                          {row.codUsuario ?? "N/A"}
                        </p>
                        <p>
                          <strong>Código Funcionário:</strong>{" "}
                          {row.codFuncionario}
                        </p>
                        <p>
                          <strong>Código ERP:</strong> {row.codUsuarioErp}
                        </p>
                        <p>
                          <strong>Nome:</strong> {row.nome}
                        </p>
                        <p>
                          <strong>CPF:</strong> {row.cpf ?? "N/A"}
                        </p>
                        <p>
                          <strong>Email:</strong> {row.email}
                        </p>

                        <p>
                          <strong>Status:</strong>{" "}
                          {row.ativo ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={columns.length}>
                <PaginationControls
                  paginaAtual={paginaAtual}
                  totalPaginas={qtdPaginas || 1}
                  totalElementos={qtdElementos || 0}
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
};

export default UsuariosPage;
