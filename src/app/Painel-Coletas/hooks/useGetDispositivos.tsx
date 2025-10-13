import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// --- Interfaces (sem alterações) ---
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

// --- Interface do Hook (ATUALIZADA) ---
interface UseGetDispositivosHook {
  dispositivos: Dispositivo[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPaginas: number;
  totalElementos: number; // <-- ADICIONADO
}

// --- Hook (ATUALIZADO) ---
const useGetDispositivos = (
  codEmpresa: number,
  pagina: number = 1,
  porPagina: number = 20,
  orderBy?: string,
  direction?: "asc" | "desc",
  enabled: boolean = true
): UseGetDispositivosHook => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0); // <-- ADICIONADO

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
      if (direction) queryParams.append("direction", direction);

      const response = await axiosInstance.get<ApiResponseDispositivos>(
        `/dispositivo/${codEmpresa}?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data;

      if (!Array.isArray(conteudo)) {
        throw new Error(
          "Formato de dados inválido da API: 'conteudo' não é um array."
        );
      }
      setDispositivos(conteudo || []);
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0); // <-- ADICIONADO
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
  }, [codEmpresa, pagina, porPagina, orderBy, direction, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchDispositivos();
    }
  }, [fetchDispositivos]);

  // --- Retorno do Hook (ATUALIZADO) ---
  return {
    dispositivos,
    loading,
    error,
    refetch: fetchDispositivos,
    totalPaginas,
    totalElementos, // <-- ADICIONADO
  };
};

export default useGetDispositivos;
