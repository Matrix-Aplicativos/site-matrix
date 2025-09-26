import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { UsuarioGet } from "../utils/types/UsuarioGet";

interface UseGetUsuariosHook {
  usuarios: UsuarioGet[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc",
  // Adicionado o sexto parâmetro `enabled`
  enabled: boolean = true
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<UsuarioGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    // A flag `enabled` impede a chamada da API antes da hora
    if (!enabled) {
      setUsuarios([]); // Limpa os dados se não estiver habilitado
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
        `/usuario/empresa/${codEmpresa}?${queryParams}`
      );

      const data = response.data.data || response.data;

      if (!Array.isArray(data)) {
        throw new Error("Formato de dados inválido da API");
      }

      setUsuarios(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os usuários.";

      setError(errorMessage);
      setUsuarios(null);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa, pagina, porPagina, sortKey, sortDirection, enabled]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { usuarios, loading, error, refetch: fetchUsuarios };
};

export default useGetUsuarios;
