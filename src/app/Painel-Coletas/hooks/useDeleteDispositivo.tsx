import { useState } from "react";
import axiosInstance from "../../shared/axios/axiosInstanceColeta";
import { AxiosError } from "axios";

interface UseDeleteDispositivoHook {
  loading: boolean;
  error: string | null;
  success: boolean;
  deleteDispositivo: (codDispositivo: string) => Promise<void>;
}

const useDeleteDispositivo = (codEmpresa: number): UseDeleteDispositivoHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const deleteDispositivo = async (codDispositivo: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await axiosInstance.delete(`/dispositivo/${codEmpresa}/${codDispositivo}`);
      
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? err.message
          : "Ocorreu um erro ao deletar o dispositivo."
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, deleteDispositivo };
};

export default useDeleteDispositivo;