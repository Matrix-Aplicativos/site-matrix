import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";
import { Pedido } from "../utils/types/Pedido";

interface UseGetPedidosHook {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
}

const useGetPedidos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc"
): UseGetPedidosHook => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const queryParams = [
        `pagina=${pagina}`,
        `porPagina=${porPagina}`,
        sortKey ? `sortKey=${sortKey}` : null,
        sortDirection ? `sortDirection=${sortDirection}` : null,
      ]
        .filter(Boolean)
        .join("&");

      const response = await axiosInstance.get(
        `/pedido/${codEmpresa}?${queryParams}`
      );

      setPedidos(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao buscar os pedidos."
      );
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codEmpresa) {
      fetchPedidos();
    }
  }, [codEmpresa, pagina, sortKey, sortDirection]);

  return { pedidos, loading, error };
};

export default useGetPedidos;
