"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./Pedidos.module.css";
import coletaStyles from "../../Painel-Coletas/Conferencias/Conferencias.module.css";
import useGetPedidos from "../hooks/useGetPedidos";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { formatPainelTitle } from "../utils/formatPainelTitle";
import { formatPreco } from "../utils/functions/formatPreco";
import { getClienteLabel, PedidoListItem } from "../utils/types/Pedido";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";
import ColetaTable, {
  ColetaTableColumn,
} from "@/app/Painel-Coletas/components/table/ColetaTable";
import SearchBar from "../../Painel-Coletas/components/SearchBar";

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

const azulMatrix = "#1769E3";
const verdeMatrix = "#29F581";
const vermelhoMatrix = "#DA072D";
const amareloMatrix = "#C4A020";
const laranjaMatrix = "#FF8A00";

const SORT_KEY_TO_API_PARAM: Record<string, string> = {
  codPedido: "id",
  dataCadastro: "dataCadastro",
  valorTotal: "valorTotal",
  status: "status",
  qtdItens: "qtdItens",
  subTotal: "subTotal",
};

const PEDIDO_STATUS: Record<string, { label: string; color: string }> = {
  "1": { label: "Em aberto", color: amareloMatrix },
  "2": { label: "Confirmado", color: verdeMatrix },
  "3": { label: "Integrado", color: azulMatrix },
  "4": { label: "Erro na integração", color: vermelhoMatrix },
  "5": { label: "Orçamento", color: laranjaMatrix },
};

const STATUS_FILTER_KEYS = ["1", "2", "3", "4", "5"] as const;

function resolveSearchApiParam(
  filter: string,
  value: string
): { campo: string; valor: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (filter === "cliente") {
    return { campo: "nomeCliente", valor: trimmed };
  }

  if (filter === "codPedido") {
    return { campo: "codPedido", valor: trimmed };
  }

  return { campo: filter, valor: trimmed };
}

type SortKey =
  | "codPedido"
  | "dataCadastro"
  | "valorTotal"
  | "status"
  | "qtdItens"
  | "subTotal";

interface PedidoRow {
  id: number;
  codPedido: number;
  dataCadastro: string;
  cliente: string;
  vendedor: string;
  qtdItens: number;
  subTotal: number;
  valorTotal: number;
  status: string;
  item: PedidoListItem;
}

