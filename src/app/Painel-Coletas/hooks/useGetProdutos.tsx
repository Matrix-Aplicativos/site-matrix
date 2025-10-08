// Em seu arquivo hooks/useGetProdutos.tsx

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { Produto } from "../utils/types/Produto";

// --- Interfaces (sem alterações) ---
interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalPaginas: number;
}

interface ApiResponseProdutos {
  conteudo: Produto[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

const useGetProdutos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  sortDirection?: "asc" | "desc",
  descricao?: string,
  enabled: boolean = true
): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);

  const fetchProdutos = useCallback(async () => {
    if (!enabled || !codEmpresa) {
      setProdutos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // --- CORREÇÃO APLICADA AQUI ---
      // Removido o 'new' duplicado que estava causando o erro "is not a constructor".
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (sortDirection) queryParams.append("sortDirection", sortDirection);
      if (descricao) queryParams.append("descricao", descricao);

      const response = await axiosInstance.get<ApiResponseProdutos>(
        `/item/${codEmpresa}?${queryParams}`
      );

      const data = response.data.conteudo;
      if (!Array.isArray(data)) {
        throw new Error(
          "Formato de dados inválido da API: 'conteudo' não é um array."
        );
      }

      setProdutos(data);
      setTotalPaginas(response.data.qtdPaginas || 0);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "Ocorreu um erro ao buscar os produtos.";

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
    sortDirection,
    descricao,
    enabled,
  ]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  return { produtos, loading, error, refetch: fetchProdutos, totalPaginas };
};

export default useGetProdutos;
