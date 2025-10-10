"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import styles from "../Conferencias/Conferencias.module.css";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetProdutos from "../hooks/useGetProdutos";
import useCurrentCompany from "../hooks/useCurrentCompany";
import { Produto } from "../utils/types/Produto";
import PaginationControls from "../components/PaginationControls"; // <-- IMPORTADO

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
const SORT_COLUMN_MAP: { [key in keyof ProdutoExibido]?: string } = {
  codigoErp: "cadastroItem.codItemErp",
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

  // --- Chamada do Hook (ATUALIZADA PARA RECEBER totalElementos) ---
  const {
    produtos,
    loading: produtosLoading,
    error: produtosError,
    refetch,
    totalPaginas,
    totalElementos, // <-- ADICIONADO
  } = useGetProdutos(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? SORT_COLUMN_MAP[sortConfig.key] : undefined,
    sortConfig?.direction,
    query, // <-- LÓGICA ORIGINAL MANTIDA
    !!codEmpresa
  );

  const isLoading = companyLoading || produtosLoading;

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

  const toggleFilterExpansion = () => setIsFilterExpanded((prev) => !prev);

  // Funções de paginação antigas foram removidas

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
          {/* --- O ANTIGO TFOOT FOI REMOVIDO DAQUI --- */}
        </table>
      </div>

      {/* --- NOVO COMPONENTE DE PAGINAÇÃO ADICIONADO AQUI --- */}
      {totalElementos > 0 && (
        <div
          className="footerControls" /* Usando classe genérica para estilo */
        >
          <PaginationControls
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            porPagina={porPagina}
            onPageChange={setPaginaAtual}
          />
        </div>
      )}
    </div>
  );
};

export default ProdutosPage;
