import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { getClienteCodigo, PedidoListItem } from "../utils/types/Pedido";

interface PedidoResponse {
  conteudo: PedidoListItem[];
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
          .map((item) => getClienteCodigo(item))
          .filter((id): id is number | string => id !== null && id !== "");

        const clientesUnicos = new Set(
          clientesIds.map((id) => String(id))
        );
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
