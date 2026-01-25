import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { Produto } from "../utils/types/Produto";

interface ApiResponseProdutos {
  conteudo: Produto[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalPaginas: number;
  totalElementos: number;
}

const useGetProdutos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  filtros?: Record<string, string>,
  enabled: boolean = true
): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0);

  const fetchProdutos = useCallback(async () => {
    if (!enabled || !codEmpresa) {
      setProdutos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction);

      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });
      }

      const response = await axiosInstance.get<ApiResponseProdutos>(
        `/item/${codEmpresa}?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data;

      if (!Array.isArray(conteudo)) {
        throw new Error("Formato de dados inválido da API.");
      }

      setProdutos(conteudo);
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro.";
      setError(errorMessage);
      setProdutos(null);
    } finally {
      setLoading(false);
    }
  }, [
    codEmpresa,
    pagina,
    porPagina,
    orderBy,
    direction,
    filtros, 
    enabled,
  ]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  return {
    produtos,
    loading,
    error,
    refetch: fetchProdutos,
    totalPaginas,
    totalElementos,
  };
};

export default useGetProdutos;
