import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { Pedido } from "../utils/types/Pedido";

// Interface para a resposta paginada da API
interface PedidoResponse {
  conteudo: Pedido[];
  paginaAtual: number;
  qtdPaginas: number;
  qtdElementos: number;
}

export const useTotalPedidos = (
  codEmpresa: number | string | undefined,
  periodoIni: string,
  periodoFim: string,
  porPagina: number,
  isHookEnabled: boolean
) => {
  const [totalPedidos, setTotalPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim || !isHookEnabled) {
      setTotalPedidos([]);
      setIsLoading(false);
      return;
    }

    const fetchTotalPedidos = async () => {
      setIsLoading(true);
      try {
        // <-- AJUSTE 1: Tipagem da resposta corrigida
        const response = await axiosInstance.get<PedidoResponse>(
          `/pedido/empresa/${codEmpresa}`,
          {
            params: { periodoIni, periodoFim, porPagina },
          }
        ); // <-- AJUSTE 2: Extrair o array de 'conteudo'
        setTotalPedidos(response.data.conteudo || []); // Usar || [] para segurança
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setTotalPedidos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalPedidos();
  }, [codEmpresa, periodoIni, periodoFim, porPagina, isHookEnabled]);

  return { totalPedidos, isLoading, error };
};
