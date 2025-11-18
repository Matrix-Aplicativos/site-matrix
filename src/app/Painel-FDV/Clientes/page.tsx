"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchBar from "../../Painel-Coletas/components/SearchBar";
import styles from "./Clientes.module.css";
import useGetClientes from "../hooks/useGetClientes";
import { getCookie } from "cookies-next";
import { getUserFromToken } from "../utils/functions/getUserFromToken";
import useGetLoggedUser from "../hooks/useGetLoggedUser";
import { formatCnpjCpf } from "../utils/functions/formatCnpjCpf";
import { useLoading } from "../../shared/Context/LoadingContext";
import LoadingOverlay from "../../shared/components/LoadingOverlay";
import PaginationControls from "@/app/Painel-Coletas/components/PaginationControls";

// --- Ícones ---
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
// --- Fim Ícones ---

interface Cliente {
  codClienteErp: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjcpf: string | null;
  fone1: string;
  email: string;
  endereco: string;
  complemento?: string;
  cep: string;
  status: string;
  ativo: boolean;
  municipio?: { codMunicipio: string };
  territorio?: { descricao: string };
  rota?: { descricao: string };
  segmento?: { descricao: string };
  classificacao?: { descricao: string };
}

interface ColumnDefinition {
  key: string;
  label: string;
  render?: (value: any, row: Cliente) => React.ReactNode;
}

const FILTER_TO_API_PARAM: Record<string, string> = {
  RazaoSocial: "razaoSocial",
  NomeFantasia: "nomeFantasia",
  cnpjcpf: "cnpjcpf",
  Codigo: "codClienteErp",
};

export default function ClientesPage() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchTopic, setSearchTopic] = useState<string>("RazaoSocial");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const token = getCookie("token");
  const codUsuario = getUserFromToken(String(token));
  const { usuario } = useGetLoggedUser(codUsuario || 0);

  const filtrosParaApi = useMemo(() => {
    const filtros: Record<string, string | boolean> = {};
    if (searchQuery) {
      const apiParamKey = FILTER_TO_API_PARAM[searchTopic];
      if (apiParamKey) {
        filtros[apiParamKey] = searchQuery;
      }
    }
    return filtros;
  }, [searchQuery, searchTopic]);

  const codEmpresaParaBusca =
    usuario && usuario.empresas[0]?.codEmpresa
      ? usuario.empresas[0].codEmpresa
      : 1;
  const isHookEnabled = !!usuario;

  const { clientes, loading, error, qtdPaginas, qtdElementos, refetch } =
    useGetClientes(
      codEmpresaParaBusca,
      paginaAtual,
      porPagina,
      sortConfig?.key,
      sortConfig?.direction,
      filtrosParaApi,
      isHookEnabled
    );

  // --- Definição de Colunas com Render Corrigido ---
  const columns: ColumnDefinition[] = [
    { key: "codClienteErp", label: "Código" },
    { key: "razaoSocial", label: "Razão Social" },
    { key: "nomeFantasia", label: "Nome Fantasia" },
    {
      key: "cnpjcpf",
      label: "CNPJ/CPF",
      render: (value: string | null) => {
        return value ? formatCnpjCpf(value) : "N/A";
      },
    },
    {
      key: "ativo", // Mudei de "status" para "ativo"
      label: "Status",
      render: (value: boolean, row: Cliente) => (
        <span
          className={`${styles.statusBadge} ${
            value === true // Agora verificamos o valor booleano
              ? styles.statusCompleted
              : styles.statusNotStarted
          }`}
        >
          {value === true ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  const getCellValue = (row: Cliente, colKey: string): any => {
    return row[colKey as keyof Cliente] ?? "N/A";
  };

  useEffect(() => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, showLoading, hideLoading]);

  const toggleFilterExpansion = () => {
    setIsFilterExpanded((prev) => !prev);
  };

  const handleSearch = (query: string) => {
    setPaginaAtual(1);
    setSearchQuery(query);
  };

  const handleSort = (key: string) => {
    if (key === "ativo") return; // Agora é "ativo" em vez de "status"

    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPaginaAtual(1);
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setPorPagina(newSize);
    setPaginaAtual(1);
  };

  return (
    <div className={styles.container}>
      <LoadingOverlay />
      <h1 className={styles.title}>CLIENTES</h1>

      <div className={styles.searchContainer}>
        <SearchBar
          placeholder="Qual cliente deseja buscar?"
          onSearch={handleSearch}
          onFilterClick={toggleFilterExpansion}
        />

        <div className={styles.searchActions}>
          <button
            className={styles.actionButton}
            onClick={() => refetch()}
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
              <option value="cnpjcpf">CNPJ/CPF</option>
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
                  onClick={() => handleSort(col.key)}
                  style={{
                    cursor: col.key === "ativo" ? "default" : "pointer", // Atualizado para "ativo"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{col.label}</span>
                    {col.key !== "ativo" && <IconSort />}{" "}
                    {/* Atualizado para "ativo" */}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.isArray(clientes) &&
              clientes.map((row) => (
                <tr key={row.codClienteErp}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(getCellValue(row, col.key), row)
                        : getCellValue(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={columns.length}>
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
}
