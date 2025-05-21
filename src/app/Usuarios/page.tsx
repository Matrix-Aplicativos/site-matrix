"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Usuarios.module.css";
import useGetUsuarios from "../hooks/useGetUsuarios";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { useLoading } from "../Context/LoadingContext";
import { UsuarioGet } from "../utils/types/UsuarioGet";
import useAtivarUsuario from "../hooks/useAtivarUsuario";

const UsuariosPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const { usuarios, loading, error, refetch } = useGetUsuarios(
    usuario?.empresas[0]?.codEmpresa || 1,
    paginaAtual,
    itemsPerPage
  );
  const { ativarUsuario } = useAtivarUsuario();

  const [query, setQuery] = useState("");
  const [sortedData, setSortedData] = useState<UsuarioGet[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Nome");

  useEffect(() => {
    if (usuarios) {
      setSortedData(usuarios);
    }
  }, [usuarios]);

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleAtivarUsuario = async (codUsuario: string) => {
    const { success } = await ativarUsuario(codUsuario, true);
    if (success && refetch) {
      refetch();
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    if (usuarios) {
      const filtered = usuarios.filter((usuario: UsuarioGet) => {
        if (selectedFilter === "Nome") {
          return usuario.nome.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (selectedFilter === "Email") {
          return usuario.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        if (selectedFilter === "CPF") {
          return usuario.cpf.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (selectedFilter === "Login") {
          return usuario.login
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        return true;
      });
      setSortedData(filtered);
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...sortedData].sort((a: any, b: any) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  const paginatedData = Array.isArray(sortedData)
    ? sortedData.slice(
        (paginaAtual - 1) * itemsPerPage,
        paginaAtual * itemsPerPage
      )
    : [];

  const columns = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "cpf", label: "CPF" },
    { key: "tipoUsuario.nome", label: "Tipo de Usuário" },
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
      render: (_value: any, _row: any, rowIndex: number) => (
        <button
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={() => toggleExpandRow(rowIndex)}
        >
          {expandedRow === rowIndex ? "▲" : "▼"}
        </button>
      ),
    },
  ];

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
            {paginatedData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr
                  className={row.ativo ? styles.activeRow : styles.inactiveRow}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(
                            col.key.includes(".")
                              ? col.key.split(".").reduce((o, i) => o[i], row)
                              : row[col.key as keyof UsuarioGet],
                            row,
                            rowIndex
                          )
                        : col.key.includes(".")
                        ? col.key.split(".").reduce((o, i) => o[i], row)
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
          <button onClick={() => setPaginaAtual(1)}>
            <FiChevronsLeft />
          </button>
          <button
            onClick={() => {
              if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
            }}
          >
            <FiChevronLeft />
          </button>
          <p>{paginaAtual}</p>
          {sortedData.length > paginaAtual * itemsPerPage && (
            <button onClick={() => setPaginaAtual(paginaAtual + 1)}>
              <FiChevronRight />
            </button>
          )}
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
