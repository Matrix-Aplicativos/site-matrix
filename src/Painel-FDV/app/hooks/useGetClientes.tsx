import { useState, useEffect } from "react";
import axiosInstance from "@/shared/axios/axiosInstanceFDV";
import { AxiosError } from "axios";
import { Rota } from "../utils/types/Rota";
import { Segmento } from "../utils/types/Segmento";
import { Classificacao } from "../utils/types/Classificacao";

interface Cliente {
  codIntegracao: number;
  codEmpresaApi: number;
  codClienteApi: number;
  codClienteErp: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjcpf: string;
  fone1: string;
  fone2: string;
  email: string;
  bairro: string;
  endereco: string;
  complemento: string;
  cep: string;
  limiteCredito: number;
  status: string;
  tipo: number;
  rota: Rota;
  segmento: Segmento;
  classificacao: Classificacao;
  areceber: [
    {
      id: {
        numDocumento: number;
        numParcela: number;
      };
      observacao: string;
      dataLancamento: string;
      dataVencimento: string;
      valor: number;
      dataCadastro: string;
      dataUltimaAlteracao: string;
    }
  ];
  ativo: true;
}

interface UseGetClientesHook {
  clientes: Cliente[] | null;
  loading: boolean;
  error: string | null;
}

const useGetClientes = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc"
): UseGetClientesHook => {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
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
        `/cliente/empresa/${codEmpresa}?${queryParams}`
      );
      setClientes(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao buscar os clientes."
      );
      setClientes(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codEmpresa) {
      fetchClientes();
    }
  }, [codEmpresa, pagina, porPagina, sortKey, sortDirection]);

  return { clientes, loading, error };
};

export default useGetClientes;
