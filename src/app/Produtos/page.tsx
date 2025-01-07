'use client'; 

import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Produtos.module.css";
import useGetProdutos from "../hooks/useGetProdutos";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { formatPreco } from "../utils/functions/formatPreco";

const ProdutosPage: React.FC = () => {
  const [paginaAtual,setPaginaAtual] = useState(1);
  const token = getCookie('token')
  const codUsuario = getUserFromToken(String(token));
  const {usuario} = useGetLoggedUser(codUsuario || 0);
  const {produtos,loading,error} = useGetProdutos(usuario?.empresas[0]?.codEmpresa || 1,paginaAtual);

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(produtos);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(()=>{
    if(query === ""){
      setFilteredData(produtos);
    }
  },[query,produtos])

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const columns = [
    { key: "description", label: "Descrição" },
    { key: "brand", label: "Marca" },
    { key: "code", label: "Código" },
    { key: "price", label: "Preço" },
    { key: "stock", label: "Saldo" },
    { key: "unit", label: "Unidade" },
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
          {/* Primeira parte */}
          <div className={styles.filterSection}>
            <label>Buscar por:</label>
            <select>
              <option value="Marca">Marca</option>
              <option value="Descricao">Descrição</option>
              <option value="Codigo">Código</option>
            </select>
          </div>

          {/* Segunda parte */}
          <div className={styles.filterSection}>
            <label>Filtrar por:</label>
            <select aria-placeholder="Departamento">
              <option value="">Departamento</option>
            </select>
            <select aria-placeholder="Família">
              <option value="">Família</option>
            </select>
            <div className={styles.smallSelectGroup}>
              <select aria-placeholder="Grupo">
                <option value="">Grupo</option>
              </select>
              <select aria-placeholder="Subgrupo">
                <option value="">Subgrupo</option>
              </select>
            </div>
          </div>

          {/* Terceira parte */}
          <div className={styles.filterSection}>
            <label>Período da Promoção:</label>
            <div className={styles.dateRange}>
              <input type="date" placeholder="Início" />
              <input type="date" placeholder="Fim" />
            </div>
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData && filteredData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  <td>{row.descricaoItem}</td>
                  <td>{row.descricaoMarca}</td>
                  <td>{row.codItem}</td>
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
                    <td colSpan={columns.length}>
                      <div className={styles.additionalInfo}>
                        <div>
                          <p>
                            <strong>Código:</strong> {row.codItem}
                          </p>
                          <p>
                            <strong>Cód. de Barras:</strong> {row.codBarra}
                          </p>
                          <p>
                            <strong>Cód. de Referência:</strong> {row.codReferencia}
                          </p>
                          <p>
                            <strong>Cód. do Fabricante:</strong> {row.codFabricante}
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
                            <strong>Preço Venda:</strong> {formatPreco(row.precoVenda)}
                          </p>
                          <p>
                            <strong>Preço Revenda:</strong> {formatPreco(row.precoRevenda)}
                          </p>
                          <p>
                            <strong>Preço Promoção:</strong> {formatPreco(row.precoPromocao)}
                          </p>
                          <p>
                            <strong>Desconto Máx (%):</strong> {row.porcentagemDescontoMax}%
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Início Promoção:</strong> {new Date(row.dataInicioPromocao).toLocaleDateString("pt-BR")}
                          </p>
                          <p>
                            <strong>Fim Promoção:</strong> {new Date(row.dataFimPromocao).toLocaleDateString("pt-BR")}
                          </p>
                          <p>
                            <strong>Saldo Disponível:</strong> {row.saldoDisponivel}{" "}
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
            ))}
          </tbody>
        </table>
        <div className={styles.paginationContainer}>
          <button onClick={(e)=>{if(paginaAtual >= 2){e.preventDefault();setPaginaAtual(1)}}}><FiChevronsLeft /></button>
          <button onClick={(e)=>{if(paginaAtual >= 2){e.preventDefault();setPaginaAtual(paginaAtual-1)}}}><FiChevronLeft /></button>
          <p>{paginaAtual}</p>
          {produtos && produtos.length === 10 ?
          <button onClick={(e)=>{e.preventDefault();setPaginaAtual(paginaAtual+1)}}><FiChevronRight /></button> : null
          }
        </div>
      </div>
    </div>
  );
};

export default ProdutosPage;
