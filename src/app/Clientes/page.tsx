'use client'; 

import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import styles from "./Clientes.module.css";
import useGetClientes from "../hooks/useGetClientes";
import { getCookie } from "cookies-next";
import { FiChevronsLeft,FiChevronLeft,FiChevronRight } from "react-icons/fi";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { getUserFromToken } from "../utils/functions/getUserFromToken";

const ClientesPage: React.FC = () => {
  const [paginaAtual,setPaginaAtual] = useState(1);
  const token = getCookie('token')
  const codUsuario = getUserFromToken(String(token));
  const {usuario} = useGetLoggedUser(codUsuario || 0);
  const {clientes,error} = useGetClientes(usuario?.empresas[0]?.codEmpresa || 1,paginaAtual);

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState(clientes);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    if(query === ""){
      setFilteredData(clientes);
    }
  },[query,clientes])

  const toggleExpandRow = (index: number) => {
    setExpandedRow((prevRow) => (prevRow === index ? null : index));
  };

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (searched : string)=>{
    setQuery(searched);
  }


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>CLIENTES</h1>
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
              <option value="Marca">Razão Social</option>
              <option value="Descricao">CPF/CNPJ</option>
              <option value="Codigo">Código</option>
            </select>
          </div>

          {/* Segunda parte */}
          <div className={styles.filterSection}>
            <label>Filtrar por:</label>
            <select aria-placeholder="Status">
              <option value="">Status</option>
            </select>
            <input type="number" placeholder="Município (IBGE)" />
            <input type="number" placeholder="Território" />
          </div>
        </div>
      )}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Razão Social</th>
              <th>Nome Fantasia</th>
              <th>CNPJ/CPF</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData && filteredData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  <td>{row.codCliente}</td>
                  <td>{row.razaoSocial}</td>
                  <td>{row.nomeFantasia}</td>
                  <td>{row.cnpjcpf}</td>
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
                    <td colSpan={5}>
                      <div className={styles.additionalInfo}>
                        <div>
                          <p>
                            <strong>Razão Social:</strong> {row.razaoSocial}
                          </p>
                          <p>
                            <strong>Nome Fantasia:</strong> {row.nomeFantasia}
                          </p>
                          <p>
                            <strong>CNPJ/CPF:</strong> {row.cnpjcpf}
                          </p>
                          <p>
                            <strong>Telefone:</strong> {row.fone1}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Email:</strong> {row.email}
                          </p>
                          <p>
                            <strong>Endereço:</strong> {row.endereco}
                          </p>
                          <p>
                            <strong>Complemento:</strong>{" "}
                            {row.complemento || "Nenhum"}
                          </p>
                          <p>
                            <strong>CEP:</strong> {row.cep || "Não informado"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Município (IBGE):</strong>{" "}
                            {row.municipio.codMunicipio}
                          </p>
                          <p>
                            <strong>Status:</strong> {row.status}
                          </p>
                          <p>
                            <strong>Território:</strong> {row.territorio}
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
          {clientes && clientes.length === 10 ?
          <button onClick={(e)=>{e.preventDefault();setPaginaAtual(paginaAtual+1)}}><FiChevronRight /></button> : null
          }
        </div>
      </div>
    </div>
  );
};

export default ClientesPage;
