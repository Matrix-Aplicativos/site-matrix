"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./Inventario.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useGetColetas from "../hooks/useGetColetas";
import deleteColetaAvulsaHook from "../hooks/useDeleteColetaAvulsa";
import useCurrentCompany from "../hooks/useCurrentCompany";
import SearchBar from "../components/SearchBar";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import ExpandedRowContent from "../components/ExpandedRow";
import PaginationControls from "../components/PaginationControls";
import ModalCadastrarColeta from "../components/ModalCadastrarColeta";
import { FiLayers } from "react-icons/fi";

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

// --- [ATUALIZADO] Interface local com os novos campos ---
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
  qtdItensConferidos: number; // NOVO
  volumeTotal: number;
  volumeConferido: number; // NOVO
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
  "Em Andamento": "4",
  "Finalizada Parcialmente": "2",
  "Finalizada Completa": "3",
};
const OPCOES_ORIGEM = { "Sob Demanda": "1", Avulsa: "2" };

// --- [ATUALIZADO] Nova ordem e novas colunas ---
const columns: ColumnConfig[] = [
  { key: "status", label: "Status", sortable: true },
  { key: "id", label: "Código", sortable: true },
  { key: "qtdItens", label: "Qtd. Itens", sortable: false },
  { key: "qtdItensConferidos", label: "Qtd. Itens Conf.", sortable: false }, // NOVO
  { key: "volumeTotal", label: "Qtd. Volume", sortable: true },
  { key: "volumeConferido", label: "Qtd. Volume Conf.", sortable: true }, // NOVO
  { key: "data", label: "Data", sortable: true },
  { key: "descricao", label: "Descrição", sortable: true },
  { key: "origem", label: "Origem", sortable: true },
  { key: "tipoMovimento", label: "Tipo", sortable: true },
  { key: "usuario", label: "Responsável", sortable: true },
];

const getOrigemText = (origem: string) =>
  origem === "1" ? "Sob Demanda" : origem === "2" ? "Avulsa" : origem;
const getTipoMovimentoText = (tipo: string) =>
  tipo === "1" ? "Inventário" : tipo;
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

const InventariosPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;
  const codUsuario = 1;

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
    "1",
    statusFiltro || undefined,
    origemFiltro || undefined,
    "descricao",
    query,
    dateRange.startDate,
    dateRange.endDate,
    !!codEmpresa
  );
  const { deletarColeta, loading: deleting } = deleteColetaAvulsaHook();
  const isLoading = coletasLoading || deleting;

  // --- [ATUALIZADO] Mapeamento dos novos campos ---
  const filteredData = useMemo(() => {
    if (!coletas) return [];
    return coletas.map((c) => ({
      id: c.codConferencia,
      descricao: c.descricao,
      data: c.dataCadastro,
      dataFim: c.dataFim,
      origem: String(c.origemCadastro),
      tipoMovimento: String(c.tipo),
      usuario: c.usuario?.nome || "Usuário não informado",
      status: c.status,
      integradoErp: c.integradoErp,
      qtdItens: c.qtdItens,
      qtdItensConferidos: c.qtdItensConferidos, // NOVO
      volumeTotal: c.volumeTotal,
      volumeConferido: c.volumeConferido, // NOVO
    }));
  }, [coletas]);

  useEffect(() => {
    if (companyLoading || isLoading) showLoading();
    else hideLoading();
  }, [companyLoading, isLoading, showLoading, hideLoading]);
  const handleSuccess = useCallback(() => {
    setIsModalOpen(false);
    refetch();
  }, [refetch]);

  const handleDeleteColeta = async (codColeta: number) => {
    if (window.confirm("Tem certeza que deseja excluir essa coleta?")) {
      try {
        await deletarColeta(codColeta);
        alert("Coleta excluída com sucesso!");
        refetch();
      } catch (error) {
        alert("Erro ao excluir coleta");
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
        <h2>Erro ao Carregar inventários</h2>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  if (companyLoading || (!coletas && coletasLoading))
    return <div className={styles.container}>Carregando dados...</div>;

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>INVENTÁRIOS</h1>
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar por descrição do inventário..."
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => setIsModalOpen(true)}
            title="Cadastrar novo inventário"
          >
            <span>Cadastrar Inventário</span>
            <FiLayers />
          </button>
          <button
            className={styles.actionButton}
            onClick={() => refetch()}
            title="Atualizar inventários"
          >
            <span>Atualizar</span>
            <IconRefresh className={isLoading ? styles.spinning : ""} />
          </button>
        </div>
      </div>
      {isFilterExpanded && <div className={styles.filterExpansion}>...</div>}
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
                  {/* --- [ATUALIZADO] Nova ordem e novas células --- */}
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
                  <td>{row.qtdItens}</td>
                  <td>{row.qtdItensConferidos}</td>
                  <td>{row.volumeTotal}</td>
                  <td>{row.volumeConferido}</td>
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
                    {row.origem === "2" && !row.dataFim && (
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColeta(row.id);
                        }}
                        title="Excluir coleta avulsa"
                      >
                        <IconTrash />
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
        onItemsPerPageChange={handleItemsPerPageChange}
      />
      {codEmpresa && (
        <ModalCadastrarColeta
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          codEmpresa={codEmpresa}
          codUsuario={codUsuario}
          tipoColeta={1}
          titulo="Cadastrar Novo Inventário"
        />
      )}
    </div>
  );
};
export default InventariosPage;
