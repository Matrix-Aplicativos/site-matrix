import { useState } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import type { EditarColetaRequest } from "../utils/types/Coleta";

const usePutEditarColeta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editarColeta = async (payload: EditarColetaRequest) => {
    setLoading(true);
    setError(null);
    try {
      // codEmpresa não é enviado no payload
      await axiosInstance.put("/coleta", payload);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erro ao editar coleta";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { editarColeta, loading, error };
};

export default usePutEditarColeta;
