import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

interface Municipio {
  codMunicipio: string;
  uf: string;
  nome: string;
  dataCadastro: string;
  dataUltimaAlteracao: string;
}

interface Cliente {
  codEmpresa: number;
  codCliente: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjcpf: string;
  fone1: string;
  fone2: string | null;
  email: string;
  municipio: Municipio;
  bairro: string;
  endereco: string;
  complemento: string | null;
  cep: string;
  limiteCredito: number;
  status: string | null;
  territorio: number;
  vendedorResponsavel: string | null;
  areceber: any[]; 
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
        const response = await axiosInstance.get(`/cliente/${codEmpresa}`);
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
