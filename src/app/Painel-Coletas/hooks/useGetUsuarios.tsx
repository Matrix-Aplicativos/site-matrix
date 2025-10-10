import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";
import { UsuarioGet } from "../utils/types/UsuarioGet";

// --- Interfaces ---
interface ApiResponseUsuarios {
  conteudo: UsuarioGet[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

// --- Interface do Hook (ATUALIZADA) ---
interface UseGetUsuariosHook {
  usuarios: UsuarioGet[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalPaginas: number;
  totalElementos: number; // <-- ADICIONADO
}

// --- Hook (CORRIGIDO) ---
const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  filtro?: string,
  valor?: string,
  ativo?: boolean,
  enabled: boolean = true
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<UsuarioGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0); // <-- ADICIONADO

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
      if (filtro && valor) queryParams.append(filtro, valor);
      if (ativo !== undefined) queryParams.append("ativo", String(ativo));

      const response = await axiosInstance.get<ApiResponseUsuarios>(
        `/usuario/empresa/${codEmpresa}?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data;

      if (!Array.isArray(conteudo)) {
        throw new Error("Formato de dados inválido da API.");
      }

      setUsuarios(conteudo);
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0); // <-- ADICIONADO
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
    filtro,
    valor,
    ativo,
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
    totalElementos, // <-- ADICIONADO
  };
};

export default useGetUsuarios;
