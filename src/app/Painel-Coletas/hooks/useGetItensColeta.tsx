import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

// Interfaces baseadas no seu JSON

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
  usuarioBipagem: UsuarioBipagem | null; // Pode ser nulo se não bipado
  dataHoraBipe: string | null; // Pode ser nulo se não bipado
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
 * Hook para buscar os itens detalhados de uma coleta específica.
 * @param codColeta - O código da conferência/coleta da qual buscar os itens.
 * @param enabled - Se `false`, o hook não fará a busca automaticamente. Padrão é `true`.
 */
const useGetColetaItens = (
  codColeta: number,
  enabled: boolean = true
): UseGetColetaItensHook => {
  const [itens, setItens] = useState<ItemConferenciaDetalhado[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItens = useCallback(async () => {
    // Não executa se não houver codColeta ou se estiver desabilitado
    if (!codColeta || !enabled) {
      setItens(null); // Limpa os itens se desabilitado
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/coleta/${codColeta}/itens`);

      const responseData = response.data;
      // Trata tanto respostas que são o array diretamente quanto as que vêm em um campo "dados"
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
  }, [codColeta, enabled]);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  return { itens, loading, error, refetch: fetchItens };
};

export default useGetColetaItens;
