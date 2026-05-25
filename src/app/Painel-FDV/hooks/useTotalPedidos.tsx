import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { PedidoListItem } from "../utils/types/Pedido";

interface PedidoResponse {
  conteudo: PedidoListItem[];
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
  const [totalPedidos, setTotalPedidos] = useState<PedidoListItem[]>([]);
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
        const response = await axiosInstance.get<PedidoResponse>(
          `/pedido/empresa/${codEmpresa}`,
          {
            params: { periodoIni, periodoFim, porPagina },
          }
        );
        setTotalPedidos(response.data.conteudo || []);
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
