import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// --- Interfaces de Tipagem ---

interface UsuarioBipagem {
  codUsuario: number;
  nome: string;
  cpf: string;
}

interface Lote {
  numLote: string;
  dataValidade: string;
  dataFabricacao: string;
  qtdItens: number;
}

export interface ItemConferenciaDetalhado {
  codItem: number;
  codItemCadastro: number; // Adicionado com base no JSON
  codConferencia: number;
  codIntegracao: number;
  codEmpresa: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
  qtdAConferir: number;
  qtdConferida: number;
  usuarioBipagem: UsuarioBipagem | null;
  dataHoraBipe: string | null;
  utilizaLote: boolean;
  utilizaNumSerie: boolean;
  lotes: Lote[];
  numerosSerie: string[];
}

// Interface para a resposta completa da API
interface ApiResponse {
  conteudo: ItemConferenciaDetalhado[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

// Hook atualizado para retornar também os dados de paginação
interface UseGetColetaItensHook {
  itens: ItemConferenciaDetalhado[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPaginas: number;
  totalElementos: number;
}

/**
 * Hook para buscar os itens detalhados de uma coleta específica com paginação.
 * @param codColeta - O código da conferência/coleta da qual buscar os itens.
 * @param pagina - O número da página a ser buscada.
 * @param porPagina - A quantidade de itens por página.
 * @param enabled - Se `false`, o hook não fará a busca automaticamente.
 */
const useGetColetaItens = (
  codColeta: number,
  pagina: number = 1,
  porPagina: number = 5,
  enabled: boolean = true
): UseGetColetaItensHook => {
  const [itens, setItens] = useState<ItemConferenciaDetalhado[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para armazenar os dados de paginação
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0);

  const fetchItens = useCallback(async () => {
    if (!codColeta || !enabled) {
      setItens(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        pagina: pagina.toString(),
        porPagina: porPagina.toString(),
      });

      // --- CAMINHO ALTERADO ---
      const response = await axiosInstance.get<ApiResponse>(
        `/coleta/${codColeta}/itens-painel?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data;

      // --- LÓGICA DE EXTRAÇÃO CORRIGIDA ---
      // Agora lê diretamente da propriedade "conteudo" e define um array vazio como fallback
      setItens(conteudo || []);

      // Armazena os dados de paginação no estado
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os itens da coleta.";
      setError(errorMessage);
      setItens(null);
    } finally {
      setLoading(false);
    }
  }, [codColeta, pagina, porPagina, enabled]);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  // Retorna os novos estados de paginação
  return {
    itens,
    loading,
    error,
    refetch: fetchItens,
    totalPaginas,
    totalElementos,
  };
};

export default useGetColetaItens;
