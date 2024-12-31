import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance"; 

interface Produto {
  codItem: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
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
