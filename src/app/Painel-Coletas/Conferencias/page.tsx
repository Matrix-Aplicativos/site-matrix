"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetColetas from "../hooks/useGetColetas";
import useCurrentCompany from "../hooks/useCurrentCompany";
import ExpandedRowContent from "../components/ExpandedRow";

// --- Componentes SVG para os ícones ---

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

const IconSync = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="#1565c0"
    className="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
    />
  </svg>
);

// --- Interfaces e Constantes ---

interface ColumnConfig {
  key: keyof ColetaExibida;
  label: string;
  sortable: boolean;
}

interface ColetaExibida {
  id: number;
  codConferenciaErp: string;
  descricao: string;
  data: string;
  dataFim: string | null;
  origem: string;
  tipoMovimento: string;
  usuario: string;
  status: string;
  alocOrigem: string;
  alocDestino: string;
  integradoErp: boolean; // Propriedade adicionada
}

const SORT_COLUMN_MAP: { [key in keyof ColetaExibida]?: string } = {
  id: "codColeta", // CORRIGIDO: Este é o nome que a API espera para a ordenação
  descricao: "descricao",
  data: "dataCadastro",
  origem: "origem",
  tipoMovimento: "tipo",
  status: "status",
  usuario: "usuario",
};

const TIPOS_DE_COLETA = ["3", "4"];

// --- Componente Principal ---

const ConferenciasPage: React.FC = () => {
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

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

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
    TIPOS_DE_COLETA,
    undefined, // Parametro 'integradoErp' do hook
    !!codEmpresa
  );

  const isLoading = companyLoading || coletasLoading;
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
        return "Não Iniciada";
      case "2":
        return "Finalizada Parcialmente";
      case "3":
        return "Finalizada Completa";
      case "4":
        return "Em Andamento";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "1":
        return styles.statusNotStarted;
      case "2":
        return styles.statusPartial;
      case "3":
        return styles.statusCompleted;
      case "4":
        return styles.statusInProgress;
      default:
        return "";
    }
  };

  const filteredData = useMemo(() => {
    if (!coletas) return [];

    const convertedData = coletas
      .filter((c) => TIPOS_DE_COLETA.includes(String(c.tipo)))
      .map((c) => ({
        id: c.codConferencia,
        codConferenciaErp: c.codConferenciaErp,
        descricao: c.descricao,
        data: c.dataCadastro,
        dataFim: c.dataFim,
        origem: String(c.origem),
        tipoMovimento: String(c.tipo),
        usuario: c.usuario?.nome || "Usuário não informado",
        status: c.status,
        alocOrigem: c.alocOrigem?.descricao || "Não informada",
        alocDestino: c.alocDestino?.descricao || "Não informada",
        integradoErp: c.integradoErp, // Mapeando o novo campo
      }));

    let result = [...convertedData];

    if (query) {
      result = result.filter((coleta) => {
        let fieldValue =
          coleta[selectedFilter as keyof ColetaExibida]?.toString() || "";
        if (selectedFilter === "origem") fieldValue = getOrigemText(fieldValue);
        else if (selectedFilter === "status")
          fieldValue = getStatusText(fieldValue);
        return fieldValue.toLowerCase().includes(query.toLowerCase());
      });
    }

    if (dateRange.startDate && dateRange.endDate) {
      result = result.filter((coleta) => {
        const coletaDate = new Date(coleta.data);
        return (
          coletaDate >= new Date(dateRange.startDate) &&
          coletaDate <= new Date(dateRange.endDate)
        );
      });
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [coletas, query, dateRange, selectedFilter, sortConfig]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
    setPaginaAtual(1);
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

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (coletasError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Conferências</h2>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  }

  if (companyLoading || (!coletas && coletasLoading)) {
    return <div className={styles.container}>Carregando dados...</div>;
  }

  const columns: ColumnConfig[] = [
    { key: "status", label: "Status", sortable: false },
    { key: "id", label: "Código", sortable: true },
    { key: "data", label: "Data", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "origem", label: "Origem", sortable: true },
    { key: "tipoMovimento", label: "Tipo de Movimento", sortable: true },
    { key: "usuario", label: "Responsável", sortable: true },
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
            onClick={() => refetch()}
            title="Atualizar conferências"
          >
            <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
            <IconRefresh className={coletasLoading ? styles.spinning : ""} />
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
                  onClick={() => col.sortable && sortData(col.key)}
                  style={{ cursor: col.sortable ? "pointer" : "default" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.sortable && <IconSort />}
                  </div>
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
                  <td>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        row.status
                      )}`}
                    >
                      {getStatusText(row.status)}
                    </span>
                  </td>
                  <td>{row.id}</td>
                  <td>{new Date(row.data).toLocaleDateString("pt-BR")}</td>
                  <td>{row.descricao}</td>
                  <td>{getOrigemText(row.origem)}</td>
                  <td>{getTipoMovimentoText(row.tipoMovimento)}</td>
                  <td>{row.usuario}</td>
                  <td className={styles.actionsCell}>
                    {row.integradoErp && (
                      <span
                        className={styles.syncIcon}
                        title="Integrado com ERP"
                      >
                        <IconSync />
                      </span>
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
                      <ExpandedRowContent coletaId={row.id} />
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
                      &lt;&lt;
                    </button>
                    <button
                      onClick={handlePrevPage}
                      disabled={paginaAtual === 1}
                    >
                      &lt;
                    </button>
                    <span>{paginaAtual}</span>
                    <button onClick={handleNextPage} disabled={!hasMoreData}>
                      &gt;
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
