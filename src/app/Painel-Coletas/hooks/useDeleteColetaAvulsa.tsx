import { useState } from "react";
import axiosInstance from "../../../app/shared/axios/axiosInstanceColeta";

const useDeleteColetaAvulsa = () => {
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deletarColeta = async ( codColeta: number) => {
    setLoading(true);
    setError(null);
    console.log("Deletando coleta: ", codColeta);

    try {
      await axiosInstance.delete(`coleta/${codColeta}`);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erro ao finalizar Coleta";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    deletarColeta,
    loading,
    error,
  };
};

export default useDeleteColetaAvulsa;
