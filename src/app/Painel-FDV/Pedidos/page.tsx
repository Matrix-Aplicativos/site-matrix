"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../../Painel-Coletas/components/SearchBar";
import styles from "./Pedidos.module.css";
import useGetPedidos from "../hooks/useGetPedidos";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { formatPreco } from "../utils/functions/formatPreco";
import { Pedido } from "../utils/types/Pedido";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";

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

export default function PedidosPage() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [query, setQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("codPedido");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);

  const codEmpresa = usuario?.empresas?.[0]?.codEmpresa;

  const { pedidos, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetPedidos(
      codEmpresa,
      paginaAtual,
      porPagina,
      sortConfig?.key,
      sortConfig?.direction,
      selectedFilter,
      query,
      dateRange.startDate, // O input "date" já fornece o formato YYYY-MM-DD
      dateRange.endDate // O input "date" já fornece o formato YYYY-MM-DD
    );

  const filteredData = pedidos || [];

  const columns = [
    { key: "codPedido", label: "Código " },
    { key: "dataCadastro", label: "Data" },
    { key: "valorTotal", label: "Valor Total" },
    { key: "status", label: "Status" },
  ];

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
    setPaginaAtual(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPaginaAtual(1);
  };

  const sortData = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPaginaAtual(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setPorPagina(newSize);
    setPaginaAtual(1);
  };

  // --- FUNÇÃO DE LABEL MODIFICADA ---
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "1":
        return "Em aberto";
      case "2":
        return "Confirmado";
      case "3":
        return "Integrado";
      case "4":
        return "Faturado";
      case "5":
        return "Cancelado";
      default:
        return "Outro Status";
    }
  };

  // --- FUNÇÃO DE COR MODIFICADA ---
  // (Lembre-se de criar essas classes no seu CSS: status-open, status-confirmed, status-integrated)
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "1":
        return styles["status-open"]; // (Cor Verde)
      case "2":
        return styles["status-confirmed"]; // (Cor Amarela)
      case "3":
        return styles["status-integrated"]; // (Cor Vermelha)
      case "4":
        return styles["status-invoiced"];
      case "5":
        return styles["status-canceled"];
      default:
        return "";
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>PEDIDOS</h1>
        <p>Erro ao carregar pedidos: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay /> <h1 className={styles.title}>PEDIDOS</h1>
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual pedido deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />

        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => refetch()}
            title="Atualizar pedidos"
            disabled={loading || !codEmpresa}
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
              />

              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
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
                  onClick={() => sortData(col.key as keyof Pedido)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    <IconSort />
                  </div>
                </th>
              ))}
              {/* <th></th> (Removido pois não há coluna de expandir) */}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={row.codPedido}>
                {/* A classe de cor é aplicada na linha <tr> */}
                <tr className={getStatusColorClass(row.status)}>
                  <td>{row.codPedido}</td>
                  <td>
                    {new Date(row.dataCadastro).toLocaleDateString("pt-BR", {
                      timeZone: "UTC", // Garante que a data não mude por fuso
                    })}
                  </td>
                  <td>{formatPreco(row.valorTotal)}</td>
                  {/* O label do status é renderizado na célula <td> */}
                  <td>{getStatusLabel(row.status)}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={columns.length}>
                {" "}
                {/* Ajustado colSpan */}
                <PaginationControls
                  paginaAtual={paginaAtual}
                  totalPaginas={qtdPaginas || 1}
                  totalElementos={qtdElementos || 0}
                  porPagina={porPagina}
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
}
