"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Pedidos.module.css";
import useGetPedidos from "../hooks/useGetPedidos";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { FiChevronsLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { formatPreco } from "../utils/functions/formatPreco";

const PedidosPage: React.FC = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const { pedidos } = useGetPedidos(
    usuario?.empresas[0].codEmpresa || 1,
    paginaAtual
  );
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(pedidos || []);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pedido;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    if (query === "") {
      setFilteredData(pedidos || []);
    }
  }, [query, pedidos]);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const sortData = (key: keyof Pedido) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    const sortedData = [...(filteredData || [])].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PEDIDOS</h1>
      <SearchBar
        placeholder="Qual produto deseja buscar?"
        onSearch={handleSearch}
        onFilterClick={toggleFilterExpansion}
      />
      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          {/* Primeira parte */}
          <div className={styles.filterSection}>
            <label>Buscar por:</label>
            <input type="number" placeholder="Código do Pedido" />
          </div>

          {/* Segunda parte */}
          <div className={styles.filterSection}>
            <label>Filtrar por:</label>
            <select aria-placeholder="Status">
              <option value="">Status</option>
            </select>
            <select aria-placeholder="Cliente">
              <option value="">Cliente</option>
            </select>
          </div>

          {/* Terceira parte */}
          <div className={styles.filterSection}>
            <label>Período que deseja ver os pedidos:</label>
            <div className={styles.dateRange}>
              <input type="date" placeholder="Início" />
              <input type="date" placeholder="Fim" />
            </div>
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => sortData("codPedido")}>
                Código do Pedido <FaSort />
              </th>
              <th onClick={() => sortData("dataCadastro")}>
                Data <FaSort />
              </th>
              <th onClick={() => sortData("valorTotal")}>
                Valor Total <FaSort />
              </th>
              <th onClick={() => sortData("status")}>
                Status <FaSort />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData &&
              filteredData.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <tr>
                    <td>{row.codPedido}</td>
                    <td>
                      {new Date(row.dataCadastro).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{formatPreco(row.valorTotal)}</td>
                    <td>
                      {row.status === "1"
                        ? "Recebido"
                        : row.status === "2"
                        ? "Transmitido"
                        : "Cancelado"}
                    </td>
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
                  </tr>
                  {expandedRow === rowIndex && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={5}>
                        <div className={styles.additionalInfo}>
                          <div>
                            <p>
                              <strong>Cliente:</strong> {row.codCliente}
                            </p>
                            <p>
                              <strong>Status:</strong> {row.status}
                            </p>
                            <p>
                              <strong>Observação:</strong> {row.observacao}
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
          <button onClick={() => setPaginaAtual(1)}>
            <FiChevronsLeft />
          </button>
          <button
            onClick={() => paginaAtual > 1 && setPaginaAtual(paginaAtual - 1)}
          >
            <FiChevronLeft />
          </button>
          <p>{paginaAtual}</p>
          {pedidos && pedidos.length === 1 ? (
            <button onClick={() => setPaginaAtual(paginaAtual + 1)}>
              <FiChevronRight />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PedidosPage;