import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { Pedido } from "../utils/types/Pedido";

export const useTotalPedidos = (codEmpresa, periodoIni, periodoFim, porPagina) => {
  const [totalPedidos, setTotalPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchTotalPedidos = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/pedido/empresa/${codEmpresa}`, {
          params: { periodoIni, periodoFim, porPagina },
        });
        setTotalPedidos(response.data)

      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        setError(err);
        setTotalPedidos(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalPedidos();
  }, [codEmpresa, periodoIni, periodoFim]);

  return { totalPedidos, isLoading, error };
};
