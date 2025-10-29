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
  const [isLoading, setIsLoading] = useState<boolean>(false); // <-- CORREÇÃO: Iniciar com false
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Esta guarda é essencial e está correta.
    // Se não tiver codEmpresa, ele para e o isLoading continua 'false'.
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchTotalPedidos = async () => {
      setIsLoading(true); // Fica 'true' apenas quando a busca *começa*
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
