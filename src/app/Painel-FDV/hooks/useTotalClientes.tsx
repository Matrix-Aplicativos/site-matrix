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

export const useTotalClientes = (
  codEmpresa: number | string | undefined,
  periodoIni: string,
  periodoFim: string,
  porPagina: number,
  isHookEnabled: boolean
) => {
  const [totalClientes, setTotalClientes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim || !isHookEnabled) {
      setTotalClientes(0);
      setIsLoading(false);
      return;
    }

    const fetchTotalClientes = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get<PedidoResponse>(
          `/pedido/empresa/${codEmpresa}`,
          {
            params: { periodoIni, periodoFim, porPagina },
          }
        );

        const pedidos = response.data.conteudo || [];

        const clientesIds = pedidos
          .map((pedido: Pedido) => {
            if (pedido.codCliente && pedido.codCliente > 0) {
              return pedido.codCliente;
            }
            if (pedido.cliente?.codCliente && pedido.cliente.codCliente > 0) {
              return pedido.cliente.codCliente;
            }
            return null;
          })
          .filter((id): id is number => id !== null && id > 0);

        const clientesUnicos = new Set(clientesIds);

        setTotalClientes(clientesUnicos.size);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setTotalClientes(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalClientes();
  }, [codEmpresa, periodoIni, periodoFim, porPagina, isHookEnabled]);

  return { totalClientes, isLoading, error };
};
