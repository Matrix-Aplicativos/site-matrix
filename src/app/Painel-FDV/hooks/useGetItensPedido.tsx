import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
import {
  ItemPedidoDetalhado,
  mapPedidoItensPainel,
  PedidoItemPainelApi,
} from "../utils/types/PedidoItemPainel";

interface ApiResponse {
  conteudo: PedidoItemPainelApi[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

interface UseGetItensPedidoHook {
  itens: ItemPedidoDetalhado[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalPaginas: number;
  totalElementos: number;
}

const useGetItensPedido = (
  codPedido: number,
  pagina: number = 1,
  porPagina: number = 5,
  enabled: boolean = true
): UseGetItensPedidoHook => {
  const [itens, setItens] = useState<ItemPedidoDetalhado[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(0);
  const [totalElementos, setTotalElementos] = useState<number>(0);

  const fetchItens = useCallback(async () => {
    if (!codPedido || !enabled) {
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

      const response = await axiosInstance.get<ApiResponse>(
        `/pedido/${codPedido}/itens?${queryParams}`
      );

      const { conteudo, qtdPaginas, qtdElementos } = response.data;

      setItens(mapPedidoItensPainel(conteudo ?? []));
      setTotalPaginas(qtdPaginas || 0);
      setTotalElementos(qtdElementos || 0);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Ocorreu um erro ao buscar os itens do pedido.";
      setError(errorMessage);
      setItens(null);
    } finally {
      setLoading(false);
    }
  }, [codPedido, pagina, porPagina, enabled]);

  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  return {
    itens,
    loading,
    error,
    refetch: fetchItens,
    totalPaginas,
    totalElementos,
  };
};

export default useGetItensPedido;
export type { ItemPedidoDetalhado };
