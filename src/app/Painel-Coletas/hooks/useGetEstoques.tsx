// src/app/inventarios/hooks/useGetEstoques.ts

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";

// Interface ATUALIZADA para corresponder ao JSON da sua API
export interface Estoque {
  codAlocEstoqueApi: number;
  codIntegracao: number;
  codEmpresaApi: number;
  codAlocEstoqueErp: string;
  descricao: string;
}

interface UseGetEstoquesResult {
  estoques: Estoque[];
  loading: boolean;
  error: string | null;
}

const useGetEstoques = (codEmpresa: number): UseGetEstoquesResult => {
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstoques = useCallback(async () => {
    if (!codEmpresa) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // O caminho do endpoint está correto
      const response = await axiosInstance.get<Estoque[]>(
        `/alocacao-estoque/${codEmpresa}`
      );

      // A resposta da API já é um array, então podemos usá-la diretamente
      setEstoques(response.data || []);
    } catch (err) {
      setError("Não foi possível carregar os locais de estoque.");
      console.error("Erro ao buscar estoques:", err);
    } finally {
      setLoading(false);
    }
  }, [codEmpresa]);

  useEffect(() => {
    fetchEstoques();
  }, [fetchEstoques]);

  return { estoques, loading, error };
};

export default useGetEstoques;
