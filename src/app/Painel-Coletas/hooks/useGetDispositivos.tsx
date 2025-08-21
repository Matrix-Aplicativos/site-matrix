import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

interface Dispositivo {
  codDispositivo: string;
  nomeDispositivo: string;
  codEmpresaApi: number;
  ativo: boolean;
}

interface UseGetDispositivosHook {
  dispositivos: Dispositivo[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPaginas: number; // ✅ novo campo para total de páginas
}

const useGetDispositivos = (
  codEmpresa: number,
  pagina: number = 1,
  porPagina: number = 5, // ✅ parâmetro porPagina adicionado com valor padrão
  orderBy?: string,
  sortDirection?: "asc" | "desc",
  enabled: boolean = true
): UseGetDispositivosHook => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0); // ✅ estado para total de páginas

  const fetchDispositivos = useCallback(async () => {
    if (!enabled || !codEmpresa) return;

    try {
      setLoading(true);
      setError(null);

      // ✅ Construção dos parâmetros de query igual ao primeiro hook
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) {
        queryParams.append("orderBy", orderBy);
      }

      if (sortDirection) {
        queryParams.append("sortDirection", sortDirection);
      }

      const response = await axiosInstance.get(
        `/dispositivo/${codEmpresa}?${queryParams}`
      );

      const responseData = response.data;

      // ✅ Tratamento consistente com o primeiro hook
      const dados = Array.isArray(responseData.dados)
        ? responseData.dados
        : Array.isArray(responseData)
        ? responseData
        : [];

      setDispositivos(dados);

      // ✅ Cálculo do total de páginas igual ao primeiro hook
      const total = responseData.totalItens
        ? Math.ceil(responseData.totalItens / porPagina)
        : 1;
      setTotalPaginas(total);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
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
  }, [fetchDispositivos, enabled]);

  return {
    dispositivos,
    loading,
    error,
    refetch: fetchDispositivos,
    totalPaginas,
  };
};

export default useGetDispositivos;
