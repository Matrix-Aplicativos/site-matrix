"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useTable from "../hooks/core/useTable";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { Produto } from "../utils/types/Produto";

import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "../components/PaginationControls";
import ColetaTable from "../components/table/ColetaTable";
import ColetaPageShell from "../components/coleta/ColetaPageShell";
import {
  ProdutoExibido,
  PRODUTO_COLUMNS,
  PRODUTO_FILTER_TO_API_PARAM,
  PRODUTO_SORT_COLUMN_MAP,
} from "../domain/produtoTableConfig";

// --- Ícones, Interfaces e Constantes ---

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


// --- Componente Principal ---

const ProdutosPage: React.FC = () => {
  // Declaração de States e Hooks
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<keyof ProdutoExibido>("descricao");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProdutoExibido;
    direction: "asc" | "desc";
  } | null>({ key: "descricao", direction: "asc" });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const filtrosParaApi = useMemo(() => {
    if (!query) return {};
    const apiParamKey = PRODUTO_FILTER_TO_API_PARAM[selectedFilter];
    return apiParamKey ? { [apiParamKey]: query } : {};
  }, [query, selectedFilter]);

  const table = useTable<Produto>({
    codEmpresa,
    enabled: !!codEmpresa,
    endpoint: ({ codEmpresa: company }) => `/item/${company}`,
    queryParamsBuilder: ({ page, pageSize, sort }) => {
      const params = new URLSearchParams({
        pagina: String(page),
        porPagina: String(pageSize),
      });
      if (sort) {
        params.append("orderBy", sort.key);
        params.append("direction", sort.direction);
      }
      Object.entries(filtrosParaApi).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return params;
    },
    responseAdapter: (data) => ({
      rows: data?.conteudo || [],
      totalPages: data?.qtdPaginas || 0,
      totalItems: data?.qtdElementos || 0,
    }),
  });

  const isLoading = companyLoading || table.loading;

  // Declaração de Funções e Lógica
  const displayedData = useMemo(() => {
    return table.rows.map((p) => ({
      id: p.codItemApi,
      codigoErp: p.codItemErp,
      descricao: p.descricaoItem,
      unidade: p.unidade,
      marca: p.descricaoMarca,
      codBarra: p.codBarra,
      codReferencia: p.codReferencia,
      codFabricante: p.codFabricante,
    }));
  }, [table.rows]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    table.setPage(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    table.setPageSize(newSize);
  };

  const sortData = (key: keyof ProdutoExibido) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    table.setSort(PRODUTO_SORT_COLUMN_MAP[key] || key);
  };

  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);

  // Declaração de Funções de renderização
  // (Nenhuma função de renderização separada neste componente)

  if (table.error) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Produtos</h2>
        <p>{table.error}</p>
        <button onClick={() => table.reload()}>Tentar novamente</button>
      </div>
    );
  }

  // Return
  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <ColetaPageShell
        title={`PRODUTOS - ${empresa?.nomeFantasia?.toUpperCase() ?? ""}`}
        titleClassName={styles.title}
        searchPlaceholder="Qual produto deseja buscar?"
        onSearch={handleSearch}
        onFilterToggle={toggleFilterExpansion}
        actions={
          <div className={styles.searchActions}>
            <button className={styles.actionButton} onClick={() => table.reload()} title="Atualizar produtos" disabled={isLoading}>
              <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
              <IconRefresh className={isLoading ? styles.spinning : ""} />
            </button>
          </div>
        }
        filterPanel={isFilterExpanded && (
          <div className={styles.filterExpansion}>
            <div className={styles.filterSection}>
              <label>Buscar por:</label>
              <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value as keyof ProdutoExibido)}>
                <option value="descricao">Descrição</option>
                <option value="codigoErp">Código ERP</option>
                <option value="marca">Marca</option>
                <option value="codBarra">Cód. Barras</option>
                <option value="codReferencia">Cód. Referência</option>
                <option value="codFabricante">Cód. Fabricante</option>
              </select>
            </div>
          </div>
        )}
        table={
          <ColetaTable
            className={styles.tableContainer}
            tableClassName={styles.table}
            columns={PRODUTO_COLUMNS}
            rows={displayedData}
            onSort={sortData}
            getRowId={(row) => row.id}
            renderSortIcon={() => <IconSort />}
          />
        }
        pagination={table.totalItems > 0 ? (
          <div className="footerControls">
            <PaginationControls
              paginaAtual={table.page}
              totalPaginas={table.totalPages}
              totalElementos={table.totalItems}
              porPagina={table.pageSize}
              onPageChange={table.setPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        ) : null}
      />
    </div>
  );
};

export default ProdutosPage;
