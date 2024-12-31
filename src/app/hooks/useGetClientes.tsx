import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance"; 

interface Cliente {
  codCliente: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface UseGetClientesHook {
  clientes: Cliente[] | null;
  loading: boolean;
  error: string | null;
}

const useGetClientes = (codEmpresa: number): UseGetClientesHook => {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/clientes/${codEmpresa}`);
        setClientes(response.data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro ao buscar os clientes."
        );
        setClientes(null);
      } finally {
        setLoading(false);
      }
    };

    if (codEmpresa) {
      fetchClientes();
    }
  }, [codEmpresa]);

  return { clientes, loading, error };
};

export default useGetClientes;