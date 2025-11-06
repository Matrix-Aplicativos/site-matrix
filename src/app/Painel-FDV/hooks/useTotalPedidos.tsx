import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { Pedido } from "../utils/types/Pedido";

export const useTotalPedidos = (
  codEmpresa: number | string | undefined,
  periodoIni: string,
  periodoFim: string,
  porPagina: number,
  isHookEnabled: boolean // <-- 1. ARGUMENTO ADICIONADO
) => {
  const [totalPedidos, setTotalPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 2. GUARDA ATUALIZADA
    if (!codEmpresa || !periodoIni || !periodoFim || !isHookEnabled) {
      setTotalPedidos([]); // Limpa os dados se estiver desabilitado
      setIsLoading(false);
      return;
    }

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
  }, [codEmpresa, periodoIni, periodoFim, porPagina, isHookEnabled]); // <-- 3. DEPENDÊNCIA ADICIONADA

  return { totalPedidos, isLoading, error };
};
