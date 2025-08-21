"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Conferencias.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetColetas from "../hooks/useGetColetas";
import deleteColetaAvulsaHook from "../hooks/useDeleteColetaAvulsa";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { getCookie } from "cookies-next";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { getUserFromToken } from "@/app/getUserFromToken";

interface ColetaExibida {
  id: number;
  codConferenciaErp: string;
  descricao: string;
  data: string;
  dataFim: string;
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

const SORT_COLUMN_MAP: { [key in keyof ColetaExibida]?: string } = {
  descricao: "descricao",
  data: "dataCadastro",
  origem: "origem",
  tipoMovimento: "tipo",
  status: "status",
};

const ConferenciasPage: React.FC = () => {
  // Estados da página
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [selectedFilter, setSelectedFilter] = useState("descricao");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ColetaExibida;
    direction: "asc" | "desc";
  } | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentItemPages, setCurrentItemPages] = useState<{
    [key: number]: number;
  }>({});

  // Contexto e hooks
  const { showLoading, hideLoading } = useLoading();
  const { codEmpresa, loading: companyLoading } = useCurrentCompany();
  const token = getCookie("token");
  const { usuario } = useGetLoggedUser(getUserFromToken(String(token)) || 0);

  const {
    coletas,
    loading: coletasLoading,
    error: coletasError,
    refetch,
  } = useGetColetas(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? String(SORT_COLUMN_MAP[sortConfig.key]) : undefined,
    sortConfig?.direction,
    ["3", "4"],
    !!codEmpresa
  );

  // Hook para deletar coletas
  const {
    deletarColeta,
    loading: deleting,
    error: deleteError,
  } = deleteColetaAvulsaHook();

  // Estados combinados
  const isLoading = companyLoading || coletasLoading || deleting;
  const hasMoreData = coletas ? coletas.length >= porPagina : false;
  const codUsuario = usuario?.codUsuario || 0;

  // Funções auxiliares
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
        return "Inventário";
      case "2":
        return "Transferência";
      case "3":
        return "Conferência de Venda";
      case "4":
        return "Conferência de Compra";
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

  // Filtragem e ordenação
  const filteredData = useMemo(() => {
    if (!coletas) return [];

    const convertedData = coletas
      .filter((c) => ["3", "4"].includes(String(c.tipo)))
      .map((c) => ({
        id: c.codConferencia,
        codConferenciaErp: c.codConferenciaErp,
        descricao: c.descricao,
        data: c.dataCadastro,
        dataFim: c.dataFim,
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

    let result = [...convertedData];

    // Filtro por texto
    if (query) {
      result = result.filter((coleta) => {
        let fieldValue =
          coleta[selectedFilter as keyof ColetaExibida]?.toString();

        if (selectedFilter === "origem") fieldValue = getOrigemText(fieldValue);
        else if (selectedFilter === "status")
          fieldValue = getStatusText(fieldValue);

        return fieldValue.toLowerCase().includes(query.toLowerCase());
      });
    }

    // Filtro por data
    if (dateRange.startDate && dateRange.endDate) {
      result = result.filter((coleta) => {
        const coletaDate = new Date(coleta.data);
        return (
          coletaDate >= new Date(dateRange.startDate) &&
          coletaDate <= new Date(dateRange.endDate)
        );
      });
    }

    // Ordenação
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [coletas, query, dateRange, selectedFilter, sortConfig]);

  // Outros handlers
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
    setPaginaAtual(1);
  };

  const handleNextItemPage = (coletaId: number, totalItems: number) => {
    setCurrentItemPages((prev) => ({
      ...prev,
      [coletaId]: Math.min(
        (prev[coletaId] || 0) + 1,
        Math.ceil(totalItems / 3) - 1
      ),
    }));
  };

  const handlePrevItemPage = (coletaId: number) => {
    setCurrentItemPages((prev) => ({
      ...prev,
      [coletaId]: Math.max((prev[coletaId] || 0) - 1, 0),
    }));
  };

  const sortData = (key: keyof ColetaExibida) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prev) => (prev === index ? null : index));
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

  // Efeitos
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  if (coletasError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar conferências</h2>
        <button onClick={refetch}>Tentar novamente</button>
      </div>
    );
  }

  // Loading state
  if (isLoading || !codEmpresa) {
    return <div className={styles.container}>Carregando dados...</div>;
  }

  // Colunas da tabela
  const columns = [
    { key: "descricao", label: "Descrição" },
    { key: "data", label: "Data" },
    { key: "origem", label: "Origem" },
    { key: "tipoMovimento", label: "Tipo de Movimento" },
  ];

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>CONFERÊNCIAS</h1>

      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual conferência deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.refreshButton}
            onClick={refetch}
            title="Atualizar conferências"
          >
            <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
            <FiRefreshCw className={isLoading ? styles.spinning : ""} />
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
              <option value="descricao">Descrição</option>
              <option value="origem">Origem</option>
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
                            {row.itens
                              .slice(
                                (currentItemPages[row.id] || 0) * 3,
                                ((currentItemPages[row.id] || 0) + 1) * 3
                              )
                              .map((item, index) => (
                                <div key={index} className={styles.itemCard}>
                                  <p>
                                    <strong>Item:</strong> {item.descricaoItem}
                                  </p>
                                  <p>
                                    <strong>Cód. Barras:</strong>{" "}
                                    {item.codBarra}
                                  </p>
                                  <p>
                                    <strong>Qtd.:</strong> {item.qtdConferida}
                                  </p>
                                </div>
                              ))}
                          </div>
                          {row.itens.length > 3 && (
                            <div className={styles.itemPagination}>
                              <button
                                onClick={() => handlePrevItemPage(row.id)}
                                disabled={(currentItemPages[row.id] || 0) === 0}
                              >
                                <FiChevronLeft />
                              </button>
                              <span>
                                Página {(currentItemPages[row.id] || 0) + 1} de{" "}
                                {Math.ceil(row.itens.length / 3)}
                              </span>
                              <button
                                onClick={() =>
                                  handleNextItemPage(row.id, row.itens.length)
                                }
                                disabled={
                                  (currentItemPages[row.id] || 0) >=
                                  Math.ceil(row.itens.length / 3) - 1
                                }
                              >
                                <FiChevronRight />
                              </button>
                            </div>
                          )}
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

export default ConferenciasPage;
