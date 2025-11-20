"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../../Painel-Coletas/components/SearchBar";
import styles from "./Produtos.module.css";
import useGetProdutos from "../hooks/useGetProdutos";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { formatPreco } from "../utils/functions/formatPreco";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";

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

interface Produto {
  codItemApi: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
  grupo: string;
  subGrupo: string;
  familia: string;
  departamento: string;
  unidade: string;
  precoVenda: number;
  precoRevenda: number;
  precoPromocao: number;
  dataInicioPromocao: string;
  dataFimPromocao: string;
  saldoDisponivel: number;
  porcentagemDescontoMax: number;
}

const FILTER_TO_API_PARAM: Record<string, string> = {
  "Código ERP": "codErp",
  Descrição: "descricao",
  Unidade: "unidade",
  Marca: "marca",
  "Cód. Barras": "codBarras",
  "Cód. Referência": "codReferencia",
  "Cód. Fabricante": "codFabricante",
};

const SORT_KEY_TO_API_PARAM: Record<string, string> = {
  codItemErp: "cadastroItem.codItemErp",
  descricaoItem: "cadastroItem.descricaoItem",
  unidade: "cadastroItem.unidade",
  descricaoMarca: "cadastroItem.descricaoMarca",
  codBarra: "cadastroItem.codBarra",
  codReferencia: "cadastroItem.codReferencia",
  codFabricante: "cadastroItem.codFabricante",
  precoVenda: "precoVenda", // Mantive este, pois não estava no primeiro exemplo
};

interface ColumnDefinition {
  key: keyof Produto | "actions";
  label: string;
  render?: (value: any, row: Produto, rowIndex: number) => React.ReactNode;
}

export default function ProdutosPage() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState(""); // ADICIONADO
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Descrição");
  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const filtrosParaApi = useMemo(() => {
    const filtros: Record<string, string | boolean> = {};
    if (searchQuery) {
      const apiParamKey = FILTER_TO_API_PARAM[selectedFilter];
      if (apiParamKey) {
        filtros[apiParamKey] = searchQuery;
      }
    }
    return filtros;
  }, [searchQuery, selectedFilter]);

  const codEmpresaParaBusca =
    usuario && usuario.empresas[0]?.codEmpresa
      ? usuario.empresas[0].codEmpresa
      : 1;
  const isHookEnabled = !!usuario;

  const orderByApi = sortConfig
    ? SORT_KEY_TO_API_PARAM[sortConfig.key] // Traduz a chave
    : undefined;

  const { produtos, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetProdutos(
      codEmpresaParaBusca,
      paginaAtual,
      itemsPerPage,
      orderByApi, // Passa o nome correto para a API
      sortConfig?.direction,
      filtrosParaApi,
      isHookEnabled
    );
  const columns: ColumnDefinition[] = [
    { key: "codItemErp", label: "Código ERP" },
    { key: "descricaoItem", label: "Descrição" },
    { key: "unidade", label: "Unidade" },
    { key: "descricaoMarca", label: "Marca" },
    { key: "codBarra", label: "Cód. Barras" },
    { key: "codReferencia", label: "Cód. Referência" },
    { key: "codFabricante", label: "Cód. Fabricante" },
    {
      key: "precoVenda",
      label: "Preço",
      render: (value: number) => formatPreco(value),
    },
    {
      key: "actions",
      label: "Ações",
      render: (_value, _row, rowIndex) => (
        <button
          className={styles.expandButton}
          onClick={() => toggleExpandRow(rowIndex)}
        >
          {expandedRow === rowIndex ? "▲" : "▼"}
        </button>
      ),
    },
  ];

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (query: string) => {
    setPaginaAtual(1);
    setSearchQuery(query);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPaginaAtual(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setPaginaAtual(1);
  };

  const getCellValue = (row: any, colKey: keyof Produto) => {
    return row[colKey] ?? "N/A";
  };

  return (
    <div className={styles.container}>
      <LoadingOverlay /> <h1 className={styles.title}>PRODUTOS</h1>
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
              {Object.keys(FILTER_TO_API_PARAM).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
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
                  onClick={() =>
                    col.key !== "actions" && handleSort(col.key as string)
                  }
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.key !== "actions" && <IconSort />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {produtos &&
              produtos.map((row, rowIndex) => {
                const isSaldoZero = row.saldoDisponivel <= 0;
                const isEmPromocao = row.precoPromocao > 0 && !isSaldoZero;
                return (
                  <React.Fragment key={row.codItemApi || rowIndex}>
                    <tr
                      className={
                        isSaldoZero
                          ? styles.saldoZero
                          : isEmPromocao
                          ? styles.emPromocao
                          : ""
                      }
                    >
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render
                            ? col.render(
                                getCellValue(row, col.key as keyof Produto),
                                row,
                                rowIndex
                              )
                            : getCellValue(row, col.key as keyof Produto)}
                        </td>
                      ))}
                    </tr>
                    {expandedRow === rowIndex && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={columns.length}>
                          <div className={styles.additionalInfo}>
                            <div>
                              <p>
                                <strong>Grupo:</strong> {row.grupo ?? "N/A"}
                              </p>

                              <p>
                                <strong>Subgrupo:</strong>{" "}
                                {row.subGrupo ?? "N/A"}
                              </p>

                              <p>
                                <strong>Departamento: </strong>
                                {row.departamento ?? "N/A"}
                              </p>

                              <p>
                                <strong>Família: </strong> {row.familia ?? "N/A"}
                              </p>
                            </div>

                            <div>
                              <p>
                                <strong>Preço Revenda: </strong>
                                {formatPreco(row.precoRevenda)}
                              </p>

                              <p>
                                <strong>Preço Promoção: </strong>
                                {formatPreco(row.precoPromocao)}
                              </p>

                              <p>
                                <strong>Desconto Máx (%): </strong>
                                {row.porcentagemDescontoMax}%
                              </p>

                              <p>
                                <strong>Saldo Disponível: </strong>
                                {row.saldoDisponivel}
                              </p>
                            </div>

                            <div>
                              <p>
                                <strong>Início Promoção: </strong>
                                {row.dataInicioPromocao
                                  ? new Date(
                                      row.dataInicioPromocao
                                    ).toLocaleDateString("pt-BR")
                                  : "N/A"}
                              </p>

                              <p>
                                <strong>Fim Promoção: </strong>
                                {row.dataFimPromocao
                                  ? new Date(
                                      row.dataFimPromocao
                                    ).toLocaleDateString("pt-BR")
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={columns.length}>
                <PaginationControls
                  paginaAtual={paginaAtual}
                  totalPaginas={qtdPaginas || 1}
                  totalElementos={qtdElementos || 0}
                  porPagina={itemsPerPage}
                  onPageChange={setPaginaAtual}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  isLoading={loading}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
