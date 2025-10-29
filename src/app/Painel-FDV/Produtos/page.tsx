"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../../Painel-Coletas/components/SearchBar";
import styles from "./Produtos.module.css";
import useGetProdutos from "../hooks/useGetProdutos"; // Hook atualizado
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
// [REMOVIDO] import { FaSort } from "react-icons/fa";
import { formatPreco } from "../utils/functions/formatPreco";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";

// [NOVO] Ícone de Refresh do padrão
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

// [NOVO] Ícone de Sort do padrão
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

const ProdutosPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc"; // Ajustado para não permitir 'null'
  } | null>(null);

  // [MODIFICADO] Adicionado "refetch"
  const { produtos, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetProdutos(
      usuario?.empresas[0]?.codEmpresa || 1,
      paginaAtual,
      itemsPerPage,
      sortConfig?.key,
      sortConfig?.direction
    );

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Produto[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Descricao");

  useEffect(() => {
    if (produtos) {
      setFilteredData(produtos);
    }
  }, [produtos]);

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

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPaginaAtual(1); // Reseta a página na busca

    if (produtos) {
      const filtered = produtos.filter((produto: Produto) => {
        const query = searchQuery.toLowerCase();
        if (selectedFilter === "Descricao") {
          return produto.descricaoItem.toLowerCase().includes(query);
        }
        if (selectedFilter === "Marca") {
          return produto.descricaoMarca?.toLowerCase().includes(query) || false;
        }
        if (selectedFilter === "Codigo") {
          return (produto.codItemErp || "")
            .toString()
            .toLowerCase()
            .includes(query);
        }
        return true;
      });
      setFilteredData(filtered);
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPaginaAtual(1); // Reseta para a página 1 ao ordenar
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setPaginaAtual(1); // Reseta para a página 1
  };

  const columns = [
    { key: "codItemErp", label: "Código" },
    { key: "descricaoItem", label: "Descrição" },
    { key: "descricaoMarca", label: "Marca" },
    { key: "precoVenda", label: "Preço" },
    { key: "saldoDisponivel", label: "Saldo" },
    { key: "unidade", label: "Unidade" },
    { key: "actions", label: "Ações" }, // Adicionado 'label' para consistência
  ];

  const getCellValue = (row: any, colKey: string) => {
    return row[colKey as keyof Produto] ?? "N/A";
  };

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>PRODUTOS</h1>

      {/* [NOVO] Estrutura de search container + actions do padrão */}
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual produto deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => refetch()} // Assumindo que o hook provê refetch
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
              <option value="Descricao">Descrição</option>
              <option value="Marca">Marca</option>
              <option value="Codigo">Código</option>
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
                  onClick={() => col.key !== "actions" && handleSort(col.key)}
                >
                  {/* [MODIFICADO] Padrão de ícone de sort */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.key !== "actions" && <IconSort />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => {
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
                        {col.key === "actions" ? (
                          // [MODIFICADO] Usa classe em vez de estilo inline
                          <button
                            className={styles.expandButton}
                            onClick={() => toggleExpandRow(rowIndex)}
                          >
                            {expandedRow === rowIndex ? "▲" : "▼"}
                          </button>
                        ) : col.key === "precoVenda" ? (
                          formatPreco(getCellValue(row, col.key))
                        ) : (
                          getCellValue(row, col.key)
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedRow === rowIndex && (
                    <tr className={styles.expandedRow}>
                      <td
                        colSpan={columns.length}
                        style={{
                          borderRight: isSaldoZero
                            ? "5px solid #F44336"
                            : isEmPromocao
                            ? "5px solid #4CAF50"
                            : "none",
                        }}
                      >
                        <div className={styles.additionalInfo}>
                          <div>
                            <p>
                              <strong>Código ERP:</strong> {row.codItemErp}
                            </p>
                            <p>
                              <strong>Cód. de Barras:</strong>{" "}
                              {row.codBarra ?? "N/A"}
                            </p>
                            <p>
                              <strong>Cód. de Referência:</strong>{" "}
                              {row.codReferencia ?? "N/A"}
                            </p>
                            <p>
                              <strong>Cód. do Fabricante:</strong>{" "}
                              {row.codFabricante ?? "N/A"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Grupo:</strong> {row.grupo ?? "N/A"}
                            </p>
                            <p>
                              <strong>Subgrupo:</strong> {row.subGrupo ?? "N/A"}
                            </p>
                            <p>
                              <strong>Departamento:</strong>{" "}
                              {row.departamento ?? "N/A"}
                            </p>
                            <p>
                              <strong>Família:</strong> {row.familia ?? "N/A"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Preço Venda:</strong>{" "}
                              {formatPreco(row.precoVenda)}
                            </p>
                            <p>
                              <strong>Preço Revenda:</strong>{" "}
                              {formatPreco(row.precoRevenda)}
                            </p>
                            <p>
                              <strong>Preço Promoção:</strong>{" "}
                              {formatPreco(row.precoPromocao)}
                            </p>
                            <p>
                              <strong>Desconto Máx (%):</strong>{" "}
                              {row.porcentagemDescontoMax}%
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Início Promoção:</strong>{" "}
                              {row.dataInicioPromocao
                                ? new Date(
                                    row.dataInicioPromocao
                                  ).toLocaleDateString("pt-BR")
                                : "N/A"}
                            </p>
                            <p>
                              <strong>Fim Promoção:</strong>{" "}
                              {row.dataFimPromocao
                                ? new Date(
                                    row.dataFimPromocao
                                  ).toLocaleDateString("pt-BR")
                                : "N/A"}
                            </p>
                            <p>
                              <strong>Saldo Disponível:</strong>{" "}
                              {row.saldoDisponivel}
                            </p>
                            <p>
                              <strong>Unidade:</strong> {row.unidade}
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
};

export default ProdutosPage;
