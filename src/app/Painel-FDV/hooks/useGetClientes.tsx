import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
import { Rota } from "../utils/types/Rota";
import { Segmento } from "../utils/types/Segmento";
import { Classificacao } from "../utils/types/Classificacao";

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

interface UseGetClientesHook {
  clientes: Cliente[] | null;
  loading: boolean;
  error: string | null;
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
  refetch: () => void;
}

const useGetClientes = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  filtros?: Record<string, string | boolean>,
  enabled: boolean = true
): UseGetClientesHook => {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiPaginaAtual, setApiPaginaAtual] = useState(1);
  const [apiQtdPaginas, setApiQtdPaginas] = useState(1);
  const [apiQtdElementos, setApiQtdElementos] = useState(0);

  const fetchClientes = useCallback(async () => {
    if (!enabled || !codEmpresa) {
      setClientes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true); 
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction); 
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await axiosInstance.get(
        `/cliente/empresa/${codEmpresa}?${queryParams}`
      ); 

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
    } 
  }, [codEmpresa, pagina, porPagina, orderBy, direction, filtros, enabled]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]); 

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

export default useGetClientes;
