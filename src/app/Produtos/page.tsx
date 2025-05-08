"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Produtos.module.css";
import useGetProdutos from "../hooks/useGetProdutos";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import { formatPreco } from "../utils/functions/formatPreco";
import { useLoading } from "../Context/LoadingContext";

const ProdutosPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);
  const { produtos, loading, error } = useGetProdutos(
    usuario?.empresas[0]?.codEmpresa || 1,
    paginaAtual,
    itemsPerPage
  );

  const [query, setQuery] = useState("");
  const [sortedData, setSortedData] = useState<any[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("Descricao");

  useEffect(() => {
    if (produtos) {
      setSortedData(produtos);
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

    if (produtos) {
      const filtered = produtos.filter((produto: any) => {
        if (selectedFilter === "Descricao") {
          return produto.descricaoItem
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        if (selectedFilter === "Marca") {
          return produto.descricaoMarca
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        if (selectedFilter === "Codigo") {
          return produto.codItem
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        return true;
      });
      setSortedData(filtered);
    }
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    const sorted = [...produtos].sort((a: any, b: any) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  const paginatedData = Array.isArray(sortedData)
    ? sortedData.slice(
        (paginaAtual - 1) * itemsPerPage,
        paginaAtual * itemsPerPage
      )
    : [];

  const columns = [
    { key: "descricaoItem", label: "Descrição" },
    { key: "descricaoMarca", label: "Marca" },
    { key: "codItemErp", label: "Código" },
    { key: "precoVenda", label: "Preço" },
    { key: "saldoDisponivel", label: "Saldo" },
    { key: "unidade", label: "Unidade" },
    {
      key: "actions",
      render: (_value: any, _row: any, rowIndex: number) => (
        <button
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={() => toggleExpandRow(rowIndex)}
        >
          {expandedRow === rowIndex ? "▲" : "▼"}
        </button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PRODUTOS</h1>
      <SearchBar
        placeholder="Qual produto deseja buscar?"
        onSearch={handleSearch}
        onFilterClick={toggleFilterExpansion}
      />
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
                <th key={col.key}>
                  {col.label}
                  {col.key !== "actions" && (
                    <FaSort
                      style={{ marginLeft: "0.5em", cursor: "pointer" }}
                      onClick={() => handleSort(col.key)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const isSaldoZero = row.saldoDisponivel <= 0;
              const isEmPromocao = row.precoPromocao > 0 && !isSaldoZero;

              return (
                <React.Fragment key={rowIndex}>
                  <tr
                    className={
                      isSaldoZero
                        ? styles.saldoZero
                        : isEmPromocao
                        ? styles.emPromocao
                        : ""
                    }
                  >
                    <td>{row.descricaoItem}</td>
                    <td>{row.descricaoMarca}</td>
                    <td>{row.codItemErp}</td>
                    <td>{formatPreco(row.precoVenda)}</td>
                    <td>{row.saldoDisponivel}</td>
                    <td>{row.unidade}</td>
                    <td>
                      <button
                        onClick={() => toggleExpandRow(rowIndex)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {expandedRow === rowIndex ? "▲" : "▼"}
                      </button>
                    </td>
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
                              <strong>Cód. de Barras:</strong> {row.codBarra}
                            </p>
                            <p>
                              <strong>Cód. de Referência:</strong>{" "}
                              {row.codReferencia}
                            </p>
                            <p>
                              <strong>Cód. do Fabricante:</strong>{" "}
                              {row.codFabricante}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Grupo:</strong> {row.grupo}
                            </p>
                            <p>
                              <strong>Subgrupo:</strong> {row.subGrupo}
                            </p>
                            <p>
                              <strong>Departamento:</strong> {row.departamento}
                            </p>
                            <p>
                              <strong>Família:</strong> {row.familia}
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
                              {row.dataInicioPromocao &&
                                new Date(
                                  row.dataInicioPromocao
                                ).toLocaleDateString("pt-BR")}
                            </p>
                            <p>
                              <strong>Fim Promoção:</strong>{" "}
                              {row.dataFimPromocao &&
                                new Date(
                                  row.dataFimPromocao
                                ).toLocaleDateString("pt-BR")}
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
        </table>
        <div className={styles.paginationContainer}>
          <button onClick={() => setPaginaAtual(1)}>
            <FiChevronsLeft />
          </button>
          <button
            onClick={() => {
              if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
            }}
          >
            <FiChevronLeft />
          </button>
          <p>{paginaAtual}</p>
          {sortedData.length > paginaAtual * itemsPerPage && (
            <button onClick={() => setPaginaAtual(paginaAtual + 1)}>
              <FiChevronRight />
            </button>
          )}
          <div className={styles.itemsPerPageContainer}>
            <span>Produtos por página: </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
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
      </div>
    </div>
  );
};

export default ProdutosPage;
