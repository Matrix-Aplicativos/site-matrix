import { useState, useEffect } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceFDV";
import { Pedido } from "../utils/types/Pedido";

export const useTotalClientes = (
  codEmpresa: number | string,
  periodoIni: string,
  periodoFim: string,
  porPagina: number
) => {
  const [totalClientes, setTotalClientes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchTotalClientes = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get<Pedido[]>(
          `/pedido/empresa/${codEmpresa}`,
          {
            params: { periodoIni, periodoFim, porPagina },
          }
        );

        const clientesUnicos = new Set(
          response.data.map((pedido: Pedido) => pedido.codCliente)
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
  }, [codEmpresa, periodoIni, periodoFim, porPagina]);

  return { totalClientes, isLoading, error };
};
