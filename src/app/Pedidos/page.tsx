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
import { Pedido } from "../utils/types/Pedido";
import { useLoading } from "../Context/LoadingContext";

const PedidosPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const codEmpresa = usuario?.empresas?.[0]?.codEmpresa || 1;

  const { pedidos, isLoading } = useGetPedidos(
    codEmpresa,
    paginaAtual,
    porPagina
  );

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(pedidos || []);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pedido;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("codPedido");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (
      query === "" &&
      dateRange.startDate === "" &&
      dateRange.endDate === ""
    ) {
      setFilteredData(pedidos || []);
    } else {
      let filtered = pedidos || [];

      if (query) {
        filtered = filtered.filter((pedido) =>
          pedido[selectedFilter]
            ?.toString()
            .toLowerCase()
            .includes(query.toLowerCase())
        );
      }

      if (dateRange.startDate && dateRange.endDate) {
        filtered = filtered.filter((pedido) => {
          const pedidoDate = new Date(pedido.dataCadastro);
          return (
            pedidoDate >= new Date(dateRange.startDate) &&
            pedidoDate <= new Date(dateRange.endDate)
          );
        });
      }

      setFilteredData(filtered);
    }
  }, [query, dateRange, pedidos, selectedFilter]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "4":
        return "Faturado";
      case "5":
        return "Cancelado";
      default:
        return "Outro Status";
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "4":
        return styles["status-invoiced"];
      case "5":
        return styles["status-canceled"];
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PEDIDOS</h1>
      <SearchBar
        placeholder="Qual pedido deseja buscar?"
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
              <option value="codPedido">Código do Pedido</option>
              <option value="codCliente">Número do Cliente</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className={styles.filterSection}>
            <label>Período que deseja ver os pedidos:</label>
            <div className={styles.dateRange}>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                placeholder="Início"
              />
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                placeholder="Fim"
              />
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
                  <tr style={{ position: "relative" }}>
                    <td>{row.codPedido}</td>
                    <td>
                      {new Date(row.dataCadastro).toLocaleDateString("pt-BR")}
                    </td>
                    <td>{formatPreco(row.valorTotal)}</td>
                    <td>{getStatusLabel(row.status)}</td>
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
                      className={`${
                        styles["status-indicator"]
                      } ${getStatusColorClass(row.status)}`}
                    />
                  </tr>
                  {expandedRow === rowIndex && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={5}>
                        <div
                          className={`${
                            styles["status-indicator"]
                          } ${getStatusColorClass(row.status)}`}
                        />
                        <div className={styles.additionalInfo}>
                          <div>
                            <p>
                              <strong>Cliente:</strong>{" "}
                              {row.codCliente.razaoSocial}
                            </p>
                            <p>
                              <strong>CNPJ/CPF:</strong>{" "}
                              {row.codCliente.cnpjCpf}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Status:</strong>{" "}
                              {getStatusLabel(row.status)}
                            </p>
                            <p>
                              <strong>Data:</strong>{" "}
                              {new Date(row.dataCadastro).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Valor Total:</strong>{" "}
                              {formatPreco(row.valorTotal)}
                            </p>
                            <p>
                              <strong>Observação:</strong>{" "}
                              {row.observacao || "Sem Observação"}
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
          {pedidos && pedidos.length > 0 && (
            <button onClick={() => setPaginaAtual(paginaAtual + 1)}>
              <FiChevronRight />
            </button>
          )}
          <div className={styles.itemsPerPageContainer}>
            <span>Pedidos por página: </span>
            <select
              value={porPagina}
              onChange={(e) => {
                setPorPagina(Number(e.target.value));
                setPaginaAtual(1);
              }}
              className={styles.itemsPerPageSelect}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidosPage;
