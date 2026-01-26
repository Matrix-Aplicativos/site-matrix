"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useGetColetas from "../hooks/useGetColetas";
import deleteColetaAvulsaHook from "../hooks/useDeleteColetaAvulsa";
import useCurrentCompany from "../hooks/useCurrentCompany";
import SearchBar from "../components/SearchBar";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import ExpandedRowContent from "../components/ExpandedRow";
import PaginationControls from "../components/PaginationControls";
import ModalCadastrarColeta from "../components/ModalCadastrarColeta";
import { FiClipboard } from "react-icons/fi";

const IconTrash = () => (
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
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

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
    strokeWidth="1.5"
    stroke="#1565c0"
    style={{ width: 24, height: 24 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
    />
  </svg>
);

interface ColetaExibida {
  id: number;
  descricao: string;
  data: string;
  dataFim: string | null;
  origem: string;
  tipoMovimento: string;
  usuario: string;
  status: string;
  integradoErp: boolean;
  qtdItens: number;
  qtdItensConferidos: number;
  volumeTotal: number;
  volumeConferido: number;
  estoqueOrigem: string;
  planoConta: string;
}

interface ColumnConfig {
  key: keyof ColetaExibida;
  label: string;
  sortable: boolean;
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
  volumeConferido: "volumeConferido",
};

const OPCOES_STATUS = {
  "Não Iniciada": "1",
  "Finalizada Parcialmente": "2",
  "Finalizada Completa": "3",
  "Em Andamento": "4",
};

const OPCOES_ORIGEM = { "Sob Demanda": "1", Avulsa: "2" };

const OPCOES_TIPO_MOVIMENTO = {
  "Ajuste Entrada": "5",
  "Ajuste Saída": "6",
};

const columns: ColumnConfig[] = [
  { key: "status", label: "Status", sortable: true },
  { key: "id", label: "Código", sortable: true },
  { key: "qtdItens", label: "Qtd. Itens", sortable: false },
  { key: "qtdItensConferidos", label: "Qtd. Itens Conf.", sortable: false },
  { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
  { key: "volumeConferido", label: "Qtd. Volume Conf.", sortable: true },
  { key: "data", label: "Data", sortable: true },
  { key: "descricao", label: "Descrição", sortable: true },
  { key: "origem", label: "Origem", sortable: true },
  { key: "estoqueOrigem", label: "Estoque", sortable: false },
  { key: "planoConta", label: "Plano Contas", sortable: false },
  { key: "tipoMovimento", label: "Tipo Mov.", sortable: true },
  { key: "usuario", label: "Responsável", sortable: true },
];

const getOrigemText = (origem: string) =>
  origem === "1" ? "Sob Demanda" : origem === "2" ? "Avulsa" : origem;

const getTipoMovimentoText = (tipo: string) => {
  switch (tipo) {
    case "5":
      return "Ajuste Entrada";
    case "6":
      return "Ajuste Saída";
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

const AjustesEstoquePage: React.FC = () => {
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
  const [statusFiltro, setStatusFiltro] = useState<string>("");
  const [origemFiltro, setOrigemFiltro] = useState<string>("");
  const [tipoMovimentoFiltro, setTipoMovimentoFiltro] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const { deletarColeta, loading: deleting } = deleteColetaAvulsaHook();

  const codEmpresa = empresa?.codEmpresa;
  const codUsuario = 1;

  const shouldFetchEntrada =
    !!codEmpresa && (!tipoMovimentoFiltro || tipoMovimentoFiltro === "5");

  const shouldFetchSaida =
    !!codEmpresa && (!tipoMovimentoFiltro || tipoMovimentoFiltro === "6");

  const tipoColetaEntrada = React.useMemo(() => ["5"], []);
  const tipoColetaSaida = React.useMemo(() => ["6"], []);

  const {
    coletas: coletasEntrada,
    loading: loadingEntrada,
    error: errorEntrada,
    refetch: refetchEntrada,
    totalPaginas: totalPaginasEntrada,
    totalElementos: totalElementosEntrada,
  } = useGetColetas(
    shouldFetchEntrada ? codEmpresa : 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    tipoColetaEntrada,
    statusFiltro || undefined,
    origemFiltro || undefined,
    "descricao",
    query,
    dateRange.startDate,
    dateRange.endDate,
    shouldFetchEntrada,
  );

  const {
    coletas: coletasSaida,
    loading: loadingSaida,
    error: errorSaida,
    refetch: refetchSaida,
    totalPaginas: totalPaginasSaida,
    totalElementos: totalElementosSaida,
  } = useGetColetas(
    shouldFetchSaida ? codEmpresa : 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    tipoColetaSaida,
    statusFiltro || undefined,
    origemFiltro || undefined,
    "descricao",
    query,
    dateRange.startDate,
    dateRange.endDate,
    shouldFetchSaida,
  );

  const coletasCombinadas = useMemo(() => {
    const entrada = shouldFetchEntrada ? coletasEntrada || [] : [];
    const saida = shouldFetchSaida ? coletasSaida || [] : [];
    return [...entrada, ...saida];
  }, [coletasEntrada, coletasSaida, shouldFetchEntrada, shouldFetchSaida]);

  const filteredData = useMemo(() => {
    if (!coletasCombinadas) return [];
    return coletasCombinadas.map((c: any) => ({
      id: c.codConferencia,
      descricao: c.descricao,
      data: c.dataCadastro,
      dataFim: c.dataFim,
      origem: String(c.origem),
      tipoMovimento: String(c.tipo),
      usuario: c.usuario?.nome || "Usuário não informado",
      status: c.status,
      integradoErp: c.integradoErp,
      qtdItens: c.qtdItens,
      qtdItensConferidos: c.qtdItensConferidos,
      volumeTotal: c.volumeTotal,
      volumeConferido: c.volumeConferido,
      estoqueOrigem: c.alocOrigem?.descricao || "-",
      planoConta: c.planoConta?.descricao || "-",
    }));
  }, [coletasCombinadas]);

  const isLoading =
    companyLoading ||
    (shouldFetchEntrada && loadingEntrada) ||
    (shouldFetchSaida && loadingSaida) ||
    deleting;

  const coletasError =
    (shouldFetchEntrada && errorEntrada) || (shouldFetchSaida && errorSaida);

  const totalElementos =
    (shouldFetchEntrada ? totalElementosEntrada || 0 : 0) +
    (shouldFetchSaida ? totalElementosSaida || 0 : 0);

  const totalPaginas = Math.max(
    shouldFetchEntrada ? totalPaginasEntrada || 1 : 1,
    shouldFetchSaida ? totalPaginasSaida || 1 : 1,
  );

  const refetchAll = React.useCallback(() => {
    if (shouldFetchEntrada) refetchEntrada();
    if (shouldFetchSaida) refetchSaida();
  }, [refetchEntrada, refetchSaida, shouldFetchEntrada, shouldFetchSaida]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const handleSuccess = useCallback(() => {
    setIsModalOpen(false);
    refetchAll();
  }, [refetchAll]);

  const handleDeleteColeta = async (codColeta: number) => {
    if (window.confirm("Tem certeza que deseja excluir esse ajuste?")) {
      try {
        await deletarColeta(codColeta);
        alert("Ajuste excluído com sucesso!");
        refetchAll();
      } catch (error) {
        alert("Erro ao excluir ajuste");
      }
    }
  };

  const handleStatusChange = (statusValue: string) => {
    setStatusFiltro(statusValue);
    setPaginaAtual(1);
  };

  const handleOrigemChange = (origemValue: string) => {
    setOrigemFiltro(origemValue);
    setPaginaAtual(1);
  };

  const handleTipoMovimentoChange = (tipoValue: string) => {
    setTipoMovimentoFiltro(tipoValue);
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

  const handleItemsPerPageChange = (newSize: number) => {
    setPorPagina(newSize);
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

  if (coletasError)
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Ajustes</h2>
        <button onClick={() => refetchAll()}>Tentar novamente</button>
      </div>
    );

  if (companyLoading || (isLoading && !coletasCombinadas.length))
    return <div className={styles.container}>Carregando dados...</div>;

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>AJUSTES DE ESTOQUE</h1>

      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual ajuste deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => setIsModalOpen(true)}
            title="Cadastrar novo ajuste"
          >
            <span>Cadastrar Ajuste</span>
            <FiClipboard />
          </button>
          <button
            className={styles.actionButton}
            onClick={() => refetchAll()}
            title="Atualizar ajustes"
          >
            <span>Atualizar</span>
            <IconRefresh className={isLoading ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      {isFilterExpanded && (
        <div className={styles.filterExpansion}>
          <div className={styles.filterSection}>
            <label>Tipo Movimento:</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tipo-movimento-filter"
                  checked={tipoMovimentoFiltro === ""}
                  onChange={() => handleTipoMovimentoChange("")}
                />
                Todos
              </label>
              {Object.entries(OPCOES_TIPO_MOVIMENTO).map(([label, value]) => (
                <label key={value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipo-movimento-filter"
                    checked={tipoMovimentoFiltro === value}
                    onChange={() => handleTipoMovimentoChange(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

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
              <th style={{ width: "40px" }}></th>

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
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                <tr>
                  <td>
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleExpandRow(rowIndex)}
                    >
                      {expandedRow === rowIndex ? "▲" : "▼"}
                    </button>
                  </td>

                  <td>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        row.status,
                      )}`}
                    >
                      {getStatusText(row.status)}
                    </span>
                  </td>
                  <td>{row.id}</td>
                  <td>{row.qtdItens}</td>
                  <td>{row.qtdItensConferidos}</td>
                  <td>{row.volumeTotal}</td>
                  <td>{row.volumeConferido}</td>
                  <td>{new Date(row.data).toLocaleDateString("pt-BR")}</td>
                  <td>{row.descricao}</td>
                  <td>{getOrigemText(row.origem)}</td>
                  <td>{row.estoqueOrigem}</td>
                  <td>{row.planoConta}</td>
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
                    {!row.dataFim && (
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColeta(row.id);
                        }}
                        title="Excluir ajuste"
                      >
                        <IconTrash />
                      </button>
                    )}
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
        onPageChange={setPaginaAtual}
        totalElementos={totalElementos}
        porPagina={porPagina}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {codEmpresa && (
        <ModalCadastrarColeta
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          codEmpresa={codEmpresa}
          codUsuario={codUsuario}
          tipoColeta={5}
          titulo="Cadastrar Novo Ajuste de Estoque"
        />
      )}
    </div>
  );
};

export default AjustesEstoquePage;
