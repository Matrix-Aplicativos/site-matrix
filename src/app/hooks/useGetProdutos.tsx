import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance"; 
import { AxiosError } from "axios";

interface Produto {
  codItem: number;
  nome: string;
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
  dataInicioPromocao: string;
  dataFimPromocao: string;
  saldoDisponivel: number;
  porcentagemDescontoMax: number;
  imagens: string[]; 
}

interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
}

const useGetProdutos = (codEmpresa: number,pagina: number): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/item/${codEmpresa}?pagina=${pagina}&porPagina=10`);
      setProdutos(response.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof AxiosError ? err.message : "Ocorreu um erro ao buscar os produtos."
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
  }, [codEmpresa,pagina]);

  return { produtos, loading, error };
};

export default useGetProdutos;