"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../../shared/components/SearchBar";
import styles from "./Coletas.module.css";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetColetas from "../hooks/useGetColetas"; 

const codEmpresa = 1; 

interface ColetaExibida {
  id: number;
  descricao: string;
  data: string;
  origem: string;
  tipoMovimento: string;
  usuario: string;
  quantidade: number;
}

const ColetasPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [selectedFilter, setSelectedFilter] = useState("descricao");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ColetaExibida;
    direction: "asc" | "desc";
  } | null>(null);
  const [filteredData, setFilteredData] = useState<ColetaExibida[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { coletas, loading, error } = useGetColetas(
    codEmpresa,
    paginaAtual,
    sortConfig?.key,
    sortConfig?.direction
  );

  // Converte os dados da API para o formato de exibição
  const convertColetas = (): ColetaExibida[] => {
    if (!coletas) return [];
    return coletas.map((c) => ({
      id: c.codConferencia,
      descricao: c.descricao,
      data: c.dataInicio,
      origem: c.origem,
      tipoMovimento: String(c.tipo),
      usuario: String(c.codUsuario),
      quantidade: c.itens.length,
    }));
  };

  // Atualiza dados filtrados
  useEffect(() => {
    let data = convertColetas();

    if (query) {
      data = data.filter((coleta) =>
        coleta[selectedFilter as keyof ColetaExibida]
          ?.toString()
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    if (dateRange.startDate && dateRange.endDate) {
      data = data.filter((coleta) => {
        const coletaDate = new Date(coleta.data);
        return (
          coletaDate >= new Date(dateRange.startDate) &&
          coletaDate <= new Date(dateRange.endDate)
        );
      });
    }

    setFilteredData(data);
  }, [coletas, query, dateRange, selectedFilter]);

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

  const sortData = (key: keyof ColetaExibida) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handlePrevPage = () => {
    setPaginaAtual((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (coletas && coletas.length >= porPagina) {
      setPaginaAtual((prev) => prev + 1);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <LoadingOverlay />}
      <h1 className={styles.title}>COLETAS</h1>
      <SearchBar
        placeholder="Qual coleta deseja buscar?"
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
              <option value="descricao">Descrição</option>
              <option value="origem">Origem</option>
              <option value="tipoMovimento">Tipo de Movimento</option>
              <option value="usuario">Usuário</option>
            </select>
          </div>
          <div className={styles.filterSection}>
            <label>Período:</label>
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
              <th onClick={() => sortData("descricao")}>
                Descrição <FaSort />
              </th>
              <th onClick={() => sortData("data")}>
                Data <FaSort />
              </th>
              <th onClick={() => sortData("origem")}>
                Origem <FaSort />
              </th>
              <th onClick={() => sortData("tipoMovimento")}>
                Tipo de Movimento <FaSort />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                <tr>
                  <td>{row.descricao}</td>
                  <td>{new Date(row.data).toLocaleDateString("pt-BR")}</td>
                  <td>{row.origem}</td>
                  <td>{row.tipoMovimento}</td>
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
                            <strong>Usuário:</strong> {row.usuario}
                          </p>
                          <p>
                            <strong>Quantidade:</strong> {row.quantidade}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Data:</strong>{" "}
                            {new Date(row.data).toLocaleDateString("pt-BR")}
                          </p>
                          <p>
                            <strong>Tipo de Movimento:</strong>{" "}
                            {row.tipoMovimento}
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
          <button onClick={handlePrevPage} disabled={paginaAtual === 1}>
            <FiChevronLeft />
          </button>

          <span>{paginaAtual}</span>

          <button
            onClick={handleNextPage}
            disabled={!coletas || coletas.length < porPagina}
          >
            <FiChevronRight />
          </button>

          <div className={styles.itemsPerPageContainer}>
            <span>Coletas por página: </span>
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

export default ColetasPage;
