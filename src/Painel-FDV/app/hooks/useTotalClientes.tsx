import { useState, useEffect } from "react";
import axiosInstance from "@/shared/axios/axiosInstanceFDV";
import { Pedido } from "../utils/types/Pedido";

export const useTotalClientes = (codEmpresa, periodoIni, periodoFim, porPagina) => {
  const [totalClientes, setTotalClientes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!codEmpresa || !periodoIni || !periodoFim) return;

    const fetchTotalClientes = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/pedido/empresa/${codEmpresa}`, {
          params: { periodoIni, periodoFim, porPagina },
        });

        // Criar um conjunto (Set) para armazenar apenas IDs únicos de clientes
        const clientesUnicos = new Set(response.data.map((pedido: Pedido) => pedido.codCliente));

        setTotalClientes(clientesUnicos.size);
      } catch (err) {
        console.error("Erro ao buscar clientes:", err);
        setError(err);
        setTotalClientes(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalClientes();
  }, [codEmpresa, periodoIni, periodoFim]);

  return { totalClientes, isLoading, error };
};
