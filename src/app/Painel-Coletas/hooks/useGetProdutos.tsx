import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { Produto } from "../utils/types/Produto";

// --- Interfaces ---
interface ApiResponseProdutos {
  conteudo: Produto[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

// --- Interface do Hook (ATUALIZADA) ---
interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalPaginas: number;
  totalElementos: number; // <-- ÚNICA ADIÇÃO LÓGICA
}

// --- Hook (CORRIGIDO PARA MANTER A LÓGICA ORIGINAL) ---
const useGetProdutos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  descricao?: string, // <-- MANTIDO O PARÂMETRO ORIGINAL
  enabled: boolean = true
): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0); // <-- ADICIONADO

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
      if (descricao) queryParams.append("descricao", descricao); // <-- LÓGICA ORIGINAL MANTIDA

      const response = await axiosInstance.get<ApiResponseProdutos>(
        `/item/${codEmpresa}?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data;

      if (!Array.isArray(conteudo)) {
        throw new Error("Formato de dados inválido da API.");
      }

      setProdutos(conteudo);
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0); // <-- ADICIONADO
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
    descricao,
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
    totalElementos, // <-- ADICIONADO
  };
};

export default useGetProdutos;
