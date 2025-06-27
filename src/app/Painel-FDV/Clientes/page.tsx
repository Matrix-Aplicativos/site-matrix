"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../../shared/components/SearchBar";
import styles from "./Clientes.module.css";
import useGetClientes from "../hooks/useGetClientes";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { formatCnpjCpf } from "../utils/functions/formatCnpjCpf";
import { formatTelefone } from "../utils/functions/formatTelefone";
import { formatCep } from "../utils/functions/formatCep";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";

const ClientesPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [hasMoreData, setHasMoreData] = useState(true);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const { clientes, loading, error } = useGetClientes(
    usuario?.empresas[0]?.codEmpresa || 1,
    paginaAtual,
    porPagina
  );

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [sortedData, setSortedData] = useState<any[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  } | null>(null);
  const [searchTopic, setSearchTopic] = useState<string>("RazaoSocial");

  useEffect(() => {
    if (clientes) {
      // Verifica se recebemos dados para saber se há mais páginas
      setHasMoreData(clientes.length > 0);
      setFilteredData(clientes);
      setSortedData(clientes);
    }
  }, [clientes]);

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

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1); // Resetar para a primeira página ao pesquisar

    if (clientes) {
      const filtered = clientes.filter((cliente: any) => {
        const searchValue = searchQuery.toLowerCase();
        switch (searchTopic) {
          case "RazaoSocial":
            return cliente.razaoSocial.toLowerCase().includes(searchValue);
          case "CnpjCpf":
            return cliente.cnpjcpf !== null && cliente.cnpjcpf !== undefined
              ? cliente.cnpjcpf.toString().toLowerCase().includes(searchValue)
              : false;
          case "Codigo":
            return cliente.codClienteErp.toString().includes(searchValue);
          default:
            return false;
        }
      });
      setFilteredData(filtered);
      setSortedData(filtered);
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    const sorted = [...filteredData].sort((a: any, b: any) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  const handleNextPage = () => {
    setPaginaAtual((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    setPaginaAtual((prev) => Math.max(1, prev - 1));
  };

  const columns = [
    { key: "codClienteErp", label: "Código" },
    { key: "razaoSocial", label: "Razão Social" },
    { key: "nomeFantasia", label: "Nome Fantasia" },
    { key: "cnpjcpf", label: "CNPJ/CPF" },
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
      <LoadingOverlay />
      <h1 className={styles.title}>CLIENTES</h1>
      <SearchBar
        placeholder="Qual cliente deseja buscar?"
        onSearch={handleSearch}
        onFilterClick={toggleFilterExpansion}
      />
      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          <div className={styles.filterSection}>
            <label>Buscar por:</label>
            <select
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
            >
              <option value="RazaoSocial">Razão Social</option>
              <option value="CnpjCpf">CNPJ/CPF</option>
              <option value="Codigo">Código</option>
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
            {sortedData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr style={{ position: "relative" }}>
                  <td>{row.codClienteErp}</td>
                  <td>{row.razaoSocial}</td>
                  <td>{row.nomeFantasia}</td>
                  <td>{formatCnpjCpf(row.cnpjcpf)}</td>
                  <td>
                    <button
                      onClick={() => toggleExpandRow(rowIndex)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {expandedRow === rowIndex ? "▲" : "▼"}
                    </button>
                  </td>
                  <div
                    className={`${styles["status-indicator"]} ${
                      row.status === "A"
                        ? styles["status-active"]
                        : styles["status-inactive"]
                    }`}
                  />
                </tr>
                {expandedRow === rowIndex && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={columns.length}>
                      <div
                        className={`${styles["status-indicator"]} ${
                          row.status === "A"
                            ? styles["status-active"]
                            : styles["status-inactive"]
                        }`}
                      />
                      <div className={styles.additionalInfo}>
                        <div>
                          <p>
                            <strong>Razão Social:</strong> {row.razaoSocial}
                          </p>
                          <p>
                            <strong>Nome Fantasia:</strong> {row.nomeFantasia}
                          </p>
                          <p>
                            <strong>CNPJ/CPF:</strong>{" "}
                            {formatCnpjCpf(row.cnpjcpf)}
                          </p>
                          <p>
                            <strong>Telefone:</strong>{" "}
                            {formatTelefone(row.fone1)}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Email:</strong> {row.email}
                          </p>
                          <p>
                            <strong>Endereço:</strong> {row.endereco}
                          </p>
                          <p>
                            <strong>Complemento:</strong>{" "}
                            {row.complemento || "Nenhum"}
                          </p>
                          <p>
                            <strong>CEP:</strong>{" "}
                            {formatCep(row.cep) || "Não informado"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Município (IBGE):</strong>{" "}
                            {row.municipio.codMunicipio}
                          </p>
                          <p>
                            <strong>Status:</strong> {row.status}
                          </p>
                          <p>
                            <strong>Território:</strong>{" "}
                            {row.territorio?.descricao ?? "Sem Território"}
                          </p>
                          <p>
                            <strong>Rota:</strong>{" "}
                            {row.rota?.descricao ?? "Sem Rota"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Segmento:</strong>{" "}
                            {row.segmento?.descricao ?? "Sem Segmento"}
                          </p>
                          <p>
                            <strong>Classificação:</strong>{" "}
                            {row.classificacao?.descricao ??
                              "Sem classificação"}
                          </p>
                        </div>
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
            onClick={(e) => {
              if (paginaAtual >= 2) {
                e.preventDefault();
                setPaginaAtual(1);
              }
            }}
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
            <span>Clientes por página: </span>
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
      </div>
    </div>
  );
};

export default ClientesPage;
