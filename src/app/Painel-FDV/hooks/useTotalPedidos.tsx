import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { Pedido } from "../utils/types/Pedido";

export const useTotalPedidos = (
  codEmpresa: number | string,
  periodoIni: string,
  periodoFim: string,
  porPagina: number
) => {
  const [totalPedidos, setTotalPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchTotalPedidos = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get<Pedido[]>(
          `/pedido/empresa/${codEmpresa}`,
          {
            params: { periodoIni, periodoFim, porPagina },
          }
        );
        setTotalPedidos(response.data);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setTotalPedidos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalPedidos();
  }, [codEmpresa, periodoIni, periodoFim, porPagina]);

  return { totalPedidos, isLoading, error };
};
