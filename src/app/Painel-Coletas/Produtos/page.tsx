"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import useGetProdutos from "../hooks/useGetProdutos";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { Produto } from "../utils/types/Produto";

import SearchBar from "../components/SearchBar";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "../components/PaginationControls";

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

interface ProdutoExibido {
  id: number;
  codigoErp: string;
  descricao: string;
  unidade: string;
  marca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
}

interface ColumnConfig {
  key: keyof ProdutoExibido;
  label: string;
  sortable: boolean;
}

const SORT_COLUMN_MAP: { [key in keyof ProdutoExibido]?: string } = {
  codigoErp: "cadastroItem.codItemErp",
  descricao: "cadastroItem.descricaoItem",
  unidade: "cadastroItem.unidade",
  marca: "cadastroItem.descricaoMarca",
  codBarra: "cadastroItem.codBarra",
  codReferencia: "cadastroItem.codReferencia",
  codFabricante: "cadastroItem.codFabricante",
};

const FILTER_TO_API_PARAM: Record<string, string> = {
  codigoErp: "codErp",
  descricao: "descricao",
  marca: "marca",
  codBarra: "codBarras",
  codReferencia: "codReferencia",
  codFabricante: "codFabricante",
};

const columns: ColumnConfig[] = [
  { key: "codigoErp", label: "Código ERP", sortable: true },
  { key: "descricao", label: "Descrição", sortable: true },
  { key: "unidade", label: "Unidade", sortable: true },
  { key: "marca", label: "Marca", sortable: true },
  { key: "codBarra", label: "Cód. Barras", sortable: true },
  { key: "codReferencia", label: "Cód. Referência", sortable: true },
  { key: "codFabricante", label: "Cód. Fabricante", sortable: true },
];

// --- Componente Principal ---

const ProdutosPage: React.FC = () => {
  // Declaração de States e Hooks
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
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
    const apiParamKey = FILTER_TO_API_PARAM[selectedFilter];
    return apiParamKey ? { [apiParamKey]: query } : {};
  }, [query, selectedFilter]);

  const {
    produtos,
    loading: produtosLoading,
    error: produtosError,
    refetch,
    totalPaginas,
    totalElementos,
  } = useGetProdutos(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    filtrosParaApi,
    !!codEmpresa
  );

  const isLoading = companyLoading || produtosLoading;

  // Declaração de Funções e Lógica
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
    setPorPagina(newSize);
    setPaginaAtual(1);
  };

  const sortData = (key: keyof ProdutoExibido) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);

  // Declaração de Funções de renderização
  // (Nenhuma função de renderização separada neste componente)

  if (produtosError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Produtos</h2>
        <p>{produtosError}</p>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  }

  // Return
  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>PRODUTOS</h1>
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual produto deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => refetch()}
            title="Atualizar produtos"
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
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row) => (
              <tr key={row.id}>
                <td>{row.codigoErp}</td>
                <td>{row.descricao}</td>
                <td>{row.unidade}</td>
                <td>{row.marca}</td>
                <td>{row.codBarra}</td>
                <td>{row.codReferencia}</td>
                <td>{row.codFabricante}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalElementos > 0 && (
        <div className="footerControls">
          <PaginationControls
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            porPagina={porPagina}
            onPageChange={setPaginaAtual}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProdutosPage;
