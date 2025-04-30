import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";

interface Dispositivo {
  codDispositivo: string;
  nome: string;
  codEmpresaApi: number;
  ativo: boolean;
}

interface UseGetDispositivosHook {
  dispositivos: Dispositivo[] | null;
  loading: boolean;
  error: string | null;
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

  const fetchDispositivos = async () => {
    try {
      setLoading(true);
      const queryParams = [
        `pagina=${pagina}`,
        `porPagina=10`,
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
  };

  useEffect(() => {
    if (codEmpresa) {
      fetchDispositivos();
    }
  }, [codEmpresa, pagina, sortKey, sortDirection]);

  return { dispositivos, loading, error };
};

export default useGetDispositivos;