import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstanceFDV";
import { AxiosError } from "axios";
import { UsuarioGet } from "../utils/types/UsuarioGet";

interface UseGetUsuariosHook {
  usuarios: UsuarioGet[] | null;
  loading: boolean;
  error: string | null;
}

const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc"
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<UsuarioGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
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

      // Verifica diferentes estruturas de resposta
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
  };

  useEffect(() => {
    if (codEmpresa) {
      fetchUsuarios();
    }
  }, [codEmpresa, pagina, porPagina, sortKey, sortDirection]);

  return { usuarios, loading, error };
};

export default useGetUsuarios;
