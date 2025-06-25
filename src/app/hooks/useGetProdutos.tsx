import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";

interface Produto {
  codItemApi: number;
  codIntegracao: number;
  codEmpresaApi: number;
  codItemErp: string;
  descricaoItem: string;
  descricaoMarca: string;
  codBarra: string;
  codReferencia: string;
  codFabricante: string;
  grupo: string;
  subGrupo: string;
  familia: string;
  departamento: string;
  unidade: string;
  precoVenda: number;
  precoRevenda: number;
  precoPromocao: number;
  custo: number;
  dataInicioPromocao: string;
  dataFimPromocao: string;
  saldoDisponivel: number;
  porcentagemDescontoMax: number;
  imagens: [
    {
      codImagem: number;
      nome: string;
    }
  ];
  ativo: true;
}

interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
}

const useGetProdutos = (
  codEmpresa: number,
  pagina: number,
  porPagina: number,
  sortKey?: string,
  sortDirection?: "asc" | "desc"
): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProdutos = async () => {
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
        `/item/empresa/${codEmpresa}?${queryParams}`
      );
      setProdutos(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao buscar os produtos."
      );
      setProdutos(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codEmpresa) {
      fetchProdutos();
    }
  }, [codEmpresa, pagina, porPagina, sortKey, sortDirection]);

  return { produtos, loading, error };
};

export default useGetProdutos;
