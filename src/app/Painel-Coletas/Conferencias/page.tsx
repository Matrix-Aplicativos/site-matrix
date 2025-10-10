"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetColetas, { Coleta } from "../hooks/useGetColetas";
import useCurrentCompany from "../hooks/useCurrentCompany";
import ExpandedRowContent from "../components/ExpandedRow";
import PaginationControls from "../components/PaginationControls";

// --- Componentes SVG ---
const IconRefresh = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1565c0"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <polyline points="23 4 23 10 17 10"></polyline>{" "}
    <polyline points="1 20 1 14 7 14"></polyline>{" "}
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L20.49 10M3.51 14l-2.02 4.64A9 9 0 0 0 18.49 15"></path>{" "}
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
    {" "}
    <path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"></path>{" "}
  </svg>
);
const IconSync = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="#1565c0"
    style={{ width: 24, height: 24 }}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
    />{" "}
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
  integradoErp: boolean;
  qtdItens: number;
  volumeTotal: number;
}
const SORT_COLUMN_MAP: { [key in keyof ColetaExibida]?: string } = {
  id: "codColeta",
  descricao: "descricao",
  data: "dataCadastro",
  origem: "origem",
  tipoMovimento: "tipo",
  status: "situacao",
  usuario: "funcionario",
  volumeTotal: "volumeTotal",
};

const TIPOS_DE_COLETA = ["3", "4"];

const OPCOES_STATUS = {
  "Não Iniciada": "1",
  "Em Andamento": "4",
  "Finalizada Parcialmente": "2",
  "Finalizada Completa": "3",
};

const OPCOES_ORIGEM = {
  "Sob Demanda": "1",
  Avulsa: "2",
};

const ConferenciasPage: React.FC = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ColetaExibida;
    direction: "asc" | "desc";
  } | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Estados para os filtros de rádio
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [origemFiltro, setOrigemFiltro] = useState<string>("");

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const {
    coletas,
    loading: coletasLoading,
    error: coletasError,
    refetch,
    totalPaginas,
    totalElementos,
  } = useGetColetas(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    TIPOS_DE_COLETA,
    statusFiltro || undefined,
    origemFiltro || undefined,
    "descricao",
    query,
    dateRange.startDate,
    dateRange.endDate,
    !!codEmpresa
  );

  const isLoading = companyLoading || coletasLoading;

  const getOrigemText = (origem: string) =>
    origem === "1" ? "Sob Demanda" : origem === "2" ? "Avulsa" : origem;
  const getTipoMovimentoText = (tipo: string) => {
    switch (tipo) {
      case "3":
        return "Conf. Venda";
      case "4":
        return "Conf. Compra";
      default:
        return tipo;
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
    return coletas.map((c) => ({
      id: c.codConferencia,
      codConferenciaErp: c.codConferenciaErp,
      descricao: c.descricao,
      data: c.dataCadastro,
      dataFim: c.dataFim,
      origem: String(c.origem),
      tipoMovimento: String(c.tipo),
      usuario: c.usuario?.nome || "Usuário não informado",
      status: c.status,
      integradoErp: c.integradoErp,
      qtdItens: c.qtdItens,
      volumeTotal: c.volumeTotal,
    }));
  }, [coletas]);

  const handleStatusChange = (statusValue: string) => {
    setStatusFiltro(statusValue);
    setPaginaAtual(1);
  };

  const handleOrigemChange = (origemValue: string) => {
    setOrigemFiltro(origemValue);
    setPaginaAtual(1);
  };

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

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (coletasError) {
    return (
      <div className={styles.container}>
        {" "}
        <h2>Erro ao Carregar Conferências</h2>{" "}
        <button onClick={() => refetch()}>Tentar novamente</button>{" "}
      </div>
    );
  }
  if (companyLoading || (!coletas && coletasLoading)) {
    return <div className={styles.container}>Carregando dados...</div>;
  }

  const columns: ColumnConfig[] = [
    { key: "status", label: "Status", sortable: false },
    { key: "qtdItens", label: "Qtd. Itens", sortable: false },
    { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
    { key: "id", label: "Código", sortable: true },
    { key: "data", label: "Data", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "origem", label: "Origem", sortable: true },
    { key: "tipoMovimento", label: "Tipo", sortable: true },
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
            disabled={isLoading}
          >
            <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
            <IconRefresh className={isLoading ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          <div className={styles.filterSection}>
            <label>Status:</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status-filter"
                  checked={statusFiltro === ""}
                  onChange={() => handleStatusChange("")}
                />
                Todos
              </label>
              {Object.entries(OPCOES_STATUS).map(([label, value]) => (
                <label key={value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="status-filter"
                    checked={statusFiltro === value}
                    onChange={() => handleStatusChange(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <label>Origem:</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="origem-filter"
                  checked={origemFiltro === ""}
                  onChange={() => handleOrigemChange("")}
                />
                Todas
              </label>
              {Object.entries(OPCOES_ORIGEM).map(([label, value]) => (
                <label key={value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="origem-filter"
                    checked={origemFiltro === value}
                    onChange={() => handleOrigemChange(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
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
                    <span>{col.label}</span> {col.sortable && <IconSort />}
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
                  <td>{row.qtdItens}</td>
                  <td>{row.volumeTotal}</td>
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
        </table>
      </div>
      <PaginationControls
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        totalElementos={totalElementos}
        porPagina={porPagina}
        onPageChange={setPaginaAtual}
      />
    </div>
  );
};

export default ConferenciasPage;
