import { useState, useEffect, useCallback } from "react";
import axiosInstance from "./axiosInstanceFDV";
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
}

const useGetDispositivos = (
  codEmpresa: number,
  pagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc"
): UseGetDispositivosHook => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDispositivos = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = [
        `pagina=${pagina}`,
        `porPagina=5`,
        sortKey ? `sortKey=${sortKey}` : null,
        sortDirection ? `sortDirection=${sortDirection}` : null,
      ]
        .filter(Boolean)
        .join("&");

      const response = await axiosInstance.get(
        `/dispositivo/${codEmpresa}?${queryParams}`
      );
      setDispositivos(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao buscar os dispositivos."
      );
      setDispositivos(null);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, sortKey, sortDirection]);

  useEffect(() => {
    if (codEmpresa) {
      fetchDispositivos();
    }
  }, [codEmpresa, pagina, sortKey, sortDirection, fetchDispositivos]);

  return { dispositivos, loading, error, refetch: fetchDispositivos };
};

export default useGetDispositivos;