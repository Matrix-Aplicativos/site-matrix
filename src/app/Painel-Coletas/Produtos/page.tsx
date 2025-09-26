"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../components/SearchBar"; // Ajuste o caminho se necessário
import styles from "../Conferencias/Conferencias.module.css"; // Reutilizando o mesmo CSS
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import useGetProdutos from "../hooks/useGetProdutos"; // Nosso hook de produtos
import useCurrentCompany from "../hooks/useCurrentCompany";

// --- Ícones SVG (Reutilizados) ---
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

// --- Interfaces e Constantes para a Página (Atualizadas) ---
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
  codigoErp: "codItemErp",
  descricao: "descricaoItem",
  unidade: "unidade",
  marca: "descricaoMarca",
  codBarra: "codBarra",
  codReferencia: "codReferencia",
  codFabricante: "codFabricante",
};

// --- Componente Principal ---
const ProdutosPage: React.FC = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("descricao");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProdutoExibido;
    direction: "asc" | "desc";
  } | null>({ key: "descricao", direction: "asc" });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { empresa, loading: companyLoading } = useCurrentCompany();
  const codEmpresa = empresa?.codEmpresa;

  const {
    produtos,
    loading: produtosLoading,
    error: produtosError,
    refetch,
  } = useGetProdutos(
    codEmpresa || 0,
    paginaAtual,
    porPagina,
    sortConfig ? String(SORT_COLUMN_MAP[sortConfig.key]) : undefined,
    sortConfig?.direction,
    !!codEmpresa
  );

  const isLoading = companyLoading || produtosLoading;
  const hasMoreData = produtos ? produtos.length >= porPagina : false;

  const filteredData = useMemo(() => {
    if (!produtos) return [];

    const produtosMapeados = produtos.map((p) => ({
      id: p.codItemApi,
      codigoErp: p.codItemErp,
      descricao: p.descricaoItem,
      unidade: p.unidade,
      marca: p.descricaoMarca,
      codBarra: p.codBarra,
      codReferencia: p.codReferencia,
      codFabricante: p.codFabricante,
    }));

    // Cria uma cópia mutável para os filtros e ordenação
    let result = [...produtosMapeados];

    // Aplica o filtro de busca
    if (query) {
      result = result.filter((p) => {
        const fieldValue =
          p[selectedFilter as keyof ProdutoExibido]?.toString() || "";
        return fieldValue.toLowerCase().includes(query.toLowerCase());
      });
    }

    // --- CORREÇÃO APLICADA AQUI ---
    // 1. Lógica de ordenação adicionada para reordenar os dados na tela
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
    // 2. Adicionado `sortConfig` à lista de dependências para re-executar a ordenação
  }, [produtos, query, selectedFilter, sortConfig]);

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
  const handlePrevPage = () => setPaginaAtual((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPaginaAtual((prev) => prev + 1);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (produtosError) {
    return (
      <div className={styles.container}>
        <h2>Erro ao Carregar Produtos</h2>
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
          >
            <span style={{ marginRight: 5, color: "#1769e3" }}>Atualizar</span>
            <IconRefresh className={produtosLoading ? styles.spinning : ""} />
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
            {filteredData.map((row) => (
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

export default ProdutosPage;
