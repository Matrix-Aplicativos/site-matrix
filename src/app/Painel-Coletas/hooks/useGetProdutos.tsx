import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta"; // Ajuste o caminho se necessário
import { AxiosError } from "axios";
import { Produto } from "../utils/types/Produto";

interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useGetProdutos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc",
  enabled: boolean = true // Para não fazer a chamada até que o codEmpresa esteja pronto
): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProdutos = useCallback(async () => {
    if (!enabled) {
      setProdutos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = [
        `pagina=${pagina}`,
        `porPagina=${porPagina}`,
        sortKey ? `sortKey=${sortKey}` : null,
        sortDirection ? `sortDirection=${sortDirection}` : null,
      ]
        .filter(Boolean)
        .join("&");

      const response = await axiosInstance.get(
        `/item/${codEmpresa}?${queryParams}`
      );

      const data = response.data.data || response.data;

      if (!Array.isArray(data)) {
        throw new Error("Formato de dados inválido da API");
      }

      setProdutos(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os produtos.";

      setError(errorMessage);
      setProdutos(null);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, porPagina, sortKey, sortDirection, enabled]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  return { produtos, loading, error, refetch: fetchProdutos };
};

export default useGetProdutos;
