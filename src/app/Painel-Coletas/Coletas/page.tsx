"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../../shared/components/SearchBar";
import styles from "./Coletas.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiTrash2,
} from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetColetas from "../hooks/useGetColetas";
import deleteColetaAvulsaHook from "../hooks/useDeleteColetaAvulsa";

const codEmpresa = 1;

interface ColetaExibida {
  id: number;
  codConferenciaErp: string;
  descricao: string;
  data: string;
  origem: string;
  tipoMovimento: string;
  usuario: string;
  quantidade: number;
  status: string;
  alocOrigem: string;
  alocDestino: string;
  itens: {
    descricaoItem: string;
    qtdConferida: number;
    codBarra: string;
  }[];
}

const SORT_COLUMN_MAP: { [key in keyof ColetaExibida]?: number } = {
  descricao: 1,
  data: 2,
  origem: 3,
  tipoMovimento: 4,
  status: 5,
  usuario: 6,
  quantidade: 7,
};

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
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction
  );
  const {
    deletarColeta,
    loading: deleting,
    error: deleteError,
  } = deleteColetaAvulsaHook();
  const hasMoreData = coletas ? coletas.length >= porPagina : false;

  const getOrigemText = (origem: string) => {
    switch (origem) {
      case "1":
        return "Sob Demanda";
      case "2":
        return "Avulsa";
      default:
        return origem;
    }
  };

  const getTipoMovimentoText = (tipoMovimento: string) => {
    switch (tipoMovimento) {
      case "1":
        return "Transferência";
      case "2":
        return "Inventário";
      default:
        return tipoMovimento;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "1":
        return "Pendente";
      case "2":
        return "Em Andamento";
      case "3":
        return "Concluída";
      default:
        return status;
    }
  };

  const convertColetas = (): ColetaExibida[] => {
    if (!coletas) return [];
    return coletas.map((c) => ({
      id: c.codConferencia,
      codConferenciaErp: c.codConferenciaErp,
      descricao: c.descricao,
      data: c.dataCadastro,
      origem: String(c.origem),
      tipoMovimento: String(c.tipo),
      usuario: c.usuario?.nome || "Usuário não informado",
      quantidade: c.itens.length,
      status: c.status,
      alocOrigem: c.alocOrigem?.descricao || "Não informada",
      alocDestino: c.alocDestino?.descricao || "Não informada",
      itens: c.itens.map((item) => ({
        descricaoItem: item.descricaoItem,
        qtdConferida: item.qtdConferida,
        codBarra: item.codBarra,
      })),
    }));
  };

  const handleDeleteColeta = async (codColeta: number) => {
    if (window.confirm("Tem certeza que deseja excluir essa coleta?")) {
      try {
        await deletarColeta(codEmpresa, codColeta);
        alert("Coleta excluída com sucesso!");
      } catch (error) {
        alert(`Erro ao excluir coleta`);
      }
    }
  };

  useEffect(() => {
    let data = convertColetas();

    if (query) {
      data = data.filter((coleta) => {
        let fieldValue =
          coleta[selectedFilter as keyof ColetaExibida]?.toString();

        if (selectedFilter === "origem") {
          fieldValue = getOrigemText(fieldValue);
        } else if (selectedFilter === "tipoMovimento") {
          fieldValue = getTipoMovimentoText(fieldValue);
        } else if (selectedFilter === "status") {
          fieldValue = getStatusText(fieldValue);
        }

        return fieldValue.toLowerCase().includes(query.toLowerCase());
      });
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
    setPaginaAtual((prev) => prev + 1);
  };

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  const columns = [
    { key: "descricao", label: "Descrição" },
    { key: "data", label: "Data" },
    { key: "origem", label: "Origem" },
    { key: "tipoMovimento", label: "Tipo de Movimento" },
  ];

  return (
    <div className={styles.container}>
      {loading && <LoadingOverlay />}
      <h1 className={styles.title}>COLETAS</h1>
      <SearchBar
        placeholder="Qual conferência deseja buscar?"
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
              <option value="status">Status</option>
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
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => sortData(col.key as keyof ColetaExibida)}
                >
                  {col.label} <FaSort style={{ marginLeft: "0.5em" }} />
                </th>
              ))}
              <th>Ações</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                <tr>
                  <td>{row.descricao}</td>
                  <td>{new Date(row.data).toLocaleDateString("pt-BR")}</td>
                  <td>{getOrigemText(row.origem)}</td>
                  <td>{getTipoMovimentoText(row.tipoMovimento)}</td>
                  <td className={styles.actionsCell}>
                    {row.origem === "2" && (
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColeta(row.id);
                        }}
                        title="Excluir coleta avulsa"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleExpandRow(rowIndex)}
                    >
                      {expandedRow === rowIndex ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>
                {expandedRow === rowIndex && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={columns.length + 2}>
                      <div className={styles.additionalInfo}>
                        <div className={styles.infoSection}>
                          <h3>Informações Gerais</h3>
                          <p>
                            <strong>Código ERP:</strong> {row.codConferenciaErp}
                          </p>
                          <p>
                            <strong>Status:</strong> {getStatusText(row.status)}
                          </p>
                          <p>
                            <strong>Alocação Origem:</strong> {row.alocOrigem}
                          </p>
                          <p>
                            <strong>Alocação Destino:</strong> {row.alocDestino}
                          </p>
                        </div>
                        <div className={styles.infoSection}>
                          <h3>Responsável</h3>
                          <p>
                            <strong>Nome:</strong> {row.usuario}
                          </p>
                          <p>
                            <strong>Data:</strong>{" "}
                            {new Date(row.data).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className={styles.infoSection}>
                          <h3>Itens ({row.quantidade})</h3>
                          <div className={styles.itemsContainer}>
                            {row.itens.slice(0, 3).map((item, index) => (
                              <div key={index} className={styles.itemCard}>
                                <p>
                                  <strong>Item:</strong> {item.descricaoItem}
                                </p>
                                <p>
                                  <strong>Cód. Barras:</strong> {item.codBarra}
                                </p>
                                <p>
                                  <strong>Qtd.:</strong> {item.qtdConferida}
                                </p>
                              </div>
                            ))}
                            {row.itens.length > 3 && (
                              <div className={styles.moreItems}>
                                +{row.itens.length - 3} itens...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={columns.length + 2}>
                <div className={styles.paginationContainer}>
                  <div className={styles.paginationControls}>
                    <button
                      onClick={() => setPaginaAtual(1)}
                      disabled={paginaAtual === 1}
                    >
                      <FiChevronsLeft />
                    </button>
                    <button
                      onClick={handlePrevPage}
                      disabled={paginaAtual === 1}
                    >
                      <FiChevronLeft />
                    </button>
                    <span>{paginaAtual}</span>
                    <button onClick={handleNextPage} disabled={!hasMoreData}>
                      <FiChevronRight />
                    </button>
                  </div>
                  <div className={styles.itemsPerPageContainer}>
                    <span>Itens por página: </span>
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
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ColetasPage;
