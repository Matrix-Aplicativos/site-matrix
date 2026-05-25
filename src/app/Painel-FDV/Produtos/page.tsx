"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../../Painel-Coletas/Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { formatPainelTitle } from "../utils/formatPainelTitle";
import useGetProdutos from "../hooks/useGetProdutos";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";
import ColetaTable from "@/app/Painel-Coletas/components/table/ColetaTable";
import ColetaPageShell from "@/app/Painel-Coletas/components/coleta/ColetaPageShell";
import {
  ProdutoExibido,
  PRODUTO_COLUMNS,
  PRODUTO_FILTER_TO_API_PARAM,
  PRODUTO_SORT_COLUMN_MAP,
} from "@/app/Painel-Coletas/domain/produtoTableConfig";

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

export default function ProdutosPage() {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<keyof ProdutoExibido>("descricao");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProdutoExibido;
    direction: "asc" | "desc";
  } | null>({ key: "descricao", direction: "asc" });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const filtrosParaApi = useMemo(() => {
    const filtros: Record<string, string> = {};
    if (!query) return filtros;
    const apiParamKey = PRODUTO_FILTER_TO_API_PARAM[selectedFilter];
    if (apiParamKey) {
      filtros[apiParamKey] = query;
    }
    return filtros;
  }, [query, selectedFilter]);

  const orderByApi = sortConfig
    ? PRODUTO_SORT_COLUMN_MAP[sortConfig.key] || String(sortConfig.key)
    : undefined;

  const { produtos, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetProdutos(
      codEmpresa ?? 0,
      paginaAtual,
      itemsPerPage,
      orderByApi,
      sortConfig?.direction,
      filtrosParaApi,
      !!codEmpresa
    );

  const isLoading = companyLoading || loading;

  const displayedData = useMemo(() => {
    if (!produtos) return [];
    return produtos.map((p) => ({
      id: p.codItemApi,
      codigoErp: p.codItemErp,
      descricao: p.descricaoItem,
      unidade: p.unidade,
      marca: p.descricaoMarca,
      codBarra: p.codBarra,
      codReferencia: p.codReferencia,
      codFabricante: p.codFabricante,
    }));
  }, [produtos]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setPaginaAtual(1);
  };

  const sortData = (key: keyof ProdutoExibido) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    setPaginaAtual(1);
  };

  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);

  if (error) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Produtos</h2>
        <p>{error}</p>
        <button type="button" onClick={() => refetch()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <ColetaPageShell
        title={formatPainelTitle("PRODUTOS", empresa?.nomeFantasia)}
        titleClassName={styles.title}
        searchPlaceholder="Qual produto deseja buscar?"
        onSearch={handleSearch}
        onFilterToggle={toggleFilterExpansion}
        actions={
          <div className={styles.searchActions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => refetch()}
              title="Atualizar produtos"
              disabled={isLoading}
            >
              <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
              <IconRefresh className={isLoading ? styles.spinning : ""} />
            </button>
          </div>
        }
        filterPanel={
          isFilterExpanded && (
            <div className={styles.filterExpansion}>
              <div className={styles.filterSection}>
                <label>Buscar por:</label>
                <select
                  value={selectedFilter}
                  onChange={(e) =>
                    setSelectedFilter(e.target.value as keyof ProdutoExibido)
                  }
                >
                  <option value="descricao">Descrição</option>
                  <option value="codigoErp">Código ERP</option>
                  <option value="marca">Marca</option>
                  <option value="codBarra">Cód. Barras</option>
                  <option value="codReferencia">Cód. Referência</option>
                  <option value="codFabricante">Cód. Fabricante</option>
                </select>
              </div>
            </div>
          )
        }
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
        pagination={
          (qtdElementos ?? 0) > 0 ? (
            <div className="footerControls">
              <PaginationControls
                paginaAtual={paginaAtual}
                totalPaginas={qtdPaginas || 1}
                totalElementos={qtdElementos || 0}
                porPagina={itemsPerPage}
                onPageChange={setPaginaAtual}
                onItemsPerPageChange={handleItemsPerPageChange}
                isLoading={isLoading}
              />
            </div>
          ) : null
        }
      />
    </div>
  );
}
