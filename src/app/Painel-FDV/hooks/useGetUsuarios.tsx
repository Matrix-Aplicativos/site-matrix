// hooks/useGetUsuarios.ts

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
// A importação agora traz a interface com 'codFuncionario'
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
  totalPaginas: number; // Renomeado de 'qtdPaginas' para consistência
  totalElementos: number; // Renomeado de 'qtdElementos' para consistência
}

const useGetUsuarios = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  orderBy?: string,
  direction?: "asc" | "desc",
  filtros?: Record<string, string | boolean>, // Parâmetro para filtros
  enabled: boolean = true // Para habilitar/desabilitar a busca
): UseGetUsuariosHook => {
  const [usuarios, setUsuarios] = useState<UsuarioGet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0);

  const fetchUsuarios = useCallback(async () => {
    // Não busca se não estiver habilitado ou se a empresa não foi carregada
    if (!enabled || !codEmpresa) {
      setUsuarios([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Constrói os parâmetros da query
      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      }); // Adiciona ordenação

      if (orderBy) queryParams.append("orderBy", orderBy);
      if (direction) queryParams.append("direction", direction); // --- LÓGICA DE FILTRO ADICIONADA ---

      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          // Adiciona o filtro apenas se ele tiver um valor
          if (value !== null && value !== undefined && value !== "") {
            queryParams.append(key, String(value));
          }
        });
      } // --- FIM DA LÓGICA DE FILTRO --- // Faz a requisição
      const response = await axiosInstance.get<ApiResponseUsuarios>(
        `/usuario/empresa/${codEmpresa}?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data; // Validação de segurança

      if (!Array.isArray(conteudo)) {
        throw new Error("Formato de dados inválido da API.");
      }

      setUsuarios(conteudo);
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os usuários.";
      setError(errorMessage);
      setUsuarios(null);
      setTotalPaginas(0);
      setTotalElementos(0);
    } finally {
      setLoading(false);
    } // Dependências do useCallback: a função será recriada se qualquer um destes mudar
  }, [codEmpresa, pagina, porPagina, orderBy, direction, filtros, enabled]); // useEffect que dispara a busca

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]); // Dispara sempre que a função 'fetchUsuarios' for recriada

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
