// Em seu arquivo hooks/useGetUsuarios.tsx

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { UsuarioGet } from "../utils/types/UsuarioGet";

// --- Interfaces (sem alterações) ---
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
}

const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  // --- CORREÇÃO 1: Usando 'orderBy' e adicionando filtros ---
  orderBy?: string,
  sortDirection?: "asc" | "desc",
  filtro?: string, // Para busca textual (ex: 'nome')
  valor?: string, // O texto da busca
  ativo?: boolean, // Para o filtro de status
  enabled: boolean = true
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<UsuarioGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);

  const fetchUsuarios = useCallback(async () => {
    if (!enabled || !codEmpresa) {
      setUsuarios([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      // --- CORREÇÃO 2: Adicionando todos os parâmetros à requisição ---
      if (orderBy) queryParams.append("orderBy", orderBy);
      if (sortDirection) queryParams.append("sortDirection", sortDirection);

      // Filtro de busca textual (dinâmico)
      if (filtro && valor) {
        queryParams.append(filtro, valor);
      }

      // Filtro de status (booleano)
      if (ativo !== undefined) {
        queryParams.append("ativo", String(ativo));
      }

      const response = await axiosInstance.get<ApiResponseUsuarios>(
        `/usuario/empresa/${codEmpresa}?${queryParams}`
      );

      const data = response.data.conteudo;
      if (!Array.isArray(data)) {
        throw new Error(
          "Formato de dados inválido da API: 'conteudo' não é um array."
        );
      }

      setUsuarios(data);
      setTotalPaginas(response.data.qtdPaginas || 0);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : err instanceof Error
          ? err.message
          : "Ocorreu um erro ao buscar os usuários.";

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
    sortDirection,
    filtro,
    valor,
    ativo,
    enabled,
  ]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { usuarios, loading, error, refetch: fetchUsuarios, totalPaginas };
};

export default useGetUsuarios;
