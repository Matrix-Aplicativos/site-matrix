// Em seu arquivo ProdutosPage.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetProdutos from "../hooks/useGetProdutos";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { Produto } from "../utils/types/Produto";

// --- Ícones e Interfaces (sem alterações) ---
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

interface ColumnConfig {
  key: keyof ProdutoExibido;
  label: string;
  sortable: boolean;
}
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

// --- CORREÇÃO FINAL NO MAPA ---
// Usando os valores exatos que a API espera, com base no Swagger.
const SORT_COLUMN_MAP: { [key in keyof ProdutoExibido]?: string } = {
  codigoErp: "cadastroItem.codItem", // Ajustado com base na imagem
  descricao: "cadastroItem.descricaoItem",
  unidade: "cadastroItem.unidade",
  marca: "cadastroItem.descricaoMarca",
  codBarra: "cadastroItem.codBarra",
  codReferencia: "cadastroItem.codReferencia",
  codFabricante: "cadastroItem.codFabricante",
};

// --- Componente Principal ---
const ProdutosPage: React.FC = () => {
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

  // Chamada do hook já está correta, pois passamos o valor mapeado para o parâmetro 'orderBy'
  const {
    produtos,
    loading: produtosLoading,
    error: produtosError,
    refetch,
    totalPaginas,
  } = useGetProdutos(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined, // orderBy
    sortConfig?.direction, // sortDirection
    query, // descricao
    !!codEmpresa
  );

  const isLoading = companyLoading || produtosLoading;
  const hasMoreData = paginaAtual < totalPaginas;

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

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1);
  };

  const sortData = (key: keyof ProdutoExibido) => {
    const direction: "asc" | "desc" =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
  };

  // O resto do componente não precisa de alterações
  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);
  const handlePrevPage = () => setPaginaAtual((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => {
    if (hasMoreData) {
      setPaginaAtual((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (produtosError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Produtos</h2>
        <p>{produtosError}</p>
        <button onClick={() => refetch()}>Tentar novamente</button>
      </div>
    );
  }

  const columns: ColumnConfig[] = [
    { key: "codigoErp", label: "Código ERP", sortable: true },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "unidade", label: "Unidade", sortable: true },
    { key: "marca", label: "Marca", sortable: true },
    { key: "codBarra", label: "Cód. Barras", sortable: true },
    { key: "codReferencia", label: "Cód. Referência", sortable: true },
    { key: "codFabricante", label: "Cód. Fabricante", sortable: true },
  ];

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
            className={styles.refreshButton}
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
              <option value="unidade">Unidade</option>
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
          <tfoot>
            <tr>
              <td colSpan={columns.length}>
                <div className={styles.paginationContainer}>
                  <div className={styles.paginationControls}>
                    <button
                      onClick={() => setPaginaAtual(1)}
                      disabled={paginaAtual === 1 || isLoading}
                    >
                      &lt;&lt;
                    </button>
                    <button
                      onClick={handlePrevPage}
                      disabled={paginaAtual === 1 || isLoading}
                    >
                      &lt;
                    </button>
                    <span>
                      Página {paginaAtual} de {totalPaginas || 1}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasMoreData || isLoading}
                    >
                      &gt;
                    </button>
                    <button
                      onClick={() => setPaginaAtual(totalPaginas)}
                      disabled={!hasMoreData || isLoading}
                    >
                      &gt;&gt;
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

export default ProdutosPage;
