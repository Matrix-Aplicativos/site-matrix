import { useState, useCallback } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

interface ItemPost {
  codItem: number;
  quantidade: number;
}

interface PostColetaPayload {
  codColeta: number;
  codEmpresa: number;
  tipo: number;
  descricao: string;
  codUsuario: number;
  codAlocEstoqueOrigem: number;
  codAlocEstoqueDestino: number;
  itens: ItemPost[];
}

interface UsePostColetaResult {
  postColeta: (payload: PostColetaPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const usePostColetaSobDemanda = (): UsePostColetaResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const postColeta = useCallback(async (payload: PostColetaPayload) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

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

  return {
    postColeta,
    loading,
    error,
    success,
  };
};

export default usePostColetaSobDemanda;
