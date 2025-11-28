import { useState, useCallback } from "react";

import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

interface ItemPost {
  codItem: number;
  quantidade: number;
}

interface PostColetaPayload {
  codColeta: null;
  codEmpresa: number;
  tipo: number;
  descricao: string;
  codUsuario: number;
  codAlocEstoqueOrigem: number;
  codAlocEstoqueDestino: number;
  codPlanoConta?: number; 
  itens: ItemPost[];
}

interface UsePostColetaResult {
  postColeta: (payload: PostColetaPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

const usePostColetaSobDemanda = (): UsePostColetaResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const postColeta = useCallback(async (payload: PostColetaPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await axiosInstance.post("/coleta/cadastro/sob-demanda", payload);
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message
          : "Erro ao cadastrar a coleta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    postColeta,
    loading,
    error,
    success,
    reset,
  };
};

export default usePostColetaSobDemanda;
