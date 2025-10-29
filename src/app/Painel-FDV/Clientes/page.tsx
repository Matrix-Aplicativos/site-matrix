"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../../Painel-Coletas/components/SearchBar";
import styles from "./Clientes.module.css";
import useGetClientes from "../hooks/useGetClientes"; // Hook atualizado
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
// [REMOVIDO] import { FaSort } from "react-icons/fa";
import { formatCnpjCpf } from "../utils/functions/formatCnpjCpf";
import { formatTelefone } from "../utils/functions/formatTelefone";
import { formatCep } from "../utils/functions/formatCep";
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

// A interface Cliente pode ser movida para um arquivo 'types'
interface Cliente {
  codClienteErp: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjcpf: string;
  fone1: string;
  email: string;
  endereco: string;
  complemento: string;
  cep: string;
  status: string;
  municipio: { codMunicipio: string };
  territorio?: { descricao: string };
  rota?: { descricao: string };
  segmento?: { descricao: string };
  classificacao?: { descricao: string };
}

const ClientesPage: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // [MODIFICADO] Adicionado "refetch" para seguir o padrão do botão "Atualizar"
  const { clientes, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetClientes(
      usuario?.empresas[0]?.codEmpresa || 1,
      paginaAtual,
      porPagina,
      sortConfig?.key,
      sortConfig?.direction
    );

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Cliente[]>([]); // Tipagem ajustada
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [searchTopic, setSearchTopic] = useState<string>("RazaoSocial");

  useEffect(() => {
    if (clientes) {
      setFilteredData(clientes); // Atualiza dados filtrados
    }
  }, [clientes]);

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
    setPaginaAtual(1); // Reseta a página

    if (clientes) {
      const filtered = clientes.filter((cliente: Cliente) => {
        const searchValue = searchQuery.toLowerCase();
        switch (searchTopic) {
          case "RazaoSocial":
            return cliente.razaoSocial.toLowerCase().includes(searchValue);
          case "NomeFantasia":
            return cliente.nomeFantasia.toLowerCase().includes(searchValue);
          case "CnpjCpf":
            return (
              cliente.cnpjcpf?.toString().toLowerCase().includes(searchValue) ??
              false
            );
          case "Codigo":
            return cliente.codClienteErp.toString().includes(searchValue);
          default:
            return false;
        }
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
    setPorPagina(newSize);
    setPaginaAtual(1); // Reseta para a página 1
  };

  const columns = [
    { key: "codClienteErp", label: "Código" },
    { key: "razaoSocial", label: "Razão Social" },
    { key: "nomeFantasia", label: "Nome Fantasia" },
    { key: "cnpjcpf", label: "CNPJ/CPF" },
  ];

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>CLIENTES</h1>

      {/* [NOVO] Estrutura de search container + actions do padrão */}
      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual cliente deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />
        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => refetch()} // Assumindo que o hook provê refetch
            title="Atualizar clientes"
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
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
            >
              <option value="RazaoSocial">Razão Social</option>
              <option value="NomeFantasia">Nome Fantasia</option>
              <option value="CnpjCpf">CNPJ/CPF</option>
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
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  {/* [MODIFICADO] Padrão de ícone de sort */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    <IconSort />
                  </div>
                </th>
              ))}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredData) &&
              filteredData.map((row, rowIndex) => (
                <React.Fragment key={row.codClienteErp}>
                  <tr
                    className={
                      row.status === "A" // Assumindo 'A' como Ativo
                        ? styles.statusActive
                        : styles.statusInactive
                    }
                  >
                    <td>{row.codClienteErp}</td>
                    <td>{row.razaoSocial}</td>
                    <td>{row.nomeFantasia}</td>
                    <td>{formatCnpjCpf(row.cnpjcpf)}</td>
                    <td>
                      <button
                        className={styles.expandButton}
                        onClick={() => toggleExpandRow(rowIndex)}
                      >
                        {expandedRow === rowIndex ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === rowIndex && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={columns.length + 1}>
                        <div className={styles.additionalInfo}>
                          <div>
                            <p>
                              <strong>Razão Social:</strong> {row.razaoSocial}
                            </p>
                            <p>
                              <strong>Nome Fantasia:</strong> {row.nomeFantasia}
                            </p>
                            <p>
                              <strong>CNPJ/CPF:</strong>{" "}
                              {formatCnpjCpf(row.cnpjcpf)}
                            </p>
                            <p>
                              <strong>Telefone:</strong>{" "}
                              {formatTelefone(row.fone1)}
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
                              <strong>CEP:</strong>{" "}
                              {formatCep(row.cep) || "Não informado"}
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
                              <strong>Território:</strong>{" "}
                              {row.territorio?.descricao ?? "N/A"}
                            </p>
                            <p>
                              <strong>Rota:</strong>{" "}
                              {row.rota?.descricao ?? "N/A"}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Segmento:</strong>{" "}
                              {row.segmento?.descricao ?? "N/A"}
                            </p>
                            <p>
                              <strong>Classificação:</strong>{" "}
                              {row.classificacao?.descricao ?? "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={columns.length + 1}>
                <PaginationControls
                  paginaAtual={paginaAtual}
                  totalPaginas={qtdPaginas || 1}
                  totalElementos={qtdElementos || 0}
                  porPagina={porPagina}
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

export default ClientesPage;
