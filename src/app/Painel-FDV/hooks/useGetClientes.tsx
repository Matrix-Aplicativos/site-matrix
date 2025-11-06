// hooks/useGetClientes.ts

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
// (Interfaces Rota, Segmento, Classificacao, Cliente... sem alteração)
import { Rota } from "../utils/types/Rota";
import { Segmento } from "../utils/types/Segmento";
import { Classificacao } from "../utils/types/Classificacao";

interface Cliente {
  codClienteErp: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjCpf: string | null;
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

interface UseGetClientesHook {
  clientes: Cliente[] | null;
  loading: boolean;
  error: string | null;
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
  refetch: () => void;
}

// --- [INÍCIO DA ALTERAÇÃO] ---
const useGetClientes = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc", // 1. Adicionar parâmetros de filtro e 'enabled'
  filtros?: Record<string, string | boolean>,
  enabled: boolean = true
): UseGetClientesHook => {
  // ... (states 'clientes', 'loading', 'error' sem alteração) ...
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  const fetchClientes = useCallback(async () => {
    // 2. Adicionar 'guard clause' para evitar busca desnecessária
    if (!enabled || !codEmpresa) {
      setClientes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true); // 3. Mudar para URLSearchParams para construir a query
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction); // 4. Adicionar a lógica de filtros
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await axiosInstance.get(
        `/cliente/empresa/${codEmpresa}?${queryParams}`
      ); // ... (O resto da sua lógica de 'responseData' está perfeita) ...

      const responseData = response.data;

      if (
        !responseData ||
        typeof responseData.conteudo === "undefined" ||
        !Array.isArray(responseData.conteudo)
      ) {
        throw new Error(
          "Formato de dados inválido da API. 'conteudo' não foi encontrado."
        );
      }

      setClientes(responseData.conteudo);
      setApiPaginaAtual(responseData.paginaAtual || 1);
      setApiQtdPaginas(responseData.qtdPaginas || 1);
      setApiQtdElementos(responseData.qtdElementos || 0);
      setError(null);
    } catch (err) {
      // ... (Sua lógica de erro está perfeita) ...
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os clientes.";
      setError(errorMessage);
      setClientes(null);
      setApiPaginaAtual(1);
      setApiQtdPaginas(1);
      setApiQtdElementos(0);
    } finally {
      setLoading(false);
    } // 5. Adicionar 'filtros' e 'enabled' ao array de dependências
  }, [codEmpresa, pagina, porPagina, orderBy, direction, filtros, enabled]);

  useEffect(() => {
    // 6. Simplificar o useEffect
    fetchClientes();
  }, [fetchClientes]); // Dispara sempre que 'fetchClientes' (e suas dependências) mudar

  return {
    clientes,
    loading,
    error,
    paginaAtual: apiPaginaAtual,
    qtdPaginas: apiQtdPaginas,
    qtdElementos: apiQtdElementos,
    refetch: fetchClientes,
  };
};
// --- [FIM DA ALTERAÇÃO] ---

export default useGetClientes;
