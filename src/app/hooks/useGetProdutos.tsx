import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance"; 

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
  imagens: any[]; 
}

interface UseGetProdutosHook {
  produtos: Produto[] | null;
  loading: boolean;
  error: string | null;
}

const useGetProdutos = (codEmpresa: number): UseGetProdutosHook => {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/item/${codEmpresa}`);
        setProdutos(response.data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro ao buscar os produtos."
        );
        setProdutos(null);
      } finally {
        setLoading(false);
      }
    };

    if (codEmpresa) {
      fetchProdutos();
    }
  }, [codEmpresa]);

  return { produtos, loading, error };
};

export default useGetProdutos;