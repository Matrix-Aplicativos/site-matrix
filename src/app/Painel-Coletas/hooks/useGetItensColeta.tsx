import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// Suas interfaces permanecem as mesmas
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

interface UseGetColetaItensHook {
  itens: ItemConferenciaDetalhado[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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

      const response = await axiosInstance.get(
        `/coleta/${codColeta}/itens?${queryParams}`
      );

      const responseData = response.data;
      // Lógica para extrair os dados, seja de um campo "dados" ou do corpo da resposta
      const dados = Array.isArray(responseData.dados)
        ? responseData.dados
        : Array.isArray(responseData)
        ? responseData
        : [];

      setItens(dados);
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

  return { itens, loading, error, refetch: fetchItens };
};

export default useGetColetaItens;