export default function PedidosPage() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [query, setQuery] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("codPedido");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const { empresa } = useCurrentCompany();

  const codEmpresa = usuario?.empresas?.[0]?.codEmpresa;
  const pageTitle = formatPainelTitle("PEDIDOS", empresa?.nomeFantasia);

  const orderByApi = sortConfig?.key
    ? SORT_KEY_TO_API_PARAM[sortConfig.key] ?? sortConfig.key
    : undefined;

  const searchApi = useMemo(
    () => resolveSearchApiParam(selectedFilter, query),
    [selectedFilter, query]
  );

  const { pedidos, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetPedidos(
      codEmpresa,
      paginaAtual,
      porPagina,
      orderByApi,
      sortConfig?.direction,
      searchApi?.campo,
      searchApi?.valor,
      dateRange.startDate,
      dateRange.endDate,
      selectedStatuses.length > 0 ? selectedStatuses : undefined
    );

  const getStatusLabel = (status: string) =>
    PEDIDO_STATUS[status]?.label ?? "Outro status";

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    const color = PEDIDO_STATUS[status]?.color ?? "#616161";
    return {
      backgroundColor: `${color}22`,
      color,
      border: `1px solid ${color}`,
    };
  };

  const formatData = (dataCadastro: string) => {
    const date = new Date(dataCadastro);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tableRows: PedidoRow[] = (pedidos || []).map((item) => ({
    id: item.pedido.codPedido,
    codPedido: item.pedido.codPedido,
    dataCadastro: formatData(item.dataCadastro),
    cliente: getClienteLabel(item),
    vendedor: item.pedido.vendedor?.nome || "—",
    qtdItens: item.qtdItens,
    subTotal: item.subTotal,
    valorTotal: item.pedido.valorTotal,
    status: item.pedido.status,
    item,
  }));

  const columns: ColetaTableColumn<PedidoRow>[] = [
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <span
          className={styles.statusBadge}
          style={getStatusBadgeStyle(row.status)}
        >
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: "codPedido",
      label: "Código",
      sortable: true,
      render: (row) => row.codPedido,
    },
    {
      key: "dataCadastro",
      label: "Data",
      sortable: true,
      render: (row) => row.dataCadastro,
    },
    {
      key: "cliente",
      label: "Cliente",
      sortable: false,
      render: (row) => row.cliente,
    },
    {
      key: "vendedor",
      label: "Vendedor",
      sortable: false,
      render: (row) => row.vendedor,
    },
    {
      key: "qtdItens",
      label: "Qtd. Itens",
      sortable: true,
      render: (row) => row.qtdItens,
    },
    {
      key: "subTotal",
      label: "Subtotal",
      sortable: true,
      render: (row) => formatPreco(row.subTotal),
    },
    {
      key: "valorTotal",
      label: "Valor Total",
      sortable: true,
      render: (row) => formatPreco(row.valorTotal),
    },
  ];

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  const toggleExpandRow = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
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

  const handleStatusFilterChange = (statusKey: string, checked: boolean) => {
    setSelectedStatuses((prev) => {
      if (checked) {
        return prev.includes(statusKey) ? prev : [...prev, statusKey];
      }
      return prev.filter((s) => s !== statusKey);
    });
    setPaginaAtual(1);
  };

  const sortData = (key: keyof PedidoRow) => {
    if (
      key === "cliente" ||
      key === "vendedor" ||
      key === "id" ||
      key === "item"
    ) {
      return;
    }

    const sortKey = key as SortKey;
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === sortKey &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key: sortKey, direction });
    setPaginaAtual(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setPorPagina(newSize);
    setPaginaAtual(1);
  };

  const renderExpandedDetails = (row: PedidoRow) => {
    const { pedido } = row.item;
    return (
      <div className={styles.additionalInfo}>
        <p>
          <strong>Condição de pagamento:</strong>{" "}
          {pedido.condicaoPagamento?.descricao || "—"}
        </p>
        <p>
          <strong>Frete:</strong> {formatPreco(pedido.valorFrete)}
        </p>
        <p>
          <strong>Outros acréscimos:</strong>{" "}
          {formatPreco(pedido.outrosAcrescimos)}
        </p>
        <p>
          <strong>Observação:</strong> {pedido.observacao || "—"}
        </p>
      </div>
    );
  };

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{pageTitle}</h1>
        <p>Erro ao carregar pedidos: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>{pageTitle}</h1>
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder={
            selectedFilter === "cliente"
              ? "Buscar por nome do cliente..."
              : "Buscar por código do pedido..."
          }
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />

        <div className={styles.searchActions}>
          <button
            type="button"
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
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <div className={styles.filterSection}>
            <label>Status:</label>
            <div className={styles.statusCheckboxGroup}>
              {STATUS_FILTER_KEYS.map((statusKey) => (
                <label key={statusKey} className={styles.statusCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(statusKey)}
                    onChange={(e) =>
                      handleStatusFilterChange(statusKey, e.target.checked)
                    }
                  />
                  <span
                    className={styles.statusCheckboxDot}
                    style={{
                      backgroundColor:
                        PEDIDO_STATUS[statusKey]?.color ?? "#616161",
                    }}
                  />
                  {PEDIDO_STATUS[statusKey]?.label ?? statusKey}
                </label>
              ))}
            </div>
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

      {!loading && tableRows.length === 0 && (
        <p>Nenhum pedido encontrado.</p>
      )}

      <ColetaTable
        className={styles.tableContainer}
        tableClassName={styles.table}
        columns={columns}
        rows={tableRows}
        onSort={sortData}
        getRowId={(row) => row.id}
        expandedRowId={expandedRowId}
        onToggleExpandRow={(id) => toggleExpandRow(Number(id))}
        expandColumnIndex={0}
        actionsHeaderLabel=""
        expandButtonClassName={coletaStyles.expandButton}
        renderSortIcon={() => <IconSort />}
        expandedRowClassName={coletaStyles.expandedRow}
        renderExpandedContent={renderExpandedDetails}
      />

      {(qtdElementos ?? 0) > 0 && (
        <PaginationControls
          paginaAtual={paginaAtual}
          totalPaginas={qtdPaginas || 1}
          totalElementos={qtdElementos || 0}
          porPagina={porPagina}
          onPageChange={setPaginaAtual}
          onItemsPerPageChange={handleItemsPerPageChange}
          isLoading={loading}
        />
      )}
    </div>
  );
}
