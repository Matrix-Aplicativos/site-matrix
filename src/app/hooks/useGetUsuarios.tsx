import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";
import { Usuario } from "../utils/types/Usuario";

interface UseGetUsuariosHook {
  usuarios: Usuario[] | null;
  loading: boolean;
  error: string | null;
}

const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc"
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
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
        `/usuario/empresa/${codEmpresa}?${queryParams}`
      );
      setUsuarios(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao buscar os usuários."
      );
      setUsuarios(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codEmpresa) {
      fetchUsuarios();
    }
  }, [codEmpresa, pagina, sortKey, sortDirection]);

  return { usuarios, loading, error };
};

export default useGetUsuarios;