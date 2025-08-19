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
}

const useGetDispositivos = (
  codEmpresa: number,
  pagina: number,
  orderBy?: string,
  sortDirection?: "asc" | "desc",
  enabled: boolean = true // ✅ novo parâmetro opcional
): UseGetDispositivosHook => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDispositivos = useCallback(async () => {
    if (!enabled || !codEmpresa) return; // ✅ controle de execução

    try {
      setLoading(true);
      const queryParams = [
        `pagina=${pagina}`,
        `porPagina=5`,
        orderBy ? `orderBy=${orderBy}` : null,
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
  }, [codEmpresa, pagina, orderBy, sortDirection, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchDispositivos();
    }
  }, [fetchDispositivos, enabled]);

  return { dispositivos, loading, error, refetch: fetchDispositivos };
};

export default useGetDispositivos;
