// hooks/useGetUsuarios.ts (ATUALIZADO)

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { UsuarioGet } from "../utils/types/UsuarioGet";

interface ApiResponseUsuarios {
  conteudo: UsuarioGet[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

interface UseGetUsuariosHook {
  usuarios: UsuarioGet[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalPaginas: number;
  totalElementos: number;
}

const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  // ALTERADO: Em vez de 'filtro' e 'valor', agora aceitamos um objeto genérico
  filtros?: Record<string, string | boolean>,
  enabled: boolean = true
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<UsuarioGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0);

  const fetchUsuarios = useCallback(async () => {
    if (!enabled || !codEmpresa) {
      setUsuarios([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction);

      // ADICIONADO: Lógica para adicionar dinamicamente os filtros à URL
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          // Checa se o valor não é nulo ou indefinido antes de adicionar
          if (value !== null && value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }

      const response = await axiosInstance.get<ApiResponseUsuarios>(
        `/usuario/empresa/${codEmpresa}?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data;

      if (!Array.isArray(conteudo)) {
        throw new Error("Formato de dados inválido da API.");
      }

      setUsuarios(conteudo);
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro.";
      setError(errorMessage);
      setUsuarios(null);
    } finally {
      setLoading(false);
    }
  }, [
    codEmpresa,
    pagina,
    porPagina,
    orderBy,
    direction,
    filtros, // ALTERADO: A dependência agora é o objeto de filtros
    enabled,
  ]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios,
    totalPaginas,
    totalElementos,
  };
};

export default useGetUsuarios;
