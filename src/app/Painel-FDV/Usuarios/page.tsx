"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../../shared/components/SearchBar";
import styles from "./Usuarios.module.css";
import useGetUsuarios from "../hooks/useGetUsuarios";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { useLoading } from "../../shared/Context/LoadingContext";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import useAtivarUsuario from "../hooks/useAtivarUsuario";
import { toast } from "react-toastify";

interface ColumnDefinition {
  key: string;
  label: string;
  render?: (value: any, row: UsuarioGet, rowIndex: number) => React.ReactNode;
}

const UsuariosPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hasMoreData, setHasMoreData] = useState(true);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const { usuarios, loading, error } = useGetUsuarios(
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
      setHasMoreData(usuarios.length >= itemsPerPage);
      setFilteredData(usuarios);
    }
  }, [usuarios, itemsPerPage]);

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
      setPaginaAtual((prev) => (prev === 1 ? 2 : 1));
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
            return usuario.cpf.toLowerCase().includes(searchValue);
          case "Login":
            return usuario.login.toLowerCase().includes(searchValue);
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

  const handleNextPage = () => {
    setPaginaAtual((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPaginaAtual((prev) => Math.max(1, prev - 1));
  };

  const columns: ColumnDefinition[] = [
    {
      key: "nome",
      label: "Nome",
      render: (value) => <>{value}</>,
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <>{value}</>,
    },
    {
      key: "cpf",
      label: "CPF",
      render: (value) => <>{value}</>,
    },
    {
      key: "tipoUsuario.nome",
      label: "Tipo de Usuário",
      render: (value) => <>{value}</>,
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
            onClick={() => handleAtivarUsuario(row.codUsuario)}
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
          style={{ background: "none", border: "none", cursor: "pointer" }}
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>USUÁRIOS</h1>
      <SearchBar
        placeholder="Qual usuário deseja buscar?"
        onSearch={handleSearch}
        onFilterClick={toggleFilterExpansion}
      />
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
              <option value="Login">Login</option>
            </select>
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>
                  {col.label}
                  {col.key !== "actions" && (
                    <FaSort
                      style={{ marginLeft: "0.5em", cursor: "pointer" }}
                      onClick={() => handleSort(col.key)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr
                  className={row.ativo ? styles.activeRow : styles.inactiveRow}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(
                            col.key.includes(".")
                              ? col.key
                                  .split(".")
                                  .reduce((o: any, i) => o?.[i], row)
                              : row[col.key as keyof UsuarioGet],
                            row,
                            rowIndex
                          )
                        : col.key.includes(".")
                        ? col.key.split(".").reduce((o: any, i) => o?.[i], row)
                        : row[col.key as keyof UsuarioGet]}
                    </td>
                  ))}
                </tr>
                {expandedRow === rowIndex && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={columns.length}>
                      <div className={styles.additionalInfo}>
                        <p>
                          <strong>Código Usuário:</strong> {row.codUsuario}
                        </p>
                        <p>
                          <strong>Código ERP:</strong> {row.codUsuarioErp}
                        </p>
                        <p>
                          <strong>Nome:</strong> {row.nome}
                        </p>
                        <p>
                          <strong>CPF:</strong> {row.cpf}
                        </p>
                        <p>
                          <strong>Email:</strong> {row.email}
                        </p>
                        <p>
                          <strong>Login:</strong> {row.login}
                        </p>
                        <p>
                          <strong>Tipo de Usuário:</strong>{" "}
                          {row.tipoUsuario.nome}
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
        </table>
        <div className={styles.paginationContainer}>
          <button
            onClick={() => setPaginaAtual(1)}
            disabled={paginaAtual === 1}
          >
            <FiChevronsLeft />
          </button>

          <button onClick={handlePrevPage} disabled={paginaAtual === 1}>
            <FiChevronLeft />
          </button>

          <span>{paginaAtual}</span>

          <button onClick={handleNextPage} disabled={!hasMoreData}>
            <FiChevronRight />
          </button>

          <div className={styles.itemsPerPageContainer}>
            <span>Usuários por página: </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
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
      </div>
    </div>
  );
};

export default UsuariosPage;
