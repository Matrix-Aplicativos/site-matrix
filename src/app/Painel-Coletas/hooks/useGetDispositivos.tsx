// Em seu arquivo hooks/useGetDispositivos.tsx
// NENHUMA ALTERAÇÃO NECESSÁRIA AQUI. O CÓDIGO JÁ ESTÁ CORRETO.

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

interface Dispositivo {
  codDispositivo: string;
  nomeDispositivo: string;
  codEmpresaApi: number;
  ativo: boolean;
}

interface ApiResponseDispositivos {
  conteudo: Dispositivo[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

interface UseGetDispositivosHook {
  dispositivos: Dispositivo[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPaginas: number;
}

const useGetDispositivos = (
  codEmpresa: number,
  pagina: number = 1,
  porPagina: number = 20,
  orderBy?: string,
  sortDirection?: "asc" | "desc",
  enabled: boolean = true
): UseGetDispositivosHook => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);

  const fetchDispositivos = useCallback(async () => {
    if (!enabled || !codEmpresa) return;

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });
      if (orderBy) queryParams.append("orderBy", orderBy);
      if (sortDirection) queryParams.append("sortDirection", sortDirection);

      const response = await axiosInstance.get<ApiResponseDispositivos>(
        `/dispositivo/${codEmpresa}?${queryParams}`
      );

      const dados = response.data.conteudo;
      if (!Array.isArray(dados)) {
        throw new Error(
          "Formato de dados inválido da API: 'conteudo' não é um array."
        );
      }
      setDispositivos(dados);
      setTotalPaginas(response.data.qtdPaginas || 0);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "Ocorreu um erro ao buscar os dispositivos.";
      setError(errorMessage);
      setDispositivos(null);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, porPagina, orderBy, sortDirection, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchDispositivos();
    }
  }, [fetchDispositivos]);

  return {
    dispositivos,
    loading,
    error,
    refetch: fetchDispositivos,
    totalPaginas,
  };
};

export default useGetDispositivos;
